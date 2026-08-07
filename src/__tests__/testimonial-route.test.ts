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

jest.mock('@/models/testimonial.model', () => ({
  TestimonialModel: {
    findPaginated: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { TestimonialModel } from '@/models/testimonial.model';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/testimonials/route';

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
    url: options.url || 'http://localhost/api/admin/testimonials',
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

describe('Testimonials API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/testimonials', () => {
    it('returns 401 when token is missing', async () => {
      const req = makeRequest({ token: null });
      const res = await GET(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(401);
      expect(body.error).toBe('Not authenticated');
    });

    it('returns 403 when non-admin user requests testimonials', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(regularUser);
      const req = makeRequest();
      const res = await GET(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(403);
      expect(body.error).toBe('Forbidden');
    });

    it('returns paginated testimonials on valid admin request', async () => {
      const mockList = [{ _id: 't1', name: 'Emma' }];
      (TestimonialModel.findPaginated as jest.Mock).mockResolvedValue({
        testimonials: mockList,
        total: 1,
      });

      const req = makeRequest({ url: 'http://localhost/api/admin/testimonials?page=1&limit=10' });
      const res = await GET(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual(mockList);
      expect(body.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });
  });

  describe('POST /api/admin/testimonials', () => {
    it('returns 400 if required fields are missing', async () => {
      const req = makeRequest({ method: 'POST', body: { name: '' } });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Name is required');
    });

    it('returns 400 if rating is invalid', async () => {
      const req = makeRequest({
        method: 'POST',
        body: { name: 'Emma', role: 'Stylist', quote: 'Great', rating: 10 },
      });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Rating must be between 1 and 5');
    });

    it('creates testimonial and returns 201 on valid payload', async () => {
      const createdItem = { _id: 't100', name: 'Emma', role: 'Stylist', quote: 'Great' };
      (TestimonialModel.create as jest.Mock).mockResolvedValue(createdItem);

      const req = makeRequest({
        method: 'POST',
        body: { name: 'Emma', role: 'Stylist', quote: 'Great', rating: 5 },
      });
      const res = await POST(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.data).toEqual(createdItem);
    });
  });

  describe('PATCH /api/admin/testimonials', () => {
    it('returns 400 if _id is missing', async () => {
      const req = makeRequest({ method: 'PATCH', body: { name: 'Emma' } });
      const res = await PATCH(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 404 if testimonial is not found', async () => {
      (TestimonialModel.update as jest.Mock).mockResolvedValue(false);
      const req = makeRequest({ method: 'PATCH', body: { _id: 't999', name: 'Updated' } });
      const res = await PATCH(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Testimonial not found');
    });

    it('updates testimonial and returns 200 on success', async () => {
      (TestimonialModel.update as jest.Mock).mockResolvedValue(true);
      const req = makeRequest({ method: 'PATCH', body: { _id: 't1', name: 'Updated Emma' } });
      const res = await PATCH(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.message).toBe('Testimonial updated');
    });
  });

  describe('DELETE /api/admin/testimonials', () => {
    it('returns 400 if _id parameter is missing', async () => {
      const req = makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/testimonials' });
      const res = await DELETE(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 404 if testimonial to delete is not found', async () => {
      (TestimonialModel.delete as jest.Mock).mockResolvedValue(false);
      const req = makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/testimonials?_id=t999' });
      const res = await DELETE(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Testimonial not found');
    });

    it('deletes testimonial and returns 200 on success', async () => {
      (TestimonialModel.delete as jest.Mock).mockResolvedValue(true);
      const req = makeRequest({ method: 'DELETE', url: 'http://localhost/api/admin/testimonials?_id=t1' });
      const res = await DELETE(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.message).toBe('Testimonial deleted');
    });
  });
});
