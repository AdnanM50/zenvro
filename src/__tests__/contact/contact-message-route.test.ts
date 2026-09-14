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
    findById: jest.fn(),
    findPaginated: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    countByStatus: jest.fn(),
  },
}));

jest.mock('@/lib/mail', () => ({
  sendContactReplyEmail: jest.fn(),
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ContactMessageModel } from '@/models/contact-message.model';
import { sendContactReplyEmail } from '@/lib/mail';
import { GET, PATCH, DELETE } from '@/app/api/admin/contact/route';
import { GET as GET_STATS } from '@/app/api/admin/contact/stats/route';

const adminUser = { _id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: 'admin' };
const regularUser = { _id: 'u2', name: 'User', email: 'user@test.com', role: 'user' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/contact',
    method: options.method || 'GET',
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

describe('Admin Contact API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'admin-1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/contact', () => {
    it('returns 401 when token is missing', async () => {
      const res = await GET(makeRequest({ token: null }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(401);
      expect(body.error).toBe('Not authenticated');
    });

    it('returns 401 when token is invalid', async () => {
      (verifyAccessToken as jest.Mock).mockReturnValue(null);
      const res = await GET(makeRequest({ token: 'garbage' }));
      const { status } = await parseResponse(res);
      expect(status).toBe(401);
    });

    it('returns 403 when a non-admin user requests messages', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(regularUser);
      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(403);
      expect(body.error).toBe('Forbidden');
    });

    it('returns paginated messages on a valid admin request', async () => {
      const mockList = [{ _id: 'c1', name: 'Jane' }];
      (ContactMessageModel.findPaginated as jest.Mock).mockResolvedValue({
        messages: mockList,
        total: 1,
      });

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/admin/contact?page=1&limit=10&search=Jane&status=new' })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual(mockList);
      expect(body.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
      expect(ContactMessageModel.findPaginated).toHaveBeenCalledWith(1, 10, {
        search: 'Jane',
        status: 'new',
      });
    });

    it('ignores an invalid status filter', async () => {
      (ContactMessageModel.findPaginated as jest.Mock).mockResolvedValue({
        messages: [],
        total: 0,
      });

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/admin/contact?status=spam' })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ContactMessageModel.findPaginated).toHaveBeenCalledWith(1, 20, {
        search: undefined,
        status: undefined,
      });
    });

    it('clamps page/limit into valid ranges', async () => {
      (ContactMessageModel.findPaginated as jest.Mock).mockResolvedValue({
        messages: [],
        total: 0,
      });

      await GET(makeRequest({ url: 'http://localhost/api/admin/contact?page=0&limit=99999' }));

      expect(ContactMessageModel.findPaginated).toHaveBeenCalledWith(1, 100, {
        search: undefined,
        status: undefined,
      });
    });

    it('returns 500 when the model throws', async () => {
      (ContactMessageModel.findPaginated as jest.Mock).mockRejectedValue(new Error('db down'));
      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);
      expect(status).toBe(500);
    });
  });

  describe('GET /api/admin/contact/stats', () => {
    it('returns 401 when token is missing', async () => {
      const res = await GET_STATS(makeRequest({ token: null }));
      const { status } = await parseResponse(res);
      expect(status).toBe(401);
    });

    it('returns contact stats for an admin', async () => {
      const stats = { total: 10, new: 6, answered: 4, registered: 3, guest: 7 };
      (ContactMessageModel.countByStatus as jest.Mock).mockResolvedValue(stats);

      const res = await GET_STATS(makeRequest({ url: 'http://localhost/api/admin/contact/stats' }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual(stats);
    });
  });

  describe('PATCH /api/admin/contact', () => {
    it('returns 401 when token is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', token: null }));
      const { status } = await parseResponse(res);
      expect(status).toBe(401);
    });

    it('returns 400 if _id is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { status: 'answered' } }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 404 if the message is not found', async () => {
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(null);
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { _id: 'c999' } }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(404);
      expect(body.error).toBe('Contact message not found');
    });

    it('returns 400 for an empty reply', async () => {
      const existing = { _id: 'c1', email: 'jane@example.com', name: 'Jane' };
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(existing);
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { _id: 'c1', reply: '   ' } }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toBe('Reply cannot be empty');
      expect(sendContactReplyEmail).not.toHaveBeenCalled();
    });

    it('returns 400 when reply exceeds 10000 characters', async () => {
      const existing = { _id: 'c1', email: 'jane@example.com', name: 'Jane' };
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(existing);
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', reply: 'x'.repeat(10001) } })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toBe('Reply cannot exceed 10000 characters');
    });

    it('returns 400 for an invalid status', async () => {
      const existing = { _id: 'c1', email: 'jane@example.com', name: 'Jane' };
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(existing);
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', status: 'spam' } })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toBe('Status must be new or answered');
    });

    it('returns 400 when no update is provided', async () => {
      const existing = { _id: 'c1', email: 'jane@example.com', name: 'Jane' };
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(existing);
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { _id: 'c1' } }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toBe('No update provided');
    });

    it('emails the reply, stores it, and marks the message answered', async () => {
      const existing = { _id: 'c1', email: 'jane@example.com', name: 'Jane', subject: 'Sizing' };
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(existing);
      (sendContactReplyEmail as jest.Mock).mockResolvedValue(undefined);
      (ContactMessageModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', reply: '  Thanks for writing!  ' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.message).toBe('Reply sent and message marked as answered');
      expect(sendContactReplyEmail).toHaveBeenCalledWith(existing, 'Thanks for writing!');
      expect(ContactMessageModel.update).toHaveBeenCalledWith(
        'c1',
        { reply: 'Thanks for writing!' },
        'admin-1'
      );
    });

    it('updates the status without sending an email', async () => {
      const existing = { _id: 'c1', email: 'jane@example.com', name: 'Jane' };
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(existing);
      (ContactMessageModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', status: 'answered' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.message).toBe('Contact message updated');
      expect(sendContactReplyEmail).not.toHaveBeenCalled();
      expect(ContactMessageModel.update).toHaveBeenCalledWith(
        'c1',
        { status: 'answered' },
        'admin-1'
      );
    });

    it('returns 500 when the reply email fails', async () => {
      const existing = { _id: 'c1', email: 'jane@example.com', name: 'Jane' };
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(existing);
      (sendContactReplyEmail as jest.Mock).mockRejectedValue(new Error('smtp down'));

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', reply: 'Hello' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(500);
      expect(body.error).toBe('Reply could not be emailed. Please try again.');
      expect(ContactMessageModel.update).not.toHaveBeenCalled();
    });

    it('returns 404 if the message disappears between fetch and update', async () => {
      const existing = { _id: 'c1', email: 'jane@example.com', name: 'Jane' };
      (ContactMessageModel.findById as jest.Mock).mockResolvedValue(existing);
      (sendContactReplyEmail as jest.Mock).mockResolvedValue(undefined);
      (ContactMessageModel.update as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', reply: 'Hello' } })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(404);
      expect(body.error).toBe('Contact message not found');
    });
  });

  describe('DELETE /api/admin/contact', () => {
    it('returns 401 when token is missing', async () => {
      const res = await DELETE(makeRequest({ token: null }));
      const { status } = await parseResponse(res);
      expect(status).toBe(401);
    });

    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 404 when the message to delete is not found', async () => {
      (ContactMessageModel.delete as jest.Mock).mockResolvedValue(false);
      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/admin/contact?_id=c999' })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(404);
      expect(body.error).toBe('Contact message not found');
    });

    it('deletes the message and returns 200 on success', async () => {
      (ContactMessageModel.delete as jest.Mock).mockResolvedValue(true);
      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/admin/contact?_id=c1' })
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.message).toBe('Contact message deleted');
      expect(ContactMessageModel.delete).toHaveBeenCalledWith('c1');
    });
  });
});
