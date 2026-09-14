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
    findPaginated: jest.fn(),
    updateRole: jest.fn(),
    updateStatus: jest.fn(),
    deleteById: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { GET, PATCH, DELETE } from '@/app/api/admin/users/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };
const regularUser = {
  _id: 'u2',
  name: 'Bob',
  email: 'bob@test.com',
  role: 'user',
  status: 'active',
  addresses: [],
  wishlist: [],
  createdAt: new Date('2026-01-01'),
};

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/users',
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

describe('Users API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('auth guards', () => {
    it('returns 401 when no token is present', async () => {
      const res = await GET(makeRequest({ token: null }));
      const { status } = await parseResponse(res);
      expect(status).toBe(401);
    });

    it('returns 401 for an invalid token', async () => {
      (verifyAccessToken as jest.Mock).mockReturnValue(null);
      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(401);
      expect(body.error).toBeTruthy();
    });

    it('returns 403 when the token user does not exist', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);
      expect(status).toBe(403);
    });

    it('returns 403 for a non-admin user', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({ ...adminUser, role: 'user' });
      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(403);
      expect(body.success).toBe(false);
    });
  });

  describe('GET', () => {
    it('returns the paginated user list with default params', async () => {
      (UserModel.findPaginated as jest.Mock).mockResolvedValue({
        users: [regularUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual([regularUser]);
      expect(body.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
      expect(UserModel.findPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        status: undefined,
        role: undefined,
      });
    });

    it('passes search/status/role filters from query params', async () => {
      (UserModel.findPaginated as jest.Mock).mockResolvedValue({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await GET(
        makeRequest({
          url: 'http://localhost/api/admin/users?search=bob&status=blocked&role=user',
        }),
      );

      expect(UserModel.findPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'bob',
        status: 'blocked',
        role: 'user',
      });
    });

    it('clamps page and limit to valid ranges', async () => {
      (UserModel.findPaginated as jest.Mock).mockResolvedValue({
        users: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      await GET(makeRequest({ url: 'http://localhost/api/admin/users?page=0&limit=999' }));

      expect(UserModel.findPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        search: '',
        status: undefined,
        role: undefined,
      });
    });

    it('returns 500 when the model throws', async () => {
      (UserModel.findPaginated as jest.Mock).mockRejectedValue(new Error('db down'));
      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);
      expect(status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('returns 400 when userId is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { role: 'admin' } }));
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it('returns 400 when neither role nor status is provided', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { userId: 'u2' } }));
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it('returns 400 for an invalid role', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { userId: 'u2', role: 'superadmin' } }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it('returns 400 for an invalid status', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { userId: 'u2', status: 'deleted' } }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it('returns 404 when the target user does not exist (role)', async () => {
      (UserModel.updateRole as jest.Mock).mockResolvedValue(false);
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { userId: 'nope', role: 'admin' } }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(404);
    });

    it('returns 404 when the target user does not exist (status)', async () => {
      (UserModel.updateStatus as jest.Mock).mockResolvedValue(false);
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { userId: 'nope', status: 'blocked' } }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(404);
    });

    it('updates a user role successfully', async () => {
      (UserModel.updateRole as jest.Mock).mockResolvedValue(true);
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { userId: 'u2', role: 'admin' } }),
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(UserModel.updateRole).toHaveBeenCalledWith('u2', 'admin');
    });

    it('updates a user status successfully', async () => {
      (UserModel.updateStatus as jest.Mock).mockResolvedValue(true);
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { userId: 'u2', status: 'blocked' } }),
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(UserModel.updateStatus).toHaveBeenCalledWith('u2', 'blocked');
    });

    it('applies both role and status when both are sent', async () => {
      (UserModel.updateRole as jest.Mock).mockResolvedValue(true);
      (UserModel.updateStatus as jest.Mock).mockResolvedValue(true);
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { userId: 'u2', role: 'admin', status: 'inactive' } }),
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(UserModel.updateRole).toHaveBeenCalledWith('u2', 'admin');
      expect(UserModel.updateStatus).toHaveBeenCalledWith('u2', 'inactive');
    });

    it('returns 500 when the model throws', async () => {
      (UserModel.updateRole as jest.Mock).mockRejectedValue(new Error('db down'));
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { userId: 'u2', role: 'admin' } }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('returns 400 when userId is missing', async () => {
      const res = await DELETE(makeRequest({ method: 'DELETE' }));
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it('refuses to delete the admin themselves', async () => {
      const res = await DELETE(
        makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/users?userId=u1' }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it('returns 404 when the user does not exist', async () => {
      (UserModel.deleteById as jest.Mock).mockResolvedValue(false);
      const res = await DELETE(
        makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/users?userId=nope' }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(404);
    });

    it('deletes a user successfully', async () => {
      (UserModel.deleteById as jest.Mock).mockResolvedValue(true);
      const res = await DELETE(
        makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/users?userId=u2' }),
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(UserModel.deleteById).toHaveBeenCalledWith('u2');
    });

    it('returns 500 when the model throws', async () => {
      (UserModel.deleteById as jest.Mock).mockRejectedValue(new Error('db down'));
      const res = await DELETE(
        makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/users?userId=u2' }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(500);
    });
  });
});
