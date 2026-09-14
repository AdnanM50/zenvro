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

jest.mock('@/models/product.model', () => ({
  ProductModel: {
    findPaginated: jest.fn(),
    findBySlug: jest.fn(),
    findById: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { ProductModel } from '@/models/product.model';
import { GET as getPublicProducts } from '@/app/api/products/route';
import { GET as getPublicProductDetail } from '@/app/api/products/[slug]/route';

function makeRequest(url: string): NextRequest {
  return {
    url,
    method: 'GET',
    cookies: { get: () => undefined },
    json: async () => ({}),
  } as unknown as NextRequest;
}

async function parseResponse(res: Response) {
  return { status: res.status, body: await res.json() };
}

describe('Public Product API Routes', () => {
  const samplePublishedProduct = {
    _id: 'p1',
    name: 'Published Leather Jacket',
    slug: 'published-leather-jacket',
    sku: 'SKU-100',
    category: 'Outerwear',
    brand: 'Velour',
    regularPrice: 250,
    salePrice: 200,
    stock: 10,
    status: 'published',
    isFeatured: true,
    featuredImage: 'https://example.com/image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('returns published products paginated', async () => {
      (ProductModel.findPaginated as jest.Mock).mockResolvedValueOnce({
        products: [samplePublishedProduct],
        total: 1,
      });

      const req = makeRequest('http://localhost/api/products?category=Outerwear');
      const res = await getPublicProducts(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Published Leather Jacket');
      expect(ProductModel.findPaginated).toHaveBeenCalledWith(1, 50, expect.objectContaining({
        status: 'published',
        category: 'Outerwear',
      }));
    });
  });

  describe('GET /api/products/[slug]', () => {
    it('returns single published product detail and related products', async () => {
      (ProductModel.findBySlug as jest.Mock).mockResolvedValueOnce(samplePublishedProduct);
      (ProductModel.findPaginated as jest.Mock).mockResolvedValueOnce({
        products: [samplePublishedProduct],
        total: 1,
      });

      const req = makeRequest('http://localhost/api/products/published-leather-jacket');
      const res = await getPublicProductDetail(req, {
        params: Promise.resolve({ slug: 'published-leather-jacket' }),
      });
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.product.slug).toBe('published-leather-jacket');
    });

    it('returns 404 if product is draft or missing', async () => {
      (ProductModel.findBySlug as jest.Mock).mockResolvedValueOnce({
        ...samplePublishedProduct,
        status: 'draft',
      });

      const req = makeRequest('http://localhost/api/products/draft-jacket');
      const res = await getPublicProductDetail(req, {
        params: Promise.resolve({ slug: 'draft-jacket' }),
      });
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.success).toBe(false);
    });
  });
});
