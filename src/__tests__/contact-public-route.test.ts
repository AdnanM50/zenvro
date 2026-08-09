jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      json(data: unknown, init?: { status?: number }) {
        return new Response(data as BodyInit, {
          status: init?.status ?? 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  };
});

jest.mock('@/lib/auth', () => ({
  verifyAccessToken: jest.fn(),
}));

jest.mock('@/models/user.model', () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock('@/models/contact-message.model', () => ({
  ContactMessageModel: {
    create: jest.fn(),
  },
}));

jest.mock('@/lib/mail', () => ({
  sendContactNotification: jest.fn(),
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ContactMessageModel } from '@/models/contact-message.model';
import { sendContactNotification } from '@/lib/mail';
import { POST } from '@/app/api/contact/route';

const registeredUser = { _id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user', status: 'active' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? null : options.token;
  return {
    url: options.url || 'http://localhost/api/contact',
    method: options.method || 'POST',
    cookies: {
      get: (name: string) =>
        token && name === 'access_token' ? { value: token } : undefined,
    },
    json: async () => options.body ?? {},
  } as unknown as NextRequest;
}

async function parseResponse(res: Response) {
  return { status: res.status, body: await res.json() };
}

const validBody = {
  name: '  Jane Doe  ',
  email: '  Jane@Example.com  ',
  subject: 'Sizing',
  message: 'Do you ship worldwide?',
};

describe('Public Contact API Route (POST /api/contact)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ body: { ...validBody, name: '' } }));
    const { status, body } = await parseResponse(res);
    expect(status).toBe(400);
    expect(body.error).toBe('Name is required');
  });

  it('returns 400 when name is not a string', async () => {
    const res = await POST(makeRequest({ body: { ...validBody, name: 42 } }));
    const { status, body } = await parseResponse(res);
    expect(status).toBe(400);
    expect(body.error).toBe('Name is required');
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ body: { ...validBody, email: '' } }));
    const { status, body } = await parseResponse(res);
    expect(status).toBe(400);
    expect(body.error).toBe('A valid email address is required');
  });

  it('returns 400 for an invalid email format', async () => {
    const res = await POST(makeRequest({ body: { ...validBody, email: 'not-an-email' } }));
    const { status, body } = await parseResponse(res);
    expect(status).toBe(400);
    expect(body.error).toBe('A valid email address is required');
  });

  it('returns 400 when message is missing', async () => {
    const res = await POST(makeRequest({ body: { ...validBody, message: '   ' } }));
    const { status, body } = await parseResponse(res);
    expect(status).toBe(400);
    expect(body.error).toBe('Message is required');
  });

  it('returns 400 when message exceeds 5000 characters', async () => {
    const res = await POST(makeRequest({ body: { ...validBody, message: 'x'.repeat(5001) } }));
    const { status, body } = await parseResponse(res);
    expect(status).toBe(400);
    expect(body.error).toBe('Message cannot exceed 5000 characters');
  });

  it('returns 400 when subject exceeds 200 characters', async () => {
    const res = await POST(makeRequest({ body: { ...validBody, subject: 'x'.repeat(201) } }));
    const { status, body } = await parseResponse(res);
    expect(status).toBe(400);
    expect(body.error).toBe('Subject cannot exceed 200 characters');
  });

  it('creates the message as a guest (unauthorized user) when no token is present', async () => {
    const created = { _id: 'c1', name: 'Jane Doe', isRegistered: false };
    (ContactMessageModel.create as jest.Mock).mockResolvedValue(created);
    (sendContactNotification as jest.Mock).mockResolvedValue(undefined);

    const res = await POST(makeRequest({ body: validBody, token: null }));
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.data).toEqual(created);
    expect(ContactMessageModel.create).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'Jane@Example.com',
      subject: 'Sizing',
      message: 'Do you ship worldwide?',
      userId: undefined,
      isRegistered: false,
    });
    expect(sendContactNotification).toHaveBeenCalledWith(created);
  });

  it('creates the message as a registered user when a valid token is present', async () => {
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'u1', email: 'alice@test.com', role: 'user' });
    (UserModel.findById as jest.Mock).mockResolvedValue(registeredUser);
    const created = { _id: 'c2', name: 'Jane Doe', isRegistered: true, userId: 'u1' };
    (ContactMessageModel.create as jest.Mock).mockResolvedValue(created);
    (sendContactNotification as jest.Mock).mockResolvedValue(undefined);

    const res = await POST(makeRequest({ body: validBody, token: 'valid-token' }));
    const { status } = await parseResponse(res);

    expect(status).toBe(201);
    expect(ContactMessageModel.create).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'Jane@Example.com',
      subject: 'Sizing',
      message: 'Do you ship worldwide?',
      userId: 'u1',
      isRegistered: true,
    });
  });

  it('falls back to guest when the token is invalid', async () => {
    (verifyAccessToken as jest.Mock).mockReturnValue(null);
    const created = { _id: 'c3', name: 'Jane Doe', isRegistered: false };
    (ContactMessageModel.create as jest.Mock).mockResolvedValue(created);
    (sendContactNotification as jest.Mock).mockResolvedValue(undefined);

    const res = await POST(makeRequest({ body: validBody, token: 'garbage' }));
    const { status } = await parseResponse(res);

    expect(status).toBe(201);
    expect(ContactMessageModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: undefined, isRegistered: false })
    );
  });

  it('falls back to guest when the token user no longer exists', async () => {
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'ghost', email: 'x@x.com', role: 'user' });
    (UserModel.findById as jest.Mock).mockResolvedValue(null);
    const created = { _id: 'c4', name: 'Jane Doe', isRegistered: false };
    (ContactMessageModel.create as jest.Mock).mockResolvedValue(created);
    (sendContactNotification as jest.Mock).mockResolvedValue(undefined);

    const res = await POST(makeRequest({ body: validBody, token: 'valid-token' }));
    const { status } = await parseResponse(res);

    expect(status).toBe(201);
    expect(ContactMessageModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: undefined, isRegistered: false })
    );
  });

  it('still succeeds (201) when the admin notification email fails', async () => {
    const created = { _id: 'c5', name: 'Jane Doe' };
    (ContactMessageModel.create as jest.Mock).mockResolvedValue(created);
    (sendContactNotification as jest.Mock).mockRejectedValue(new Error('smtp down'));

    const res = await POST(makeRequest({ body: validBody }));
    const { status } = await parseResponse(res);

    expect(status).toBe(201);
  });

  it('returns 500 when the model throws', async () => {
    (ContactMessageModel.create as jest.Mock).mockRejectedValue(new Error('db down'));

    const res = await POST(makeRequest({ body: validBody }));
    const { status } = await parseResponse(res);

    expect(status).toBe(500);
  });
});
