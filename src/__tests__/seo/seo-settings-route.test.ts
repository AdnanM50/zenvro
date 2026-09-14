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

jest.mock('@/models/seo-settings.model', () => ({
  SeoSettingsModel: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { SeoSettingsModel } from '@/models/seo-settings.model';
import { GET, PATCH } from '@/app/api/admin/seo/settings/route';

const adminUser = { _id: 'admin-1', role: 'admin' };
const regularUser = { _id: 'u2', role: 'user' };

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

describe('SEO Settings API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'admin-1', role: 'admin' });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/seo/settings', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await GET(makeRequest({ token: null }));
      const { status } = await parseResponse(res);
      expect(status).toBe(401);
    });

    it('returns 403 when non-admin', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(regularUser);
      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);
      expect(status).toBe(403);
    });

    it('returns SEO settings for admin', async () => {
      const mockSettings = { siteName: 'VELOUR', defaultTitle: 'VELOUR | Fashion' };
      (SeoSettingsModel.get as jest.Mock).mockResolvedValue(mockSettings);

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockSettings);
    });
  });

  describe('PATCH /api/admin/seo/settings', () => {
    it('updates SEO settings for admin', async () => {
      const updated = { siteName: 'VELOUR PRO', defaultTitle: 'New Title' };
      (SeoSettingsModel.update as jest.Mock).mockResolvedValue(updated);

      const res = await PATCH(makeRequest({ body: { siteName: 'VELOUR PRO' } }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(updated);
    });
  });
});
