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

jest.mock('@/models/robots.model', () => ({
  RobotsModel: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { RobotsModel } from '@/models/robots.model';
import { GET, PUT } from '@/app/api/admin/seo/robots/route';

const adminUser = { _id: 'admin-1', role: 'admin' };

function makeRequest(options: { method?: string; body?: unknown; token?: string | null } = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    cookies: {
      get: (name: string) => (token && name === 'access_token' ? { value: token } : undefined),
    },
    json: async () => options.body ?? {},
  } as unknown as NextRequest;
}

async function parseResponse(res: any) {
  return { status: res.status, body: await res.json() };
}

describe('Robots API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'admin-1', role: 'admin' });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/seo/robots', () => {
    it('returns robots.txt content', async () => {
      (RobotsModel.get as jest.Mock).mockResolvedValue({ content: 'User-agent: *\nAllow: /' });
      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.data.content).toContain('User-agent');
    });
  });

  describe('PUT /api/admin/seo/robots', () => {
    it('returns 400 if content is not a string', async () => {
      const res = await PUT(makeRequest({ body: { content: 123 } }));
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it('updates robots.txt content', async () => {
      (RobotsModel.update as jest.Mock).mockResolvedValue({ content: 'User-agent: googlebot' });
      const res = await PUT(makeRequest({ body: { content: 'User-agent: googlebot' } }));
      const { status } = await parseResponse(res);
      expect(status).toBe(200);
      expect(RobotsModel.update).toHaveBeenCalledWith('User-agent: googlebot', 'admin-1');
    });
  });
});
