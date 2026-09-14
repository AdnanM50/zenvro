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

jest.mock('@/models/coupon.model', () => ({
  CouponModel: {
    findPaginated: jest.fn(),
    findByCode: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { CouponModel } from '@/models/coupon.model';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/coupons/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/coupons',
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

describe('Coupons API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
    (CouponModel.findByCode as jest.Mock).mockResolvedValue(null);
    (CouponModel.findById as jest.Mock).mockResolvedValue(null);
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
      (UserModel.findById as jest.Mock).mockResolvedValue({
        _id: 'u2',
        role: 'user',
      });

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(403);
    });

    it('returns a paginated list of coupons for an admin', async () => {
      const coupons = [
        { _id: 'c1', name: 'Summer Sale', code: 'SUMMER10', value: 10 },
      ];
      (CouponModel.findPaginated as jest.Mock).mockResolvedValue({
        coupons,
        total: 1,
      });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(coupons);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(CouponModel.findPaginated).toHaveBeenCalledWith(1, 20, {});
    });

    it('passes search, filter and pagination query params through', async () => {
      (CouponModel.findPaginated as jest.Mock).mockResolvedValue({
        coupons: [],
        total: 0,
      });

      const res = await GET(
        makeRequest({
          url: 'http://localhost/api/admin/coupons?search=summer&type=fixed&status=active&page=3&limit=15',
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(CouponModel.findPaginated).toHaveBeenCalledWith(3, 15, {
        search: 'summer',
        type: 'fixed',
        status: 'active',
      });
    });

    it('clamps page to >= 1 and limit to <= 100', async () => {
      (CouponModel.findPaginated as jest.Mock).mockResolvedValue({
        coupons: [],
        total: 0,
      });

      const res = await GET(
        makeRequest({
          url: 'http://localhost/api/admin/coupons?page=0&limit=500',
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(CouponModel.findPaginated).toHaveBeenCalledWith(1, 100, {});
    });

    it('returns 500 when the model throws', async () => {
      (CouponModel.findPaginated as jest.Mock).mockRejectedValue(
        new Error('db down')
      );

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 400 when the name is missing', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { code: 'SAVE10', type: 'percentage', value: 10 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Coupon name is required');
    });

    it('returns 400 when the code is missing', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { name: 'Sale', type: 'percentage', value: 10 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Coupon code is required');
    });

    it('returns 400 for an invalid type', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SAVE10', type: 'bogus', value: 10 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid coupon type');
    });

    it('returns 400 for a zero or negative value', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SAVE10', type: 'fixed', value: 0 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid discount value is required');
    });

    it('returns 400 for a percentage value above 100', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SAVE10', type: 'percentage', value: 150 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Percentage discount cannot exceed 100');
    });

    it('returns 409 when the code already exists', async () => {
      (CouponModel.findByCode as jest.Mock).mockResolvedValue({
        _id: 'c1',
        code: 'SUMMER10',
      });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SUMMER10', type: 'percentage', value: 10 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('A coupon with this code already exists');
      expect(CouponModel.findByCode).toHaveBeenCalledWith('SUMMER10');
    });

    it('returns 400 for an invalid applies-to scope', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SAVE10', type: 'percentage', value: 10, appliesTo: 'bogus' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid applies-to scope');
    });

    it('returns 400 for an invalid status', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SAVE10', type: 'percentage', value: 10, status: 'bogus' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid status');
    });

    it('returns 400 when the end date is before the start date', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            name: 'Sale',
            code: 'SAVE10',
            type: 'percentage',
            value: 10,
            startDate: '2025-12-31',
            endDate: '2025-01-01',
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('End date must be after start date');
    });

    it('returns 400 for a negative minimum order amount', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SAVE10', type: 'percentage', value: 10, minOrderAmount: -5 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Minimum order amount cannot be negative');
    });

    it('returns 400 for a non-integer usage limit', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SAVE10', type: 'percentage', value: 10, usageLimit: 2.5 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Usage limit must be a positive integer');
    });

    it('creates a coupon with normalized code and default type/status/applies-to', async () => {
      (CouponModel.create as jest.Mock).mockResolvedValue({
        _id: 'c1',
        name: 'Sale',
        code: 'SAVE10',
      });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: '  save 10 ', value: 10 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(CouponModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sale',
          code: 'SAVE10',
          type: 'percentage',
          status: 'active',
          appliesTo: 'all',
          products: [],
          categories: [],
          value: 10,
        })
      );
    });

    it('creates a coupon with a full payload including a product scope', async () => {
      (CouponModel.create as jest.Mock).mockResolvedValue({
        _id: 'c2',
        name: 'Product Deal',
        code: 'DEAL5',
      });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            name: 'Product Deal',
            code: 'deal5',
            type: 'fixed',
            value: 5,
            minOrderAmount: 25,
            usageLimit: 50,
            perUserLimit: 1,
            startDate: '2025-06-01',
            endDate: '2025-06-30',
            appliesTo: 'products',
            products: 'p-1, p-2',
            status: 'active',
          },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(201);
      expect(CouponModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Product Deal',
          code: 'DEAL5',
          type: 'fixed',
          value: 5,
          minOrderAmount: 25,
          usageLimit: 50,
          perUserLimit: 1,
          appliesTo: 'products',
          products: ['p-1', 'p-2'],
        })
      );
    });

    it('returns 500 when the model throws', async () => {
      (CouponModel.create as jest.Mock).mockRejectedValue(new Error('db down'));

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Sale', code: 'SAVE10', type: 'percentage', value: 10 },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { value: 15 } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 400 for an invalid value', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', value: -1 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid discount value is required');
    });

    it('returns 400 for a percentage value above 100 when type is passed', async () => {
      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'c1', type: 'percentage', value: 150 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Percentage discount cannot exceed 100');
    });

    it('returns 409 when the code belongs to another coupon', async () => {
      (CouponModel.findByCode as jest.Mock).mockResolvedValue({
        _id: 'c2',
        code: 'TAKEN',
      });

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', code: 'TAKEN' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('A coupon with this code already exists');
    });

    it('allows keeping the same code (self-conflict exemption)', async () => {
      (CouponModel.findByCode as jest.Mock).mockResolvedValue({
        _id: 'c1',
        code: 'SAVE10',
      });
      (CouponModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', code: 'save10' } })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(CouponModel.update).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ code: 'SAVE10' })
      );
    });

    it('returns 400 for an invalid status', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', status: 'bogus' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid status');
    });

    it('updates a value above 100 for an existing fixed coupon', async () => {
      (CouponModel.findById as jest.Mock).mockResolvedValue({
        _id: 'c1',
        type: 'fixed',
      });
      (CouponModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'c1', value: 200 } })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(CouponModel.findById).toHaveBeenCalledWith('c1');
      expect(CouponModel.update).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({ value: 200 })
      );
    });

    it('updates name, status and applies-to fields', async () => {
      (CouponModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'c1', name: 'New Name', status: 'inactive', appliesTo: 'categories', categories: 'cat-1, cat-2' },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(CouponModel.update).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({
          name: 'New Name',
          status: 'inactive',
          appliesTo: 'categories',
          categories: ['cat-1', 'cat-2'],
        })
      );
    });

    it('returns 404 when the coupon does not exist', async () => {
      (CouponModel.update as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'missing', value: 15 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Coupon not found');
    });
  });

  describe('DELETE', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('deletes a coupon and returns 200', async () => {
      (CouponModel.delete as jest.Mock).mockResolvedValue(true);

      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/admin/coupons?_id=c1' })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(CouponModel.delete).toHaveBeenCalledWith('c1');
    });

    it('returns 404 when the coupon does not exist', async () => {
      (CouponModel.delete as jest.Mock).mockResolvedValue(false);

      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/admin/coupons?_id=missing' })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Coupon not found');
    });
  });
});
