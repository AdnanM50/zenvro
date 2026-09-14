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

jest.mock('@/models/collection.model', () => ({
  CollectionModel: {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findBySlug: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('@/models/product.model', () => ({
  ProductModel: {
    findPaginated: jest.fn(),
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
import { GET as GET_COLLECTIONS } from '@/app/api/collections/route';
import { GET as GET_COLLECTION_SLUG } from '@/app/api/collections/[slug]/route';
import { CollectionModel } from '@/models/collection.model';
import { ProductModel } from '@/models/product.model';

function makeRequest(url = 'http://localhost/api/collections'): NextRequest {
  return { url } as unknown as NextRequest;
}

describe('Public Collections API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/collections', () => {
    it('returns all active collections when no pagination query parameters are provided', async () => {
      const mockCollections = [
        { _id: 'c1', name: 'Winter Monolith', slug: 'winter-monolith', isActive: true },
        { _id: 'c2', name: 'Quiet Utility', slug: 'quiet-utility', isActive: true },
        { _id: 'c3', name: 'Inactive Release', slug: 'inactive-release', isActive: false },
      ];
      (CollectionModel.findAll as jest.Mock).mockResolvedValue(mockCollections);

      const res = await GET_COLLECTIONS(makeRequest('http://localhost/api/collections'));
      const body = await (res as any).json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.data.map((c: any) => c.name)).toEqual(['Winter Monolith', 'Quiet Utility']);
    });

    it('filters collections by search parameter', async () => {
      const mockCollections = [
        { _id: 'c1', name: 'Winter Monolith', slug: 'winter-monolith', isActive: true },
        { _id: 'c2', name: 'Quiet Utility', slug: 'quiet-utility', isActive: true },
      ];
      (CollectionModel.findAll as jest.Mock).mockResolvedValue(mockCollections);

      const res = await GET_COLLECTIONS(makeRequest('http://localhost/api/collections?search=quiet'));
      const body = await (res as any).json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Quiet Utility');
    });

    it('returns paginated active collections when page and limit query parameters are provided', async () => {
      const mockCollections = [{ _id: 'c1', name: 'Winter Monolith', slug: 'winter-monolith', isActive: true }];
      (CollectionModel.findPaginated as jest.Mock).mockResolvedValue({
        collections: mockCollections,
        total: 1,
      });

      const res = await GET_COLLECTIONS(makeRequest('http://localhost/api/collections?page=1&limit=10'));
      const body = await (res as any).json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockCollections);
      expect(body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('handles database errors gracefully in collections list', async () => {
      (CollectionModel.findAll as jest.Mock).mockRejectedValue(new Error('Database offline'));

      const res = await GET_COLLECTIONS(makeRequest('http://localhost/api/collections'));
      const body = await (res as any).json();

      expect(res.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Failed to fetch collections');
    });
  });

  describe('GET /api/collections/[slug]', () => {
    it('returns a single collection and its formatted products by slug', async () => {
      const mockCollection = {
        _id: 'c1',
        name: 'Winter Monolith',
        slug: 'winter-monolith',
        isActive: true,
      };
      const mockProducts = [
        { _id: 'p1', name: 'Puffer Jacket', slug: 'puffer-jacket', collection: 'c1', status: 'published' },
      ];

      (CollectionModel.findBySlug as jest.Mock).mockResolvedValue(mockCollection);
      (ProductModel.findPaginated as jest.Mock).mockResolvedValue({
        products: mockProducts,
        total: 1,
      });

      const context = { params: Promise.resolve({ slug: 'winter-monolith' }) };
      const res = await GET_COLLECTION_SLUG(makeRequest('http://localhost/api/collections/winter-monolith'), context);
      const body = await (res as any).json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.collection).toEqual(mockCollection);
      expect(body.data.products).toHaveLength(1);
      expect(body.data.products[0].name).toBe('Puffer Jacket');
    });

    it('returns 404 when collection is not found or inactive', async () => {
      (CollectionModel.findBySlug as jest.Mock).mockResolvedValue(null);
      (CollectionModel.findById as jest.Mock).mockResolvedValue(null);

      const context = { params: Promise.resolve({ slug: 'non-existent-collection' }) };
      const res = await GET_COLLECTION_SLUG(makeRequest('http://localhost/api/collections/non-existent-collection'), context);
      const body = await (res as any).json();

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Collection not found');
    });
  });
});
