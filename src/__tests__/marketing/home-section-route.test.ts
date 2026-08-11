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

jest.mock('@/models/home-section.model', () => ({
  HomeSectionModel: {
    findPaginated: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { HomeSectionModel } from '@/models/home-section.model';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/marketing/home-sections/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/marketing/home-sections',
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

describe('Home Sections API Route Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({
      userId: 'u1',
      email: 'admin@test.com',
      role: 'admin',
    });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
    (HomeSectionModel.findById as jest.Mock).mockResolvedValue(null);
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
      (UserModel.findById as jest.Mock).mockResolvedValue({ _id: 'u2', role: 'user' });

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(403);
    });

    it('returns a paginated list of sections for an admin', async () => {
      const sections = [{ _id: 'h1', title: 'Featured', sectionType: 'featured-products' }];
      (HomeSectionModel.findPaginated as jest.Mock).mockResolvedValue({ sections, total: 1 });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(sections);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(HomeSectionModel.findPaginated).toHaveBeenCalledWith(1, 20, {});
    });

    it('passes search, sectionType, enabled and pagination query params through', async () => {
      (HomeSectionModel.findPaginated as jest.Mock).mockResolvedValue({ sections: [], total: 0 });

      const url =
        'http://localhost/api/admin/marketing/home-sections?search=featured&sectionType=promo-banner&enabled=true&page=2&limit=5';
      await GET(makeRequest({ url }));

      expect(HomeSectionModel.findPaginated).toHaveBeenCalledWith(2, 5, {
        search: 'featured',
        sectionType: 'promo-banner',
        enabled: 'true',
      });
    });

    it('clamps out-of-range page and limit values (Edge case)', async () => {
      (HomeSectionModel.findPaginated as jest.Mock).mockResolvedValue({ sections: [], total: 0 });

      const url = 'http://localhost/api/admin/marketing/home-sections?page=0&limit=99999';
      await GET(makeRequest({ url }));

      expect(HomeSectionModel.findPaginated).toHaveBeenCalledWith(1, 100, {});
    });

    it('returns 500 when the model throws', async () => {
      (HomeSectionModel.findPaginated as jest.Mock).mockRejectedValue(new Error('DB down'));

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 400 when title is missing', async () => {
      const res = await POST(makeRequest({ method: 'POST', body: { sectionType: 'custom' } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Home section title is required');
    });

    it('returns 400 for an invalid section type', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { title: 'Section', sectionType: 'bogus' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid section type');
    });

    it('returns 400 for a negative sort order', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { title: 'Section', sortOrder: -3 } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Sort order must be a non-negative integer');
    });

    it('creates a section and returns 201 with defaults', async () => {
      const created = { _id: 'h-new', title: 'Section' };
      (HomeSectionModel.create as jest.Mock).mockResolvedValue(created);

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            title: '  Featured Products  ',
            subtitle: 'Handpicked',
            sectionType: 'featured-products',
            productIds: 'p-1, p-2',
            sortOrder: 1,
          },
        })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.data).toEqual(created);
      expect(HomeSectionModel.create).toHaveBeenCalledWith({
        title: 'Featured Products',
        subtitle: 'Handpicked',
        sectionType: 'featured-products',
        enabled: true,
        sortOrder: 1,
        productIds: ['p-1', 'p-2'],
        imageUrl: undefined,
        link: undefined,
        linkText: undefined,
        content: undefined,
      });
    });

    it('stores promo-banner fields only for the promo-banner type', async () => {
      (HomeSectionModel.create as jest.Mock).mockResolvedValue({ _id: 'h-new' });

      await POST(
        makeRequest({
          method: 'POST',
          body: { title: 'Banner', sectionType: 'promo-banner', imageUrl: 'https://img.com/b.png', link: '/x' },
        })
      );

      expect(HomeSectionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ sectionType: 'promo-banner', enabled: true, sortOrder: 0 })
      );
    });

    it('returns 500 when the model throws', async () => {
      (HomeSectionModel.create as jest.Mock).mockRejectedValue(new Error('DB down'));

      const res = await POST(makeRequest({ method: 'POST', body: { title: 'Section' } }));
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { title: 'X' } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 400 for an empty title', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'h1', title: '  ' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Home section title cannot be empty');
    });

    it('returns 400 for an invalid section type on update', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'h1', sectionType: 'nope' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('Invalid section type');
    });

    it('updates a section and returns 200', async () => {
      (HomeSectionModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({
          method: 'PATCH',
          body: { _id: 'h1', title: 'Updated', enabled: false, productIds: 'p-3' },
        })
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(HomeSectionModel.update).toHaveBeenCalledWith(
        'h1',
        expect.objectContaining({ title: 'Updated', enabled: false, productIds: ['p-3'] })
      );
    });

    it('returns 404 when the section does not exist', async () => {
      (HomeSectionModel.update as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'missing', title: 'X' } })
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Home section not found');
    });
  });

  describe('DELETE', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('deletes a section and returns 200', async () => {
      (HomeSectionModel.delete as jest.Mock).mockResolvedValue(true);

      const url = 'http://localhost/api/admin/marketing/home-sections?_id=h1';
      const res = await DELETE(makeRequest({ url }));
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(HomeSectionModel.delete).toHaveBeenCalledWith('h1');
    });

    it('returns 404 when the section is not found', async () => {
      (HomeSectionModel.delete as jest.Mock).mockResolvedValue(false);

      const url = 'http://localhost/api/admin/marketing/home-sections?_id=missing';
      const res = await DELETE(makeRequest({ url }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Home section not found');
    });
  });
});
