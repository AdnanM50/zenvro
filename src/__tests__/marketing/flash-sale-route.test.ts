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

jest.mock('@/models/flash-sale.model', () => ({
  FlashSaleModel: {
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
import { FlashSaleModel } from '@/models/flash-sale.model';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/marketing/flash-sales/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/marketing/flash-sales',
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

describe('Flash Sales API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
    (FlashSaleModel.findById as jest.Mock).mockResolvedValue(null);
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

    it('returns a paginated list of sales for an admin', async () => {
      const sales = [{ _id: 's1', title: 'Mega Sale', status: 'active' }];
      (FlashSaleModel.findPaginated as jest.Mock).mockResolvedValue({ sales, total: 1 });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(sales);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(FlashSaleModel.findPaginated).toHaveBeenCalledWith(1, 20, {});
    });

    it('passes search, status and pagination query params through', async () => {
      (FlashSaleModel.findPaginated as jest.Mock).mockResolvedValue({ sales: [], total: 0 });

      const url =
        'http://localhost/api/admin/marketing/flash-sales?search=deal&status=active&page=2&limit=5';
      await GET(makeRequest({ url }));

      expect(FlashSaleModel.findPaginated).toHaveBeenCalledWith(2, 5, {
        search: 'deal',
        status: 'active',
      });
    });

    it('clamps out-of-range page and limit values (Edge case)', async () => {
      (FlashSaleModel.findPaginated as jest.Mock).mockResolvedValue({ sales: [], total: 0 });

      const url = 'http://localhost/api/admin/marketing/flash-sales?page=0&limit=99999';
      await GET(makeRequest({ url }));

      expect(FlashSaleModel.findPaginated).toHaveBeenCalledWith(1, 100, {});
    });

    it('returns 500 when the model throws', async () => {
      (FlashSaleModel.findPaginated as jest.Mock).mockRejectedValue(new Error('DB down'));

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 400 when title is missing', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { discountValue: 20, startsAt: '2025-01-01T00:00', endsAt: '2025-01-02T00:00' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Flash sale title is required');
    });

    it('returns 400 for an invalid discount type', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: 'Sale',
            discountType: 'weird',
            discountValue: 20,
            startsAt: '2025-01-01T00:00',
            endsAt: '2025-01-02T00:00',
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid discount type');
    });

    it('returns 400 for a missing discount value', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { title: 'Sale', startsAt: '2025-01-01T00:00', endsAt: '2025-01-02T00:00' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid discount value is required');
    });

    it('returns 400 for a percentage discount over 100', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: 'Sale',
            discountType: 'percentage',
            discountValue: 150,
            startsAt: '2025-01-01T00:00',
            endsAt: '2025-01-02T00:00',
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Percentage discount cannot exceed 100');
    });

    it('returns 400 when start date is missing', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { title: 'Sale', discountValue: 20, endsAt: '2025-01-02T00:00' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Start date is required');
    });

    it('returns 400 when end date is missing', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { title: 'Sale', discountValue: 20, startsAt: '2025-01-01T00:00' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('End date is required');
    });

    it('returns 400 when end date is not after start date', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: 'Sale',
            discountValue: 20,
            startsAt: '2025-01-02T00:00',
            endsAt: '2025-01-01T00:00',
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('End date must be after start date');
    });

    it('returns 400 for an invalid status', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: 'Sale',
            discountValue: 20,
            startsAt: '2025-01-01T00:00',
            endsAt: '2025-01-02T00:00',
            status: 'weird',
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid status');
    });

    it('returns 400 for a negative sort order', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: 'Sale',
            discountValue: 20,
            startsAt: '2025-01-01T00:00',
            endsAt: '2025-01-02T00:00',
            sortOrder: -1,
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Sort order must be a non-negative integer');
    });

    it('creates a sale and returns 201 with normalized data', async () => {
      const created = { _id: 's-new', title: 'Sale' };
      (FlashSaleModel.create as jest.Mock).mockResolvedValue(created);

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: '  Mega Sale  ',
            discountType: 'percentage',
            discountValue: 25,
            startsAt: '2025-01-01T00:00',
            endsAt: '2025-01-02T00:00',
            productIds: 'p-1, p-2',
            showOnHome: true,
            sortOrder: 1,
            status: 'active',
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.data).toEqual(created);
      expect(FlashSaleModel.create).toHaveBeenCalledWith({
        title: 'Mega Sale',
        description: undefined,
        discountType: 'percentage',
        discountValue: 25,
        startsAt: '2025-01-01T00:00',
        endsAt: '2025-01-02T00:00',
        productIds: ['p-1', 'p-2'],
        showOnHome: true,
        sortOrder: 1,
        status: 'active',
      });
    });

    it('defaults to percentage/inactive/false when not provided', async () => {
      (FlashSaleModel.create as jest.Mock).mockResolvedValue({ _id: 's-new' });

      await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: 'Sale',
            discountValue: 10,
            startsAt: '2025-01-01T00:00',
            endsAt: '2025-01-02T00:00',
          },
        })
      );

      expect(FlashSaleModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discountType: 'percentage',
          discountValue: 10,
          productIds: [],
          showOnHome: false,
          sortOrder: 0,
          status: 'inactive',
        })
      );
    });

    it('returns 500 when the model throws', async () => {
      (FlashSaleModel.create as jest.Mock).mockRejectedValue(new Error('DB down'));

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: 'Sale',
            discountValue: 10,
            startsAt: '2025-01-01T00:00',
            endsAt: '2025-01-02T00:00',
          },
        })
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
        makeRequest({ method: 'PATCH', body: { _id: 's1', title: '  ' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Flash sale title cannot be empty');
    });

    it('returns 400 for a percentage discount over 100 on update', async () => {
      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 's1', discountType: 'percentage', discountValue: 120 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Percentage discount cannot exceed 100');
    });

    it('returns 400 for an invalid status update', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 's1', status: 'bogus' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid status');
    });

    it('validates the discount value against the existing discount type', async () => {
      (FlashSaleModel.findById as jest.Mock).mockResolvedValue({
        _id: 's1',
        discountType: 'percentage',
      });

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 's1', discountValue: 150 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Percentage discount cannot exceed 100');
    });

    it('updates a sale and returns 200', async () => {
      (FlashSaleModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 's1', title: 'Updated', productIds: 'p-1, p-2', showOnHome: true },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(FlashSaleModel.update).toHaveBeenCalledWith(
        's1',
        expect.objectContaining({ title: 'Updated', productIds: ['p-1', 'p-2'], showOnHome: true })
      );
    });

    it('returns 404 when the sale does not exist', async () => {
      (FlashSaleModel.update as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'missing', title: 'X' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Flash sale not found');
    });
  });

  describe('DELETE', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('deletes a sale and returns 200', async () => {
      (FlashSaleModel.delete as jest.Mock).mockResolvedValue(true);

      const url = 'http://localhost/api/admin/marketing/flash-sales?_id=s1';
      const res = await DELETE(makeRequest({ url }));
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(FlashSaleModel.delete).toHaveBeenCalledWith('s1');
    });

    it('returns 404 when the sale is not found', async () => {
      (FlashSaleModel.delete as jest.Mock).mockResolvedValue(false);

      const url = 'http://localhost/api/admin/marketing/flash-sales?_id=missing';
      const res = await DELETE(makeRequest({ url }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Flash sale not found');
    });
  });
});
