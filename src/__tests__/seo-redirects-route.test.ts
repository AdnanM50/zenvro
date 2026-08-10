jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      json(data: any, init?: { status?: number }) {
        const res = Object.create(Response.prototype);
        res.status = init?.status ?? 200;
        res.json = async () => data;
        return res;
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

jest.mock('@/models/redirect.model', () => ({
  RedirectModel: {
    findPaginated: jest.fn(),
    findByFrom: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { RedirectModel } from '@/models/redirect.model';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/seo/redirects/route';

const adminUser = { _id: 'admin-1', role: 'admin' };

function makeRequest(options: { url?: string; method?: string; body?: unknown; token?: string | null } = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/seo/redirects',
    cookies: {
      get: (name: string) => (token && name === 'access_token' ? { value: token } : undefined),
    },
    json: async () => options.body ?? {},
  } as unknown as NextRequest;
}

async function parseResponse(res: any) {
  return { status: res.status, body: await res.json() };
}

describe('Redirects API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'admin-1', role: 'admin' });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/seo/redirects', () => {
    it('returns paginated redirects', async () => {
      (RedirectModel.findPaginated as jest.Mock).mockResolvedValue({ redirects: [], total: 0 });
      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);
      expect(status).toBe(200);
    });
  });

  describe('POST /api/admin/seo/redirects', () => {
    it('returns 400 if from/to are missing', async () => {
      const res = await POST(makeRequest({ body: { from: '' } }));
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it('creates redirect successfully', async () => {
      (RedirectModel.findByFrom as jest.Mock).mockResolvedValue(null);
      (RedirectModel.create as jest.Mock).mockResolvedValue({ _id: 'r1', from: '/old', to: '/new' });

      const res = await POST(makeRequest({ body: { from: '/old', to: '/new' } }));
      const { status } = await parseResponse(res);
      expect(status).toBe(201);
    });
  });

  describe('DELETE /api/admin/seo/redirects', () => {
    it('deletes redirect by _id', async () => {
      (RedirectModel.delete as jest.Mock).mockResolvedValue(true);
      const res = await DELETE(makeRequest({ url: 'http://localhost/api/admin/seo/redirects?_id=r1' }));
      const { status } = await parseResponse(res);
      expect(status).toBe(200);
    });
  });
});
