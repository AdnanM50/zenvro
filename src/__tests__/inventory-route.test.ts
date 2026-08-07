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

jest.mock('@/models/inventory.model', () => ({
  InventoryModel: {
    findPaginated: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ProductModel } from '@/models/product.model';
import { InventoryModel } from '@/models/inventory.model';
import { GET, POST, DELETE } from '@/app/api/admin/inventory/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };
const regularUser = { _id: 'u2', name: 'User', email: 'user@test.com', role: 'user' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/inventory',
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

describe('Inventory API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/inventory', () => {
    it('returns 401 when token is missing', async () => {
      const req = makeRequest({ token: null });
      const res = await GET(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(401);
      expect(body.error).toBe('Not authenticated');
    });

    it('returns 403 when non-admin user requests logs', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(regularUser);
      const req = makeRequest();
      const res = await GET(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(403);
      expect(body.error).toBe('Forbidden');
    });

    it('returns paginated inventory logs successfully', async () => {
      const mockItems = [{ _id: 'inv-1', productId: 'p1', quantity: 10, movementType: 'in' }];
      (InventoryModel.findPaginated as jest.Mock).mockResolvedValue({ items: mockItems, total: 1 });

      const req = makeRequest({ url: 'http://localhost/api/admin/inventory?page=1&limit=10' });
      const res = await GET(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual(mockItems);
      expect(body.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });
  });

  describe('POST /api/admin/inventory', () => {
    it('returns 400 if productId is missing', async () => {
      const req = makeRequest({ method: 'POST', body: { quantity: 10, movementType: 'in' } });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('productId is required');
    });

    it('returns 404 if product does not exist', async () => {
      (ProductModel.findById as jest.Mock).mockResolvedValue(null);
      const req = makeRequest({ method: 'POST', body: { productId: 'p999', quantity: 10, movementType: 'in' } });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Product not found');
    });

    it('returns 404 if specified variantSku does not exist on product', async () => {
      (ProductModel.findById as jest.Mock).mockResolvedValue({
        _id: 'p1',
        variants: [{ sku: 'VAR-1' }],
      });
      const req = makeRequest({
        method: 'POST',
        body: { productId: 'p1', variantSku: 'NON-EXISTENT', quantity: 10, movementType: 'in' },
      });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toContain('Variant with SKU "NON-EXISTENT" not found');
    });

    it('returns 400 if quantity is 0 or invalid', async () => {
      (ProductModel.findById as jest.Mock).mockResolvedValue({ _id: 'p1' });
      const req = makeRequest({
        method: 'POST',
        body: { productId: 'p1', quantity: 0, movementType: 'in' },
      });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A non-zero quantity is required');
    });

    it('returns 400 if movementType is invalid', async () => {
      (ProductModel.findById as jest.Mock).mockResolvedValue({ _id: 'p1' });
      const req = makeRequest({
        method: 'POST',
        body: { productId: 'p1', quantity: 10, movementType: 'invalid_type' },
      });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toContain('Invalid movementType');
    });

    it('creates inventory log and returns 201 on valid payload', async () => {
      (ProductModel.findById as jest.Mock).mockResolvedValue({ _id: 'p1' });
      const mockCreatedLog = { _id: 'inv-100', productId: 'p1', quantity: 50, movementType: 'in' };
      (InventoryModel.create as jest.Mock).mockResolvedValue(mockCreatedLog);

      const req = makeRequest({
        method: 'POST',
        body: { productId: 'p1', quantity: 50, movementType: 'in', note: 'Restock' },
      });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.data).toEqual(mockCreatedLog);
    });
  });

  describe('DELETE /api/admin/inventory', () => {
    it('returns 400 if _id query parameter is missing', async () => {
      const req = makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/inventory' });
      const res = await DELETE(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 404 if inventory log to delete is not found', async () => {
      (InventoryModel.delete as jest.Mock).mockResolvedValue(false);
      const req = makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/inventory?_id=inv-999' });
      const res = await DELETE(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Inventory log not found');
    });

    it('deletes log and returns 200 on success', async () => {
      (InventoryModel.delete as jest.Mock).mockResolvedValue(true);
      const req = makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/inventory?_id=inv-1' });
      const res = await DELETE(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.message).toBe('Inventory log deleted');
    });
  });
});
