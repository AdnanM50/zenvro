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
    countByStatus: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { GET } from '@/app/api/admin/users/stats/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };
const stats = { total: 42, admins: 2, users: 40, active: 30, inactive: 8, blocked: 4 };

function makeRequest(options: { token?: string | null } = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: 'http://localhost/api/admin/users/stats',
    method: 'GET',
    cookies: {
      get: (name: string) =>
        token && name === 'access_token' ? { value: token } : undefined,
    },
    json: async () => ({}),
  } as unknown as NextRequest;
}

async function parseResponse(res: Response) {
  return { status: res.status, body: await res.json() };
}

describe('Users Stats API Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  it('returns 401 when no token is present', async () => {
    const res = await GET(makeRequest({ token: null }));
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it('returns 401 for an invalid token', async () => {
    (verifyAccessToken as jest.Mock).mockReturnValue(null);
    const res = await GET(makeRequest());
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it('returns 403 for a non-admin user', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ ...adminUser, role: 'user' });
    const res = await GET(makeRequest());
    const { status, body } = await parseResponse(res);
    expect(status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('returns the registered user counts', async () => {
    (UserModel.countByStatus as jest.Mock).mockResolvedValue(stats);
    const res = await GET(makeRequest());
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(stats);
    expect(UserModel.countByStatus).toHaveBeenCalledTimes(1);
  });

  it('returns zeros when there are no users', async () => {
    const empty = { total: 0, admins: 0, users: 0, active: 0, inactive: 0, blocked: 0 };
    (UserModel.countByStatus as jest.Mock).mockResolvedValue(empty);
    const res = await GET(makeRequest());
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data).toEqual(empty);
  });

  it('returns 500 when the model throws', async () => {
    (UserModel.countByStatus as jest.Mock).mockRejectedValue(new Error('db down'));
    const res = await GET(makeRequest());
    const { status } = await parseResponse(res);
    expect(status).toBe(500);
  });
});
