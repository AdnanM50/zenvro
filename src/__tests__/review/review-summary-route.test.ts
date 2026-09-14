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

jest.mock('@/models/review.model', () => ({
  ReviewModel: {
    getProductRatingSummary: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { ReviewModel } from '@/models/review.model';
import { GET } from '@/app/api/reviews/summary/route';

function makeRequest(url: string): NextRequest {
  return { url } as unknown as NextRequest;
}

async function parseResponse(res: Response) {
  return { status: res.status, body: await res.json() };
}

describe('Review Summary API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when the product query param is missing', async () => {
    const res = await GET(makeRequest('http://localhost/api/reviews/summary'));
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe('product is required');
  });

  it('returns the rating summary for a product', async () => {
    (ReviewModel.getProductRatingSummary as jest.Mock).mockResolvedValue({
      product: 'p1',
      averageRating: 4.5,
      totalReviews: 10,
      ratingCounts: { 1: 1, 2: 0, 3: 1, 4: 3, 5: 5 },
    });

    const res = await GET(
      makeRequest('http://localhost/api/reviews/summary?product=p1')
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data).toEqual({
      product: 'p1',
      averageRating: 4.5,
      totalReviews: 10,
      ratingCounts: { 1: 1, 2: 0, 3: 1, 4: 3, 5: 5 },
    });
    expect(ReviewModel.getProductRatingSummary).toHaveBeenCalledWith('p1');
  });

  it('returns zeroed stats for a product with no reviews (Edge case)', async () => {
    (ReviewModel.getProductRatingSummary as jest.Mock).mockResolvedValue({
      product: 'p1',
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });

    const res = await GET(
      makeRequest('http://localhost/api/reviews/summary?product=p1')
    );
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.averageRating).toBe(0);
    expect(body.data.totalReviews).toBe(0);
  });

  it('returns 500 when the model throws', async () => {
    (ReviewModel.getProductRatingSummary as jest.Mock).mockRejectedValue(
      new Error('db down')
    );

    const res = await GET(
      makeRequest('http://localhost/api/reviews/summary?product=p1')
    );
    const { status } = await parseResponse(res);

    expect(status).toBe(500);
  });
});
