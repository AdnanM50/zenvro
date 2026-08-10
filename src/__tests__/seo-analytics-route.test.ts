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

jest.mock('@/models/analytics-settings.model', () => ({
  AnalyticsSettingsModel: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { AnalyticsSettingsModel } from '@/models/analytics-settings.model';
import { GET, PATCH } from '@/app/api/admin/seo/analytics/route';

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

describe('Analytics API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'admin-1', role: 'admin' });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/seo/analytics', () => {
    it('returns analytics settings', async () => {
      (AnalyticsSettingsModel.get as jest.Mock).mockResolvedValue({ googleAnalyticsId: 'G-123' });
      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.data.googleAnalyticsId).toBe('G-123');
    });
  });

  describe('PATCH /api/admin/seo/analytics', () => {
    it('updates analytics settings', async () => {
      (AnalyticsSettingsModel.update as jest.Mock).mockResolvedValue({ googleAnalyticsId: 'G-999' });
      const res = await PATCH(makeRequest({ body: { googleAnalyticsId: 'G-999' } }));
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.data.googleAnalyticsId).toBe('G-999');
    });
  });
});
