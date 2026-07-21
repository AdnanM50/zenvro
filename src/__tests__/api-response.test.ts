jest.mock('next/server', () => {
  return {
    NextResponse: {
      json(data: unknown, init?: { status?: number }) {
        return {
          status: init?.status ?? 200,
          json: () => Promise.resolve(data),
          headers: new Map([['content-type', 'application/json']]),
        };
      },
    },
  };
});

import { api } from '@/lib/api-response';

async function parseResponse(res: any) {
  return { status: res.status as number, body: await res.json() };
}

describe('api response helper', () => {
  describe('success responses', () => {
    it('api.ok returns 200 with success body', async () => {
      const res = api.ok({ id: 1 }, 'Fetched');
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Fetched');
      expect(body.data).toEqual({ id: 1 });
      expect(body.meta).toBeUndefined();
    });

    it('api.ok uses default message', async () => {
      const res = api.ok('data');
      const { body } = await parseResponse(res);

      expect(body.success).toBe(true);
      expect(body.message).toBe('Success');
      expect(body.data).toBe('data');
    });

    it('api.created returns 201', async () => {
      const res = api.created({ name: 'Cat' }, 'Category created');
      const { status, body } = await parseResponse(res);

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Category created');
      expect(body.data).toEqual({ name: 'Cat' });
    });

    it('api.created uses default message', async () => {
      const res = api.created({});
      const { body } = await parseResponse(res);
      expect(body.message).toBe('Created successfully');
    });

    it('api.paginated returns 200 with meta', async () => {
      const res = api.paginated(
        [{ id: 1 }, { id: 2 }],
        { page: 1, limit: 20, total: 50, totalPages: 3 },
        'Paginated list',
      );
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Paginated list');
      expect(body.data).toHaveLength(2);
      expect(body.meta).toEqual({ page: 1, limit: 20, total: 50, totalPages: 3 });
    });
  });

  describe('error responses', () => {
    it('api.badRequest returns 400', async () => {
      const res = api.badRequest('Name required');
      const { status, body } = await parseResponse(res);

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Name required');
      expect(body.statusCode).toBe(400);
    });

    it('api.badRequest uses default message', async () => {
      const res = api.badRequest();
      const { body } = await parseResponse(res);
      expect(body.error).toBe('Bad request');
    });

    it('api.unauthorized returns 401', async () => {
      const res = api.unauthorized('No token');
      const { status, body } = await parseResponse(res);

      expect(status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe('No token');
    });

    it('api.forbidden returns 403', async () => {
      const res = api.forbidden();
      const { status, body } = await parseResponse(res);

      expect(status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Forbidden');
    });

    it('api.notFound returns 404', async () => {
      const res = api.notFound('Category missing');
      const { status, body } = await parseResponse(res);

      expect(status).toBe(404);
      expect(body.error).toBe('Category missing');
    });

    it('api.conflict returns 409', async () => {
      const res = api.conflict('Slug exists');
      const { status, body } = await parseResponse(res);

      expect(status).toBe(409);
      expect(body.error).toBe('Slug exists');
    });

    it('api.tooMany returns 429', async () => {
      const res = api.tooMany();
      const { status, body } = await parseResponse(res);

      expect(status).toBe(429);
      expect(body.error).toBe('Too many requests');
    });

    it('api.serverError returns 500', async () => {
      const res = api.serverError('DB down');
      const { status, body } = await parseResponse(res);

      expect(status).toBe(500);
      expect(body.error).toBe('DB down');
    });
  });
});
