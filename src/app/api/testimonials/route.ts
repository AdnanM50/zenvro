import { NextRequest } from 'next/server';
import { TestimonialModel } from '@/models/testimonial.model';
import { api } from '@/lib/api-response';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * Parses the `limit` query param into a safe integer.
 * Falls back to DEFAULT_LIMIT when the value is missing, empty, non-numeric,
 * zero, or negative; caps the result at MAX_LIMIT.
 */
function parseLimit(value: string | null): number {
  if (value === null || value === '') return DEFAULT_LIMIT;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

/**
 * PUBLIC testimonials endpoint (no auth required).
 *
 * Serves only active testimonials, featured first, as managed from the
 * private admin API (`/api/admin/testimonials`). The homepage consumes this
 * via `usePublicTestimonials` and the ISR-seeded server data.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));

    const testimonials = await TestimonialModel.findAllActive();
    const data = testimonials.slice(0, limit);

    return api.ok(data, 'Testimonials fetched');
  } catch (error) {
    console.error('Get public testimonials error:', error);
    return api.serverError();
  }
}
