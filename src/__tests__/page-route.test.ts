jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      json(data: unknown, init?: { status?: number }) {
        return {
          status: init?.status ?? 200,
          json: async () => data,
        } as unknown as Response;
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

jest.mock('@/models/page.model', () => ({
  PageModel: {
    seedDefaults: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { PageModel } from '@/models/page.model';
import { GET as adminGetPages, POST as adminCreatePage } from '@/app/api/admin/cms/pages/route';
import { GET as adminGetPageById, PATCH as adminUpdatePage, DELETE as adminDeletePage } from '@/app/api/admin/cms/pages/[id]/route';
import { GET as publicGetPageBySlug } from '@/app/api/cms/pages/[slug]/route';

const adminUser = { _id: 'admin1', name: 'Admin User', role: 'admin' };
const regularUser = { _id: 'user1', name: 'Regular User', role: 'user' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/cms/pages',
    method: options.method || 'GET',
    cookies: {
      get: (name: string) =>
        token && name === 'access_token' ? { value: token } : undefined,
    },
    json: async () => options.body ?? {},
  } as unknown as NextRequest;
}

describe('CMS Pages API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: adminUser._id });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/cms/pages', () => {
    it('returns 401 when unauthorized', async () => {
      (verifyAccessToken as jest.Mock).mockReturnValue(null);
      const req = makeRequest({ token: null });
      const res = await adminGetPages(req);
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(regularUser);
      const req = makeRequest();
      const res = await adminGetPages(req);
      expect(res.status).toBe(403);
    });

    it('fetches list of CMS pages after seeding defaults', async () => {
      const mockPages = [{ _id: 'p1', title: 'About Us', slug: 'about-us' }];
      (PageModel.findAll as jest.Mock).mockResolvedValue(mockPages);

      const req = makeRequest();
      const res = await adminGetPages(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(PageModel.seedDefaults).toHaveBeenCalled();
      expect(data.data).toEqual(mockPages);
    });
  });

  describe('POST /api/admin/cms/pages', () => {
    it('returns 400 if title is missing', async () => {
      const req = makeRequest({ method: 'POST', body: { title: '' } });
      const res = await adminCreatePage(req);
      expect(res.status).toBe(400);
    });

    it('creates page and returns 201 on success', async () => {
      const created = { _id: 'p1', title: 'New Custom Page', slug: 'new-custom-page' };
      (PageModel.create as jest.Mock).mockResolvedValue(created);

      const req = makeRequest({
        method: 'POST',
        body: { title: 'New Custom Page', status: 'published' },
      });

      const res = await adminCreatePage(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data).toEqual(created);
    });
  });

  describe('GET /api/admin/cms/pages/[id]', () => {
    it('returns 404 when page is not found', async () => {
      (PageModel.findById as jest.Mock).mockResolvedValue(null);
      const req = makeRequest();
      const res = await adminGetPageById(req, { params: Promise.resolve({ id: 'nonexistent' }) });
      expect(res.status).toBe(404);
    });

    it('returns page details when found', async () => {
      const page = { _id: 'p1', title: 'About Us' };
      (PageModel.findById as jest.Mock).mockResolvedValue(page);

      const req = makeRequest();
      const res = await adminGetPageById(req, { params: Promise.resolve({ id: 'p1' }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toEqual(page);
    });
  });

  describe('PATCH /api/admin/cms/pages/[id]', () => {
    it('updates page successfully', async () => {
      const updated = { _id: 'p1', title: 'Updated About Us' };
      (PageModel.update as jest.Mock).mockResolvedValue(updated);

      const req = makeRequest({
        method: 'PATCH',
        body: { title: 'Updated About Us' },
      });

      const res = await adminUpdatePage(req, { params: Promise.resolve({ id: 'p1' }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toEqual(updated);
    });
  });

  describe('DELETE /api/admin/cms/pages/[id]', () => {
    it('deletes page successfully', async () => {
      (PageModel.delete as jest.Mock).mockResolvedValue(true);

      const req = makeRequest({ method: 'DELETE' });
      const res = await adminDeletePage(req, { params: Promise.resolve({ id: 'p1' }) });

      expect(res.status).toBe(200);
      expect(PageModel.delete).toHaveBeenCalledWith('p1');
    });
  });

  describe('GET /api/cms/pages/[slug] (Public)', () => {
    it('returns 404 if page is not published or not found', async () => {
      (PageModel.findBySlug as jest.Mock).mockResolvedValue(null);
      const req = makeRequest();
      const res = await publicGetPageBySlug(req, { params: Promise.resolve({ slug: 'draft-page' }) });
      expect(res.status).toBe(404);
    });

    it('returns published page content', async () => {
      const page = { _id: 'p1', title: 'About Us', slug: 'about-us', status: 'published' };
      (PageModel.findBySlug as jest.Mock).mockResolvedValue(page);

      const req = makeRequest();
      const res = await publicGetPageBySlug(req, { params: Promise.resolve({ slug: 'about-us' }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toEqual(page);
    });
  });
});
