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

jest.mock('@/models/category.model', () => ({
  CategoryModel: {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { GET } from '@/app/api/categories/route';
import { CategoryModel } from '@/models/category.model';

function makeRequest(url = 'http://localhost/api/categories'): NextRequest {
  return { url } as unknown as NextRequest;
}

describe('GET /api/categories (Public API)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns active categories when no page/limit parameters are provided', async () => {
    const mockCategories = [
      { _id: 'cat1', name: 'Men', slug: 'men', isActive: true },
      { _id: 'cat2', name: 'Women', slug: 'women', isActive: true },
      { _id: 'cat3', name: 'Inactive Cat', slug: 'inactive', isActive: false },
    ];
    (CategoryModel.findAll as jest.Mock).mockResolvedValue(mockCategories);

    const res = await GET(makeRequest('http://localhost/api/categories'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data.map((c: any) => c.name)).toEqual(['Men', 'Women']);
  });

  it('filters categories by search parameter', async () => {
    const mockCategories = [
      { _id: 'cat1', name: 'Men', slug: 'men', isActive: true },
      { _id: 'cat2', name: 'Women', slug: 'women', isActive: true },
    ];
    (CategoryModel.findAll as jest.Mock).mockResolvedValue(mockCategories);

    const res = await GET(makeRequest('http://localhost/api/categories?search=women'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe('Women');
  });

  it('returns paginated categories when page and limit parameters are provided', async () => {
    const mockCategories = [
      { _id: 'cat1', name: 'Men', slug: 'men', isActive: true },
    ];
    (CategoryModel.findPaginated as jest.Mock).mockResolvedValue({
      categories: mockCategories,
      total: 1,
    });

    const res = await GET(makeRequest('http://localhost/api/categories?page=1&limit=10'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockCategories);
    expect(body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('handles server errors gracefully', async () => {
    (CategoryModel.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

    const res = await GET(makeRequest('http://localhost/api/categories'));
    const body = await (res as any).json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Failed to fetch categories');
  });
});
