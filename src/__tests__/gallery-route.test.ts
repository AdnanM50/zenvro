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

jest.mock('@/models/gallery.model', () => ({
  GalleryModel: {
    findPaginated: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/cloudinary', () => ({
  deleteImage: jest.fn(),
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { GalleryModel } from '@/models/gallery.model';
import { deleteImage } from '@/lib/cloudinary';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/gallery/route';

const adminUser = { _id: 'u1', name: 'Admin', email: 'admin@test.com', role: 'admin' };

function makeRequest(options: {
  url?: string;
  method?: string;
  body?: unknown;
  token?: string | null;
} = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    url: options.url || 'http://localhost/api/admin/gallery',
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

describe('Gallery API Route Handlers', () => {
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
      (UserModel.findById as jest.Mock).mockResolvedValue({ _id: 'u2', role: 'user' });

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(403);
    });

    it('returns a paginated list of gallery items for an admin', async () => {
      const items = [
        { _id: 'g1', url: 'https://example.com/a.jpg', source: 'url' },
        { _id: 'g2', url: 'https://res.cloudinary.com/x/a.jpg', source: 'upload' },
      ];
      (GalleryModel.findPaginated as jest.Mock).mockResolvedValue({ items, total: 2 });

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(items);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
      expect(GalleryModel.findPaginated).toHaveBeenCalledWith(1, 20, undefined);
    });

    it('passes search and pagination params through', async () => {
      (GalleryModel.findPaginated as jest.Mock).mockResolvedValue({ items: [], total: 0 });

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/admin/gallery?search=hero&page=3&limit=15' }),
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(GalleryModel.findPaginated).toHaveBeenCalledWith(3, 15, 'hero');
    });

    it('clamps page to >= 1 and limit to <= 100', async () => {
      (GalleryModel.findPaginated as jest.Mock).mockResolvedValue({ items: [], total: 0 });

      const res = await GET(
        makeRequest({ url: 'http://localhost/api/admin/gallery?page=0&limit=500' }),
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(GalleryModel.findPaginated).toHaveBeenCalledWith(1, 100, undefined);
    });

    it('returns 500 when the model throws', async () => {
      (GalleryModel.findPaginated as jest.Mock).mockRejectedValue(new Error('db down'));

      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('POST', () => {
    it('returns 400 when the URL is missing', async () => {
      const res = await POST(makeRequest({ method: 'POST', body: { title: 'Hero' } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid image URL is required (http or https)');
    });

    it('returns 400 for a non-http(s) URL', async () => {
      const res = await POST(
        makeRequest({ method: 'POST', body: { url: 'ftp://example.com/x.jpg' } }),
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid image URL is required (http or https)');
    });

    it('returns 400 for an invalid URL string', async () => {
      const res = await POST(makeRequest({ method: 'POST', body: { url: 'not-a-url' } }));
      const { status } = await parseResponse(res);

      expect(status).toBe(400);
    });

    it('creates a url-source item with defaults when source is omitted', async () => {
      (GalleryModel.create as jest.Mock).mockResolvedValue({
        _id: 'g1',
        url: 'https://example.com/a.jpg',
        source: 'url',
      });

      const res = await POST(
        makeRequest({ method: 'POST', body: { url: 'https://example.com/a.jpg', title: 'A' } }),
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(GalleryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com/a.jpg',
          title: 'A',
          source: 'url',
          publicId: undefined,
        }),
      );
    });

    it('creates an upload-source item with publicId', async () => {
      (GalleryModel.create as jest.Mock).mockResolvedValue({
        _id: 'g2',
        url: 'https://res.cloudinary.com/x/a.jpg',
        source: 'upload',
      });

      const res = await POST(
        makeRequest({
          method: 'POST',
          body: {
            url: 'https://res.cloudinary.com/x/a.jpg',
            publicId: 'velour/gallery/a',
            source: 'upload',
            mimeType: 'image/jpeg',
            size: 2048,
            width: 800,
            height: 600,
          },
        }),
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(201);
      expect(GalleryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          publicId: 'velour/gallery/a',
          source: 'upload',
          mimeType: 'image/jpeg',
          size: 2048,
          width: 800,
          height: 600,
        }),
      );
    });

    it('returns 500 when the model throws', async () => {
      (GalleryModel.create as jest.Mock).mockRejectedValue(new Error('db down'));

      const res = await POST(
        makeRequest({ method: 'POST', body: { url: 'https://example.com/a.jpg' } }),
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await PATCH(makeRequest({ method: 'PATCH', body: { title: 'New' } }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 400 for an invalid URL when url is passed', async () => {
      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'g1', url: 'javascript:alert(1)' } }),
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('A valid image URL is required (http or https)');
    });

    it('updates title and altText', async () => {
      (GalleryModel.update as jest.Mock).mockResolvedValue(true);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'g1', title: 'Hero', altText: 'Nice' } }),
      );
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(GalleryModel.update).toHaveBeenCalledWith(
        'g1',
        expect.objectContaining({ title: 'Hero', altText: 'Nice' }),
      );
    });

    it('returns 404 when the item does not exist', async () => {
      (GalleryModel.update as jest.Mock).mockResolvedValue(false);

      const res = await PATCH(
        makeRequest({ method: 'PATCH', body: { _id: 'missing', title: 'New' } }),
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Gallery item not found');
    });
  });

  describe('DELETE', () => {
    it('returns 400 when _id is missing', async () => {
      const res = await DELETE(makeRequest());
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.error).toBe('_id is required');
    });

    it('returns 404 when the item does not exist', async () => {
      (GalleryModel.findById as jest.Mock).mockResolvedValue(null);

      const res = await DELETE(makeRequest({ url: 'http://localhost/api/admin/gallery?_id=missing' }));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Gallery item not found');
      expect(GalleryModel.delete).not.toHaveBeenCalled();
    });

    it('deletes the record and removes the Cloudinary asset for uploaded images', async () => {
      (GalleryModel.findById as jest.Mock).mockResolvedValue({
        _id: 'g1',
        url: 'https://res.cloudinary.com/x/velour/a.jpg',
        publicId: 'velour/a',
        source: 'upload',
      });
      (GalleryModel.delete as jest.Mock).mockResolvedValue(true);

      const res = await DELETE(makeRequest({ url: 'http://localhost/api/admin/gallery?_id=g1' }));
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(deleteImage).toHaveBeenCalledWith('velour/a');
      expect(GalleryModel.delete).toHaveBeenCalledWith('g1');
    });

    it('skips Cloudinary deletion for url-source items (no publicId)', async () => {
      (GalleryModel.findById as jest.Mock).mockResolvedValue({
        _id: 'g2',
        url: 'https://example.com/b.jpg',
        source: 'url',
      });
      (GalleryModel.delete as jest.Mock).mockResolvedValue(true);

      const res = await DELETE(makeRequest({ url: 'http://localhost/api/admin/gallery?_id=g2' }));
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(deleteImage).not.toHaveBeenCalled();
      expect(GalleryModel.delete).toHaveBeenCalledWith('g2');
    });

    it('returns 500 when the model throws', async () => {
      (GalleryModel.findById as jest.Mock).mockRejectedValue(new Error('db down'));

      const res = await DELETE(makeRequest({ url: 'http://localhost/api/admin/gallery?_id=g1' }));
      const { status } = await parseResponse(res);

      expect(status).toBe(500);
    });
  });
});
