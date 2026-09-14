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

jest.mock('@/models/testimonial.model', () => ({
  TestimonialModel: {
    findAllActive: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { GET } from '@/app/api/testimonials/route';
import { TestimonialModel } from '@/models/testimonial.model';

function makeRequest(url = 'http://localhost/api/testimonials'): NextRequest {
  return { url } as unknown as NextRequest;
}

describe('Public Testimonials API Route (GET /api/testimonials)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all active testimonials when limit/page is not provided', async () => {
    const mockTestimonials = [
      { _id: 't1', name: 'Elena', role: 'Architect', quote: 'Amazing coat', rating: 5, isActive: true },
      { _id: 't2', name: 'Marcus', role: 'Director', quote: 'Great leather', rating: 5, isActive: true },
    ];
    (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(mockTestimonials);

    const res = await GET(makeRequest('http://localhost/api/testimonials'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
  });

  it('filters active testimonials by search query', async () => {
    const mockTestimonials = [
      { _id: 't1', name: 'Elena', role: 'Architect', quote: 'Amazing coat', rating: 5, isActive: true },
      { _id: 't2', name: 'Marcus', role: 'Director', quote: 'Great leather', rating: 5, isActive: true },
    ];
    (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(mockTestimonials);

    const res = await GET(makeRequest('http://localhost/api/testimonials?search=leather'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe('Marcus');
  });

  it('returns paginated testimonials when page parameter is provided', async () => {
    const mockTestimonials = [
      { _id: 't1', name: 'Elena', role: 'Architect', quote: 'Amazing coat', rating: 5, isActive: true },
      { _id: 't2', name: 'Marcus', role: 'Director', quote: 'Great leather', rating: 5, isActive: true },
    ];
    (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(mockTestimonials);

    const res = await GET(makeRequest('http://localhost/api/testimonials?page=1&limit=1'));
    const body = await (res as any).json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.meta).toEqual({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
  });

  it('handles database errors gracefully', async () => {
    (TestimonialModel.findAllActive as jest.Mock).mockRejectedValue(new Error('DB failure'));

    const res = await GET(makeRequest('http://localhost/api/testimonials'));
    const body = await (res as any).json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Failed to fetch testimonials');
  });
});
