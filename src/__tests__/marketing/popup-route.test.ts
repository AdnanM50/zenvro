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

jest.mock('@/models/popup-banner.model', () => ({
  PopupBannerModel: {
    findPaginated: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { PopupBannerModel } from '@/models/popup-banner.model';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/marketing/popups/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/marketing/popups',
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

describe('Popup Banners API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
    (PopupBannerModel.findById as jest.Mock).mockResolvedValue(null);
  });

  describe('GET', () => {
    it('returns 401 when no token is present', async () => {
      const res = await GET(makeRequest({ token: null }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(401);
      expect(body.success).toBe(false);
    });

    it('returns 401 for an invalid token', async () => {
      (verifyAccessToken as jest.Mock).mockReturnValue(null);

      const res = await GET(makeRequest({ token: 'garbage' }));
      const { status } = await parseResponse(res);

      expect(status).toBe(401);
    });

    it('returns 403 for a non-admin user', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({ _id: 'u2', role: 'user' });

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(403);
    });

    it('returns a paginated list of banners for an admin', async () => {
      const banners = [{ _id: 'b1', title: 'New Season', status: 'active' }];
      (PopupBannerModel.findPaginated as jest.Mock).mockResolvedValue({
        banners,
        total: 1,
      });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(banners);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(PopupBannerModel.findPaginated).toHaveBeenCalledWith(1, 20, {});
    });

    it('passes search, status and pagination query params through', async () => {
      (PopupBannerModel.findPaginated as jest.Mock).mockResolvedValue({
        banners: [],
        total: 0,
      });

      const url =
        'http://localhost/api/admin/marketing/popups?search=sale&status=active&page=2&limit=5';
      await GET(makeRequest({ url }));

      expect(PopupBannerModel.findPaginated).toHaveBeenCalledWith(2, 5, {
        search: 'sale',
        status: 'active',
      });
    });

    it('clamps out-of-range page and limit values (Edge case)', async () => {
      (PopupBannerModel.findPaginated as jest.Mock).mockResolvedValue({
        banners: [],
        total: 0,
      });

      const url = 'http://localhost/api/admin/marketing/popups?page=0&limit=99999';
      await GET(makeRequest({ url }));

      expect(PopupBannerModel.findPaginated).toHaveBeenCalledWith(1, 100, {});
    });

    it('returns 500 when the model throws', async () => {
      (PopupBannerModel.findPaginated as jest.Mock).mockRejectedValue(new Error('DB down'));

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 400 when title is missing', async () => {
      const res = await POST(makeRequest({ method: 'POST', body: { status: 'active' } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Popup banner title is required');
    });

    it('returns 400 when end date is before start date', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { title: 'Banner', startDate: '2025-06-30', endDate: '2025-06-01' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('End date must be after start date');
    });

    it('returns 400 for an invalid status', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { title: 'Banner', status: 'weird' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid status');
    });

    it('returns 400 for a negative sort order', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { title: 'Banner', sortOrder: -2 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Sort order must be a non-negative integer');
    });

    it('creates a banner and returns 201 with defaults', async () => {
      const created = { _id: 'b-new', title: 'Banner' };
      (PopupBannerModel.create as jest.Mock).mockResolvedValue(created);

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: '  New Season  ',
            description: 'Great deals',
            imageUrl: 'https://img.com/a.png',
            buttonText: 'Shop Now',
            buttonLink: '/products',
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.data).toEqual(created);
      expect(PopupBannerModel.create).toHaveBeenCalledWith({
        title: 'New Season',
        description: 'Great deals',
        imageUrl: 'https://img.com/a.png',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        startDate: undefined,
        endDate: undefined,
        status: 'inactive',
        sortOrder: 0,
      });
    });

    it('returns 500 when the model throws', async () => {
      (PopupBannerModel.create as jest.Mock).mockRejectedValue(new Error('DB down'));

      const res = await POST(
        makeRequest({ method: 'POST', body: { title: 'Banner' } })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { title: 'X' } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 400 for an empty title', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'b1', title: '  ' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Popup banner title cannot be empty');
    });

    it('returns 400 when end date is before start date on update', async () => {
      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'b1', startDate: '2025-06-30', endDate: '2025-06-01' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('End date must be after start date');
    });

    it('returns 400 for an invalid status update', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'b1', status: 'bogus' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid status');
    });

    it('updates a banner and returns 200', async () => {
      (PopupBannerModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'b1', title: 'Updated', status: 'active', sortOrder: 2 },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(PopupBannerModel.update).toHaveBeenCalledWith(
        'b1',
        expect.objectContaining({ title: 'Updated', status: 'active', sortOrder: 2 })
      );
    });

    it('returns 404 when the banner does not exist', async () => {
      (PopupBannerModel.update as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'missing', title: 'X' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Popup banner not found');
    });
  });

  describe('DELETE', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('deletes a banner and returns 200', async () => {
      (PopupBannerModel.delete as jest.Mock).mockResolvedValue(true);

      const url = 'http://localhost/api/admin/marketing/popups?_id=b1';
      const res = await DELETE(makeRequest({ url }));
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(PopupBannerModel.delete).toHaveBeenCalledWith('b1');
    });

    it('returns 404 when the banner is not found', async () => {
      (PopupBannerModel.delete as jest.Mock).mockResolvedValue(false);

      const url = 'http://localhost/api/admin/marketing/popups?_id=missing';
      const res = await DELETE(makeRequest({ url }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Popup banner not found');
    });
  });
});
