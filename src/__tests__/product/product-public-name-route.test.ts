jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      json(data: unknown, init?: { status?: number }) {
        return {
          status: init?.status ?? 200,
          json: async () => data,
        };
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

jest.mock('@/models/category.model', () => ({
  CategoryModel: {
    findAll: jest.fn(),
  },
}));

jest.mock('@/models/tag.model', () => ({
  TagModel: {
    findAll: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { GET as GET_PRODUCTS } from '@/app/api/products/route';
import { GET as GET_PRODUCT_SLUG } from '@/app/api/products/[slug]/route';
import { ProductModel } from '@/models/product.model';

function makeRequest(url = 'http://localhost/api/products'): NextRequest {
  return { url } as unknown as NextRequest;
}

describe('Public Product Search by Name & Slug API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products by name search', () => {
    it('queries published products by product name search parameter', async () => {
      const mockProduct = {
        _id: 'p100',
        name: 'Studio Hanger Coat',
        slug: 'studio-hanger-coat',
        price: 164,
        status: 'published',
      };

      (ProductModel.findPaginated as jest.Mock).mockResolvedValue({
        products: [mockProduct],
        total: 1,
      });

      const res = await GET_PRODUCTS(makeRequest('http://localhost/api/products?search=Studio%20Hanger'));
      const body = await (res as any).json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(ProductModel.findPaginated).toHaveBeenCalledWith(
        1,
        50,
        expect.objectContaining({
          search: 'Studio Hanger',
          status: 'published',
        })
      );
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Studio Hanger Coat');
    });

    it('returns empty array when search by name matches no products', async () => {
      (ProductModel.findPaginated as jest.Mock).mockResolvedValue({
        products: [],
        total: 0,
      });

      const res = await GET_PRODUCTS(makeRequest('http://localhost/api/products?search=UnknownGarment'));
      const body = await (res as any).json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });
  });

  describe('GET /api/products/[slug] by slug and ID', () => {
    it('returns a published product by slug with related products', async () => {
      const mockProduct = {
        _id: 'p1',
        name: 'Studio Hanger Coat',
        slug: 'studio-hanger-coat',
        category: 'Outerwear',
        status: 'published',
      };

      (ProductModel.findBySlug as jest.Mock).mockResolvedValue(mockProduct);
      (ProductModel.findPaginated as jest.Mock).mockResolvedValue({
        products: [],
        total: 0,
      });

      const context = { params: Promise.resolve({ slug: 'studio-hanger-coat' }) };
      const res = await GET_PRODUCT_SLUG(makeRequest('http://localhost/api/products/studio-hanger-coat'), context);
      const body = await (res as any).json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.product.name).toBe('Studio Hanger Coat');
    });
  });
});
