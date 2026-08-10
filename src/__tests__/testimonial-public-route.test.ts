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

jest.mock('@/models/testimonial.model', () => ({
  TestimonialModel: {
    findAllActive: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { TestimonialModel } from '@/models/testimonial.model';
import { GET } from '@/app/api/testimonials/route';
import type { Testimonial } from '@/types';

function makeRequest(url = 'http://localhost/api/testimonials'): NextRequest {
  return { url } as unknown as NextRequest;
}

async function parseResponse(res: Response) {
  return { status: res.status, body: await res.json() };
}

function makeTestimonials(count: number): Testimonial[] {
  return Array.from({ length: count }, (_, i) => ({
    _id: `t${i}`,
    name: `Name ${i}`,
    role: 'Role',
    quote: 'Quote',
    avatar: '',
    rating: 5,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

describe('Public Testimonials API Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/testimonials (public)', () => {
    it('returns active testimonials without requiring authentication', async () => {
      const testimonials = makeTestimonials(3);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const req = makeRequest('http://localhost/api/testimonials');
      const res = await GET(req);
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(testimonials);
      expect(TestimonialModel.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('returns all testimonials when the count is below the default limit', async () => {
      const testimonials = makeTestimonials(3);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const res = await GET(makeRequest('http://localhost/api/testimonials'));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toHaveLength(3);
    });

    it('respects an explicit limit query param', async () => {
      const testimonials = makeTestimonials(10);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const res = await GET(makeRequest('http://localhost/api/testimonials?limit=2'));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toHaveLength(2);
      expect(body.data[0]._id).toBe('t0');
      expect(body.data[1]._id).toBe('t1');
    });

    it('caps the limit at the maximum allowed value', async () => {
      const testimonials = makeTestimonials(150);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const res = await GET(makeRequest('http://localhost/api/testimonials?limit=500'));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toHaveLength(100);
    });

    it('floors a fractional limit instead of returning a partial slice', async () => {
      const testimonials = makeTestimonials(10);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const res = await GET(makeRequest('http://localhost/api/testimonials?limit=2.9'));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toHaveLength(2);
    });

    it('falls back to the default limit for a non-numeric limit', async () => {
      const testimonials = makeTestimonials(70);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const res = await GET(makeRequest('http://localhost/api/testimonials?limit=abc'));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toHaveLength(50);
    });

    it('falls back to the default limit for zero and negative limits (Edge cases)', async () => {
      const testimonials = makeTestimonials(70);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const zeroRes = await GET(makeRequest('http://localhost/api/testimonials?limit=0'));
      const { body: zeroBody } = await parseResponse(zeroRes);
      expect(zeroBody.data).toHaveLength(50);

      const negativeRes = await GET(makeRequest('http://localhost/api/testimonials?limit=-5'));
      const { body: negativeBody } = await parseResponse(negativeRes);
      expect(negativeBody.data).toHaveLength(50);
    });

    it('falls back to the default limit for an empty limit param', async () => {
      const testimonials = makeTestimonials(70);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const res = await GET(makeRequest('http://localhost/api/testimonials?limit='));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toHaveLength(50);
    });

    it('returns an empty list when there are no testimonials yet', async () => {
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue([]);

      const res = await GET(makeRequest('http://localhost/api/testimonials'));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns 500 when the model throws', async () => {
      (TestimonialModel.findAllActive as jest.Mock).mockRejectedValue(new Error('db down'));

      const res = await GET(makeRequest('http://localhost/api/testimonials'));
      const { status, body } = await parseResponse(res);

      expect(status).toBe(500);
      expect(body.success).toBe(false);
    });

    it('never passes an auth cookie or admin token to the model', async () => {
      const testimonials = makeTestimonials(1);
      (TestimonialModel.findAllActive as jest.Mock).mockResolvedValue(testimonials);

      const req = makeRequest('http://localhost/api/testimonials');
      const res = await GET(req);
      const { status } = await parseResponse(res);

      expect(status).toBe(200);
      expect(TestimonialModel.findAllActive).toHaveBeenCalledWith();
    });
  });
});
