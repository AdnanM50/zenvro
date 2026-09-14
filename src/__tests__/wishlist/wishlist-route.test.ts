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
    getWishlist: jest.fn(),
    isInWishlist: jest.fn(),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { GET, POST, DELETE } from '@/app/api/wishlist/route';

const authUser = { _id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user', status: 'active' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/wishlist',
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

describe('Wishlist API Route Handlers', () => {
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

    it('returns 401 when the token belongs to a missing user', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(401);
      expect(body.error).toBe('User not found');
    });

    it('returns 403 for a blocked account', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        ...authUser,
        status: 'blocked',
      });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(403);
      expect(body.error).toBe('Account is blocked');
    });

    it('returns the current user wishlist', async () => {
      const wishlist = [{ product: 'p1', addedAt: new Date().toISOString() }];
      (UserModel.getWishlist as jest.Mock).mockResolvedValue(wishlist);

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual(wishlist);
      expect(UserModel.getWishlist).toHaveBeenCalledWith('u1');
    });

    it('returns an empty array for an empty wishlist (Edge case)', async () => {
      (UserModel.getWishlist as jest.Mock).mockResolvedValue([]);

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns 500 when the model throws', async () => {
      (UserModel.getWishlist as jest.Mock).mockRejectedValue(new Error('db down'));

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 401 when no token is present', async () => {
      const res = await POST(makeRequest({ token: null }));
      const { status } = await parseResponse(res);

      expect(status).toBe(401);
    });

    it('returns 400 when the product is missing', async () => {
      const res = await POST(makeRequest({ method: 'POST', body: {} }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('product is required');
    });

    it('returns 400 for a blank product string (Edge case)', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { product: '   ' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('product is required');
    });

    it('returns 409 when the product is already in the wishlist', async () => {
      (UserModel.isInWishlist as jest.Mock).mockResolvedValue(true);

      const res = await POST(
        makeRequest({ method: 'POST', body: { product: 'p1' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('Product is already in your wishlist');
      expect(UserModel.addToWishlist).not.toHaveBeenCalled();
    });

    it('adds a product and returns the updated wishlist', async () => {
      const wishlist = [
        { product: 'p1', addedAt: new Date().toISOString() },
        { product: 'p2', addedAt: new Date().toISOString() },
      ];
      (UserModel.isInWishlist as jest.Mock).mockResolvedValue(false);
      (UserModel.addToWishlist as jest.Mock).mockResolvedValue(true);
      (UserModel.getWishlist as jest.Mock).mockResolvedValue(wishlist);

      const res = await POST(
        makeRequest({ method: 'POST', body: { product: '  p2 ' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(wishlist);
      expect(UserModel.addToWishlist).toHaveBeenCalledWith('u1', 'p2');
    });

    it('returns 404 when the user is not found', async () => {
      (UserModel.isInWishlist as jest.Mock).mockResolvedValue(false);
      (UserModel.addToWishlist as jest.Mock).mockResolvedValue(false);

      const res = await POST(
        makeRequest({ method: 'POST', body: { product: 'p1' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('User not found');
    });

    it('returns 500 when the model throws', async () => {
      (UserModel.isInWishlist as jest.Mock).mockRejectedValue(new Error('db down'));

      const res = await POST(
        makeRequest({ method: 'POST', body: { product: 'p1' } })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('returns 401 when no token is present', async () => {
      const res = await DELETE(makeRequest({ token: null }));
      const { status } = await parseResponse(res);

      expect(status).toBe(401);
    });

    it('returns 400 when the product query param is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('product is required');
    });

    it('removes a product and returns the updated wishlist', async () => {
      const wishlist = [{ product: 'p2', addedAt: new Date().toISOString() }];
      (UserModel.removeFromWishlist as jest.Mock).mockResolvedValue(true);
      (UserModel.getWishlist as jest.Mock).mockResolvedValue(wishlist);

      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/wishlist?product=p1' })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(wishlist);
      expect(UserModel.removeFromWishlist).toHaveBeenCalledWith('u1', 'p1');
    });

    it('returns 404 when the product was not in the wishlist', async () => {
      (UserModel.removeFromWishlist as jest.Mock).mockResolvedValue(false);

      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/wishlist?product=p1' })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Product not found in wishlist');
    });

    it('returns 500 when the model throws', async () => {
      (UserModel.removeFromWishlist as jest.Mock).mockRejectedValue(
        new Error('db down')
      );

      const res = await DELETE(
        makeRequest({ url: 'http://localhost/api/wishlist?product=p1' })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });
});
