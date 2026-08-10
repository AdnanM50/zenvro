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

jest.mock('@/models/sitemap.model', () => ({
  SitemapModel: {
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
    countItems: jest.fn(),
    regenerate: jest.fn(),
    findAllItems: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { SitemapModel } from '@/models/sitemap.model';
import { GET, PATCH } from '@/app/api/admin/seo/sitemap/route';
import { GET as GET_ITEMS } from '@/app/api/admin/seo/sitemap/items/route';

const adminUser = { _id: 'admin-1', role: 'admin' };

function makeRequest(options: { url?: string; method?: string; body?: unknown; token?: string | null } = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/seo/sitemap',
    cookies: {
      get: (name: string) => (token && name === 'access_token' ? { value: token } : undefined),
    },
    json: async () => options.body ?? {},
  } as unknown as NextRequest;
}

async function parseResponse(res: any) {
  return { status: res.status, body: await res.json() };
}

describe('Sitemap API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'admin-1', role: 'admin' });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/seo/sitemap', () => {
    it('returns sitemap config and counts', async () => {
      (SitemapModel.getConfig as jest.Mock).mockResolvedValue({ enabled: true });
      (SitemapModel.countItems as jest.Mock).mockResolvedValue({ total: 10 });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.data.config.enabled).toBe(true);
    });
  });

  describe('PATCH /api/admin/seo/sitemap', () => {
    it('regenerates sitemap when regenerate flag is true', async () => {
      (SitemapModel.regenerate as jest.Mock).mockResolvedValue({ count: 15 });
      (SitemapModel.getConfig as jest.Mock).mockResolvedValue({ enabled: true });
      (SitemapModel.countItems as jest.Mock).mockResolvedValue({ total: 15 });

      const res = await PATCH(makeRequest({ body: { regenerate: true } }));
      const { status } = await parseResponse(res);
      expect(status).toBe(200);
      expect(SitemapModel.regenerate).toHaveBeenCalled();
    });
  });

  describe('GET /api/admin/seo/sitemap/items', () => {
    it('lists sitemap items', async () => {
      (SitemapModel.findAllItems as jest.Mock).mockResolvedValue([{ url: 'https://zenvro.com' }]);

      const res = await GET_ITEMS(makeRequest({ url: 'http://localhost/api/admin/seo/sitemap/items' }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.data.length).toBe(1);
    });
  });
});
