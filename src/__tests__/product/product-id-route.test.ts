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

jest.mock('@/models/product.model', () => ({
  ProductModel: {
    findById: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ProductModel } from '@/models/product.model';
import { GET } from '@/app/api/admin/products/[id]/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  id?: string;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: `http://localhost/api/admin/products/${options.id || 'p1'}`,
    method: 'GET',
    cookies: {
      get: (name: string) =>
        token && name === 'access_token' ? { value: token } : undefined,
    },
    json: async () => ({}),
  } as unknown as NextRequest;
}

async function parseResponse(res: Response) {
  return { status: res.status, body: await res.json() };
}

describe('GET /api/admin/products/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  it('returns 401 when no token is present', async () => {
    const res = await GET(makeRequest({ token: null }), {
      params: Promise.resolve({ id: 'p1' }),
    });
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('returns 403 for a non-admin user', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({ _id: 'u2', role: 'user' });

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: 'p1' }) });
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it('returns 400 when no id is provided', async () => {
    const res = await GET(makeRequest(), { params: Promise.resolve({ id: '' }) });
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toBe('_id is required');
  });

  it('returns the product for an admin', async () => {
    const product = { _id: 'p1', name: 'Classic Tee', sku: 'TSH-1', regularPrice: 49.99, stock: 25 };
    (ProductModel.findById as jest.Mock).mockResolvedValue(product);

    const res = await GET(makeRequest({ id: 'p1' }), {
      params: Promise.resolve({ id: 'p1' }),
    });
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(product);
    expect(ProductModel.findById).toHaveBeenCalledWith('p1');
  });

  it('returns 404 when the product does not exist', async () => {
    (ProductModel.findById as jest.Mock).mockResolvedValue(null);

    const res = await GET(makeRequest({ id: 'missing' }), {
      params: Promise.resolve({ id: 'missing' }),
    });
    const { status, body } = await parseResponse(res);

    expect(status).toBe(404);
    expect(body.error).toBe('Product not found');
  });

  it('returns 500 when the model throws', async () => {
    (ProductModel.findById as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: 'p1' }) });
    const { status } = await parseResponse(res);

    expect(status).toBe(500);
  });
});
