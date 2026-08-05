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

jest.mock('@/models/review.model', () => ({
  ReviewModel: {
    findApprovedByProduct: jest.fn(),
    create: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ReviewModel } from '@/models/review.model';
import { GET, POST } from '@/app/api/reviews/route';

const authUser = { _id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/reviews',
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

describe('Public Reviews API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'alice@test.com',
      role: 'user',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(authUser);
  });

  describe('GET', () => {
    it('returns 400 when the product query param is missing', async () => {
      const res = await GET(makeRequest({ url: 'http://localhost/api/reviews' }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('product is required');
    });

    it('returns approved reviews for a product without requiring auth', async () => {
      const reviews = [{ _id: 'r1', rating: 5, status: 'approved' }];
      (ReviewModel.findApprovedByProduct as jest.Mock).mockResolvedValue(reviews);

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/reviews?product=p1', token: null })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual(reviews);
      expect(ReviewModel.findApprovedByProduct).toHaveBeenCalledWith('p1');
    });

    it('returns an empty list when there are no approved reviews (Edge case)', async () => {
      (ReviewModel.findApprovedByProduct as jest.Mock).mockResolvedValue([]);

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/reviews?product=p1' })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns 500 when the model throws', async () => {
      (ReviewModel.findApprovedByProduct as jest.Mock).mockRejectedValue(
        new Error('db down')
      );

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/reviews?product=p1' })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 401 when no token is present', async () => {
      const res = await POST(makeRequest({ token: null }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(401);
      expect(body.success).toBe(false);
    });

    it('returns 401 for an invalid token', async () => {
      (verifyAccessToken as jest.Mock).mockReturnValue(null);

      const res = await POST(makeRequest({ token: 'garbage' }));
      const { status } = await parseResponse(res);

      expect(status).toBe(401);
    });

    it('returns 401 when the token belongs to a missing user', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      const res = await POST(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(401);
      expect(body.error).toBe('User not found');
    });

    it('returns 400 when the product is missing', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { rating: 5, title: 'Great', comment: 'Nice' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('product is required');
    });

    it('returns 400 when the title is missing', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { product: 'p1', rating: 5, comment: 'Nice' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Review title is required');
    });

    it('returns 400 when the comment is missing', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { product: 'p1', rating: 5, title: 'Great' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Review comment is required');
    });

    it('returns 400 for an out-of-range rating', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { product: 'p1', rating: 6, title: 'Great', comment: 'Nice' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Rating must be a number between 1 and 5');
    });

    it('returns 400 for a zero or negative rating (Edge case)', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { product: 'p1', rating: 0, title: 'Great', comment: 'Nice' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Rating must be a number between 1 and 5');
    });

    it('returns 400 for a non-numeric rating (Edge case)', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { product: 'p1', rating: 'excellent', title: 'Great', comment: 'Nice' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Rating must be a number between 1 and 5');
    });

    it('returns 400 when the title exceeds 100 characters', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { product: 'p1', rating: 5, title: 'x'.repeat(101), comment: 'Nice' },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Review title cannot exceed 100 characters');
    });

    it('returns 400 when the comment exceeds 2000 characters', async () => {
      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { product: 'p1', rating: 5, title: 'Great', comment: 'x'.repeat(2001) },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Review comment cannot exceed 2000 characters');
    });

    it('accepts a decimal rating and rounds it to an integer (Edge case)', async () => {
      (ReviewModel.create as jest.Mock).mockResolvedValue({ _id: 'r-new', rating: 5 });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { product: 'p1', rating: 4.5, title: 'Great', comment: 'Nice' },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(201);
      expect(ReviewModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ rating: 5 })
      );
    });

    it('creates a review with the authenticated user and normalized fields', async () => {
      (ReviewModel.create as jest.Mock).mockResolvedValue({
        _id: 'r-new',
        product: 'p1',
        user: 'u1',
        rating: 5,
        status: 'pending',
      });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            product: '  p1 ',
            rating: 5,
            title: '  Great  ',
            comment: '  Love it  ',
            images: [' https://img.com/a.png ', 'https://img.com/b.png'],
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(ReviewModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          product: 'p1',
          user: 'u1',
          rating: 5,
          title: 'Great',
          comment: 'Love it',
          images: ['https://img.com/a.png', 'https://img.com/b.png'],
        })
      );
    });

    it('creates a review without images (defaults to empty array)', async () => {
      (ReviewModel.create as jest.Mock).mockResolvedValue({ _id: 'r-new' });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { product: 'p1', rating: 4, title: 'OK', comment: 'Fine' },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(201);
      expect(ReviewModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ images: [] })
      );
    });

    it('returns 500 when the model throws', async () => {
      (ReviewModel.create as jest.Mock).mockRejectedValue(new Error('db down'));

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: { product: 'p1', rating: 5, title: 'Great', comment: 'Nice' },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });
});
