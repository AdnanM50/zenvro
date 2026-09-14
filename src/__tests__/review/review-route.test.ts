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
    findPaginated: jest.fn(),
    updateApproval: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ReviewModel } from '@/models/review.model';
import { GET, PATCH, DELETE } from '@/app/api/admin/reviews/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/reviews',
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

describe('Admin Reviews API Route Handlers', () => {
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

    it('returns a paginated list of reviews for an admin', async () => {
      const reviews = [
        { _id: 'r1', title: 'Great', rating: 5, status: 'pending' },
      ];
      (ReviewModel.findPaginated as jest.Mock).mockResolvedValue({
        reviews,
        total: 1,
      });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(reviews);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(ReviewModel.findPaginated).toHaveBeenCalledWith(1, 20, {});
    });

    it('passes search, status, product and pagination query params through', async () => {
      (ReviewModel.findPaginated as jest.Mock).mockResolvedValue({
        reviews: [],
        total: 0,
      });

      const res = await GET(
        makeRequest({
          url: 'http://localhost/api/admin/reviews?search=great&status=pending&product=p1&page=3&limit=15',
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ReviewModel.findPaginated).toHaveBeenCalledWith(3, 15, {
        search: 'great',
        status: 'pending',
        product: 'p1',
        rating: undefined,
        isApproved: undefined,
        isVerifiedPurchase: undefined,
      });
    });

    it('parses rating and boolean filters', async () => {
      (ReviewModel.findPaginated as jest.Mock).mockResolvedValue({
        reviews: [],
        total: 0,
      });

      const res = await GET(
        makeRequest({
          url: 'http://localhost/api/admin/reviews?rating=5&isApproved=true&isVerifiedPurchase=false',
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ReviewModel.findPaginated).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          rating: 5,
          isApproved: true,
          isVerifiedPurchase: false,
        })
      );
    });

    it('ignores an out-of-range rating filter (Edge case)', async () => {
      (ReviewModel.findPaginated as jest.Mock).mockResolvedValue({
        reviews: [],
        total: 0,
      });

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/admin/reviews?rating=9' })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ReviewModel.findPaginated).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({ rating: undefined })
      );
    });

    it('clamps page to >= 1 and limit to <= 100', async () => {
      (ReviewModel.findPaginated as jest.Mock).mockResolvedValue({
        reviews: [],
        total: 0,
      });

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/admin/reviews?page=0&limit=500' })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ReviewModel.findPaginated).toHaveBeenCalledWith(1, 100, {
        search: undefined,
        status: undefined,
        product: undefined,
        rating: undefined,
        isApproved: undefined,
        isVerifiedPurchase: undefined,
      });
    });

    it('returns 500 when the model throws', async () => {
      (ReviewModel.findPaginated as jest.Mock).mockRejectedValue(
        new Error('db down')
      );

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { status: 'approved' } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 400 when status is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { _id: 'r1' } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('status is required');
    });

    it('returns 400 for an invalid status', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'r1', status: 'bogus' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid review status');
    });

    it('approves a review', async () => {
      (ReviewModel.updateApproval as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'r1', status: 'approved' } })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ReviewModel.updateApproval).toHaveBeenCalledWith('r1', 'approved');
    });

    it('rejects a review', async () => {
      (ReviewModel.updateApproval as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'r1', status: 'rejected' } })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ReviewModel.updateApproval).toHaveBeenCalledWith('r1', 'rejected');
    });

    it('returns 404 when the review does not exist', async () => {
      (ReviewModel.updateApproval as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'missing', status: 'approved' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Review not found');
    });

    it('returns 500 when the model throws', async () => {
      (ReviewModel.updateApproval as jest.Mock).mockRejectedValue(
        new Error('db down')
      );

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'r1', status: 'approved' } })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('deletes a review and returns 200', async () => {
      (ReviewModel.delete as jest.Mock).mockResolvedValue(true);

      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/admin/reviews?_id=r1' })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(ReviewModel.delete).toHaveBeenCalledWith('r1');
    });

    it('returns 404 when the review does not exist', async () => {
      (ReviewModel.delete as jest.Mock).mockResolvedValue(false);

      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/admin/reviews?_id=missing' })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Review not found');
    });
  });
});
