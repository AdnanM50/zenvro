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

jest.mock('@/models/product.model', () => ({
  ProductModel: {
    findPaginated: jest.fn(),
    findBySku: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ProductModel } from '@/models/product.model';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/products/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/products',
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

describe('Products API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
    (ProductModel.findBySku as jest.Mock).mockResolvedValue(null);
    (ProductModel.findBySlug as jest.Mock).mockResolvedValue(null);
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

    it('returns a paginated list of products for an admin', async () => {
      const products = [
        { _id: 'p1', name: 'Classic Tee', sku: 'TSH-1', regularPrice: 49.99, stock: 25 },
      ];
      (ProductModel.findPaginated as jest.Mock).mockResolvedValue({
        products,
        total: 1,
      });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(products);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(ProductModel.findPaginated).toHaveBeenCalledWith(1, 20, {});
    });

    it('passes search, filter and pagination query params through', async () => {
      (ProductModel.findPaginated as jest.Mock).mockResolvedValue({
        products: [],
        total: 0,
      });

      const url =
        'http://localhost/api/admin/products?search=tee&category=cat-1&brand=brand-1&status=draft&gender=men&isFeatured=true&isNewArrival=false&isTrending=true&page=2&limit=5';
      await GET(makeRequest({ url }));

      expect(ProductModel.findPaginated).toHaveBeenCalledWith(2, 5, {
        search: 'tee',
        category: 'cat-1',
        brand: 'brand-1',
        status: 'draft',
        gender: 'men',
        isFeatured: true,
        isNewArrival: false,
        isTrending: true,
      });
    });

    it('clamps out-of-range page and limit values (Edge case)', async () => {
      (ProductModel.findPaginated as jest.Mock).mockResolvedValue({
        products: [],
        total: 0,
      });

      const url = 'http://localhost/api/admin/products?page=0&limit=99999';
      await GET(makeRequest({ url }));

      expect(ProductModel.findPaginated).toHaveBeenCalledWith(1, 100, {});
    });

    it('returns 500 when the model throws', async () => {
      (ProductModel.findPaginated as jest.Mock).mockRejectedValue(
        new Error('DB down')
      );

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 400 when name is missing', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { sku: 'X-1', regularPrice: 10, stock: 5 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Product name is required');
    });

    it('returns 400 when SKU is missing', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { name: 'Tee', regularPrice: 10, stock: 5 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('SKU is required');
    });

    it('returns 400 for a negative regular price', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { name: 'Tee', sku: 'X-1', regularPrice: -5, stock: 5 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid regular price is required');
    });

    it('returns 400 for invalid stock', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { name: 'Tee', sku: 'X-1', regularPrice: 10, stock: 'abc' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid stock quantity is required');
    });

    it('returns 409 when the SKU already exists', async () => {
      (ProductModel.findBySku as jest.Mock).mockResolvedValue({
        _id: 'existing',
        sku: 'TSH-COT-001',
      });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Tee', sku: 'TSH-COT-001', regularPrice: 10, stock: 5 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('A product with this SKU already exists');
      expect(ProductModel.create).not.toHaveBeenCalled();
    });

    it('returns 409 when the slug already exists', async () => {
      (ProductModel.findBySku as jest.Mock).mockResolvedValue(null);
      (ProductModel.findBySlug as jest.Mock).mockResolvedValue({
        _id: 'existing',
        slug: 'classic-tee',
      });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Classic Tee', sku: 'TSH-NEW', regularPrice: 10, stock: 5 },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('A product with this slug already exists');
    });

    it('returns 400 for an invalid status', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Tee', sku: 'X-1', regularPrice: 10, stock: 5, status: 'weird' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid status');
    });

    it('returns 400 for an invalid gender', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Tee', sku: 'X-1', regularPrice: 10, stock: 5, gender: 'alien' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid gender');
    });

    it('returns 400 for invalid variants JSON', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Tee', sku: 'X-1', regularPrice: 10, stock: 5, variants: 'not-json{' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid variants JSON');
    });

    it('returns 400 when an embedded variant is missing a SKU', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Tee', sku: 'X-1', regularPrice: 10, stock: 5, variants: [{ price: 10, stock: 2 }] },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Each variant requires a SKU');
    });

    it('creates a product and returns 201 with normalized data', async () => {
      (ProductModel.findBySku as jest.Mock).mockResolvedValue(null);
      (ProductModel.findBySlug as jest.Mock).mockResolvedValue(null);
      const created = { _id: 'p-new', name: 'Classic Tee', sku: 'TSH-COT-001' };
      (ProductModel.create as jest.Mock).mockResolvedValue(created);

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            name: 'Classic Tee',
            sku: 'TSH-COT-001',
            tags: 'tag-1, tag-2',
            gallery: ['https://img.com/a.png', 'https://img.com/b.png'],
            regularPrice: '59.99',
            salePrice: '49.99',
            costPrice: '20',
            stock: '100',
            lowStock: '10',
            sold: '42',
            status: 'active',
            gender: 'unisex',
            specifications: 'Fit: Regular, Neckline: Crew',
            variants: JSON.stringify([
              { sku: 'TSH-COT-BLK-XL', attributes: { Color: 'Black' }, price: '59.99', salePrice: '49.99', stock: '25', weight: '0.4' },
            ]),
            seo: { title: 'SEO Tee', keywords: 'tee, cotton' },
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(created);
      expect(ProductModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Classic Tee',
          slug: 'classic-tee',
          sku: 'TSH-COT-001',
          tags: ['tag-1', 'tag-2'],
          gallery: ['https://img.com/a.png', 'https://img.com/b.png'],
          regularPrice: 59.99,
          salePrice: 49.99,
          costPrice: 20,
          stock: 100,
          lowStock: 10,
          sold: 42,
          status: 'active',
          gender: 'unisex',
          specifications: { Fit: 'Regular', Neckline: 'Crew' },
          isFeatured: false,
          variants: [
            {
              sku: 'TSH-COT-BLK-XL',
              attributes: { Color: 'Black' },
              price: 59.99,
              salePrice: 49.99,
              stock: 25,
              image: '',
              weight: 0.4,
            },
          ],
          seo: expect.objectContaining({
            title: 'SEO Tee',
            keywords: ['tee', 'cotton'],
            ogType: 'product',
            robots: 'index',
          }),
        })
      );
    });

    it('defaults to the active status when none is provided', async () => {
      (ProductModel.findBySku as jest.Mock).mockResolvedValue(null);
      (ProductModel.findBySlug as jest.Mock).mockResolvedValue(null);

      await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Tee', sku: 'X-1', regularPrice: 10, stock: 5 },
        })
      );

      expect(ProductModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active', gender: '', isFeatured: false })
      );
    });

    it('returns 500 when the model throws', async () => {
      (ProductModel.findBySku as jest.Mock).mockResolvedValue(null);
      (ProductModel.findBySlug as jest.Mock).mockResolvedValue(null);
      (ProductModel.create as jest.Mock).mockRejectedValue(new Error('DB down'));

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { name: 'Tee', sku: 'X-1', regularPrice: 10, stock: 5 },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { regularPrice: 10 } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 400 for an invalid price update', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'p1', regularPrice: -1 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid regular price is required');
    });

    it('returns 409 when updating to an SKU owned by another product', async () => {
      (ProductModel.findBySku as jest.Mock).mockResolvedValue({
        _id: 'other',
        sku: 'TSH-COT-001',
      });

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'p1', sku: 'TSH-COT-001' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('A product with this SKU already exists');
    });

    it('allows keeping the same SKU on the same product', async () => {
      (ProductModel.findBySku as jest.Mock).mockResolvedValue({
        _id: 'p1',
        sku: 'TSH-COT-001',
      });
      (ProductModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'p1', sku: 'TSH-COT-001' },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
    });

    it('returns 409 when updating to a slug owned by another product', async () => {
      (ProductModel.findBySlug as jest.Mock).mockResolvedValue({
        _id: 'other',
        slug: 'classic-tee',
      });

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'p1', slug: 'classic-tee' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('A product with this slug already exists');
    });

    it('returns 400 for an invalid status update', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'p1', status: 'bogus' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid status');
    });

    it('updates a product and returns 200', async () => {
      (ProductModel.findBySku as jest.Mock).mockResolvedValue(null);
      (ProductModel.findBySlug as jest.Mock).mockResolvedValue(null);
      (ProductModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: {
            _id: 'p1',
            name: 'Updated Tee',
            sku: 'TSH-UPD',
            tags: 'new-tag',
            specifications: 'Fit: Slim',
            isFeatured: true,
            variants: JSON.stringify([{ sku: 'TSH-UPD-XL', price: 69.99, stock: 3 }]),
          },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ProductModel.update).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({
          name: 'Updated Tee',
          slug: 'updated-tee',
          sku: 'TSH-UPD',
          tags: ['new-tag'],
          specifications: { Fit: 'Slim' },
          isFeatured: true,
          variants: [
            {
              sku: 'TSH-UPD-XL',
              attributes: {},
              price: 69.99,
              salePrice: undefined,
              stock: 3,
              image: '',
              weight: undefined,
            },
          ],
        })
      );
    });

    it('returns 404 when the product does not exist', async () => {
      (ProductModel.update as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'missing', regularPrice: 10 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Product not found');
    });
  });

  describe('DELETE', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('deletes a product and returns 200', async () => {
      (ProductModel.delete as jest.Mock).mockResolvedValue(true);

      const url = 'http://localhost/api/admin/products?_id=p1';
      const res = await DELETE(makeRequest({ url }));
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ProductModel.delete).toHaveBeenCalledWith('p1');
    });

    it('returns 404 when the product is not found', async () => {
      (ProductModel.delete as jest.Mock).mockResolvedValue(false);

      const url = 'http://localhost/api/admin/products?_id=missing';
      const res = await DELETE(makeRequest({ url }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Product not found');
    });
  });
});
