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

jest.mock('@/models/tag.model', () => ({
  TagModel: {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { GET } from '@/app/api/tags/route';
import { TagModel } from '@/models/tag.model';

function makeRequest(url = 'http://localhost/api/tags'): NextRequest {
  return { url } as unknown as NextRequest;
}

describe('GET /api/tags (Public API)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all tags when no page/limit parameters are provided', async () => {
    const mockTags = [
      { _id: 't1', name: 'Men', slug: 'men' },
      { _id: 't2', name: 'Polyester / Velvet', slug: 'polyester-velvet' },
    ];
    (TagModel.findAll as jest.Mock).mockResolvedValue(mockTags);

    const res = await GET(makeRequest('http://localhost/api/tags'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTags);
  });

  it('filters tags by search parameter in all tags mode', async () => {
    const mockTags = [
      { _id: 't1', name: 'Men', slug: 'men' },
      { _id: 't2', name: 'Polyester / Velvet', slug: 'polyester-velvet' },
    ];
    (TagModel.findAll as jest.Mock).mockResolvedValue(mockTags);

    const res = await GET(makeRequest('http://localhost/api/tags?search=velvet'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe('Polyester / Velvet');
  });

  it('returns paginated tags when page and limit parameters are provided', async () => {
    const mockTags = [{ _id: 't1', name: 'Men', slug: 'men' }];
    (TagModel.findPaginated as jest.Mock).mockResolvedValue({
      tags: mockTags,
      total: 1,
    });

    const res = await GET(makeRequest('http://localhost/api/tags?page=1&limit=10'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTags);
    expect(body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('handles server errors gracefully', async () => {
    (TagModel.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

    const res = await GET(makeRequest('http://localhost/api/tags'));
    const body = await (res as any).json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Failed to fetch tags');
  });
});
