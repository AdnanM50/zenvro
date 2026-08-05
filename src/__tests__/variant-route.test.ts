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

jest.mock('@/models/variant.model', () => ({
  VariantModel: {
    findPaginated: jest.fn(),
    findBySku: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { VariantModel } from '@/models/variant.model';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/variants/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/variants',
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

describe('Variants API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
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

    it('returns a paginated list of variants for an admin', async () => {
      const variants = [
        { _id: 'v1', sku: 'TSH-BLK-XL', price: 49.99, stock: 25 },
      ];
      (VariantModel.findPaginated as jest.Mock).mockResolvedValue({
        variants,
        total: 1,
      });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(variants);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(VariantModel.findPaginated).toHaveBeenCalledWith(1, 20, undefined);
    });

    it('passes search and pagination query params through', async () => {
      (VariantModel.findPaginated as jest.Mock).mockResolvedValue({
        variants: [],
        total: 0,
      });

      const url = 'http://localhost/api/admin/variants?search=tsh&page=2&limit=5';
      await GET(makeRequest({ url }));

      expect(VariantModel.findPaginated).toHaveBeenCalledWith(2, 5, 'tsh');
    });

    it('clamps out-of-range page and limit values (Edge case)', async () => {
      (VariantModel.findPaginated as jest.Mock).mockResolvedValue({
        variants: [],
        total: 0,
      });

      const url = 'http://localhost/api/admin/variants?page=0&limit=99999';
      await GET(makeRequest({ url }));

      expect(VariantModel.findPaginated).toHaveBeenCalledWith(1, 100, undefined);
    });

    it('returns 500 when the model throws', async () => {
      (VariantModel.findPaginated as jest.Mock).mockRejectedValue(
        new Error('DB down')
      );

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 400 when SKU is missing', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { price: 10, stock: 5 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('SKU is required');
    });

    it('returns 400 for a negative price', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { sku: 'X-1', price: -5, stock: 5 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid price is required');
    });

    it('returns 400 for invalid stock', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { sku: 'X-1', price: 10, stock: 'abc' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid stock quantity is required');
    });

    it('returns 409 when the SKU already exists', async () => {
      (VariantModel.findBySku as jest.Mock).mockResolvedValue({
        _id: 'existing',
        sku: 'TSH-BLK-XL',
      });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { sku: 'TSH-BLK-XL', price: 10, stock: 5 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('A variant with this SKU already exists');
      expect(VariantModel.create).not.toHaveBeenCalled();
    });

    it('creates a variant and returns 201 with normalized data', async () => {
      (VariantModel.findBySku as jest.Mock).mockResolvedValue(null);
      const created = {
        _id: 'v-new',
        sku: 'TSH-BLK-XL',
        attributes: { Color: 'Black', Size: 'XL' },
        price: 49.99,
        salePrice: 39.99,
        stock: 25,
        image: 'https://example.com/black-xl.png',
        weight: 0.4,
      };
      (VariantModel.create as jest.Mock).mockResolvedValue(created);

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            sku: 'TSH-BLK-XL',
            attributes: { Color: 'Black', Size: 'XL' },
            price: '49.99',
            salePrice: '39.99',
            stock: '25',
            image: '  https://example.com/black-xl.png  ',
            weight: '0.4',
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(created);
      expect(VariantModel.create).toHaveBeenCalledWith({
        sku: 'TSH-BLK-XL',
        attributes: { Color: 'Black', Size: 'XL' },
        price: 49.99,
        salePrice: 39.99,
        stock: 25,
        image: 'https://example.com/black-xl.png',
        weight: 0.4,
      });
    });

    it('parses a comma-separated attributes string into a map', async () => {
      (VariantModel.findBySku as jest.Mock).mockResolvedValue(null);
      (VariantModel.create as jest.Mock).mockResolvedValue({
        _id: 'v-new',
        sku: 'TSH-BLK-XL',
      });

      await POST(
        makeRequest({
          method: 'POST',
          body: {
            sku: 'TSH-BLK-XL',
            attributes: 'Color: Black, Size: XL, Material:',
            price: 10,
            stock: 5,
          },
        })
      );

      expect(VariantModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: { Color: 'Black', Size: 'XL' },
        })
      );
    });

    it('returns 500 when the model throws', async () => {
      (VariantModel.findBySku as jest.Mock).mockResolvedValue(null);
      (VariantModel.create as jest.Mock).mockRejectedValue(
        new Error('DB down')
      );

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { sku: 'X-1', price: 10, stock: 5 },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { price: 10 } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 400 for an invalid price update', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'v1', price: -1 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid price is required');
    });

    it('returns 409 when updating to an SKU owned by another variant', async () => {
      (VariantModel.findBySku as jest.Mock).mockResolvedValue({
        _id: 'other',
        sku: 'TSH-BLK-XL',
      });

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'v1', sku: 'TSH-BLK-XL' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('A variant with this SKU already exists');
    });

    it('updates a variant and returns 200', async () => {
      (VariantModel.findBySku as jest.Mock).mockResolvedValue(null);
      (VariantModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: {
            _id: 'v1',
            sku: 'TSH-RED-XL',
            attributes: 'Color: Red, Size: XL',
            price: 59.99,
            salePrice: '',
            stock: 3,
            image: 'img.png',
            weight: '',
          },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(VariantModel.update).toHaveBeenCalledWith(
        'v1',
        expect.objectContaining({
          sku: 'TSH-RED-XL',
          attributes: { Color: 'Red', Size: 'XL' },
          price: 59.99,
          stock: 3,
          image: 'img.png',
        })
      );
    });

    it('returns 404 when the variant does not exist', async () => {
      (VariantModel.findBySku as jest.Mock).mockResolvedValue(null);
      (VariantModel.update as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'missing', price: 10 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Variant not found');
    });
  });

  describe('DELETE', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('deletes a variant and returns 200', async () => {
      (VariantModel.delete as jest.Mock).mockResolvedValue(true);

      const url = 'http://localhost/api/admin/variants?_id=v1';
      const res = await DELETE(makeRequest({ url }));
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(VariantModel.delete).toHaveBeenCalledWith('v1');
    });

    it('returns 404 when the variant is not found', async () => {
      (VariantModel.delete as jest.Mock).mockResolvedValue(false);

      const url = 'http://localhost/api/admin/variants?_id=missing';
      const res = await DELETE(makeRequest({ url }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Variant not found');
    });
  });
});
