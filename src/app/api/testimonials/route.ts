import { NextRequest } from 'next/server';
import { TestimonialModel } from '@/models/testimonial.model';
import { api } from '@/lib/api-response';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function parseLimit(value: string | null): number {
  if (value === null || value === '') return DEFAULT_LIMIT;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

/**
 * PUBLIC testimonials endpoint (no auth required).
 * Serves only active testimonials, featured first.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const all = searchParams.get('all') === 'true';

    let testimonials = await TestimonialModel.findAllActive();

    if (search) {
      const s = search.toLowerCase();
      testimonials = testimonials.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.role.toLowerCase().includes(s) ||
          t.quote.toLowerCase().includes(s)
      );
    }

    if (all || (!pageParam && searchParams.get('limit') === null)) {
      const limit = parseLimit(limitParam);
      const data = testimonials.slice(0, limit);
      return api.ok(data, 'Testimonials fetched');
    }

    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = parseLimit(limitParam);

    const startIndex = (page - 1) * limit;
    const paginatedData = testimonials.slice(startIndex, startIndex + limit);
    const total = testimonials.length;
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(
      paginatedData,
      { page, limit, total, totalPages },
      'Testimonials fetched'
    );
  } catch (error) {
    console.error('Get public testimonials error:', error);
    return api.serverError('Failed to fetch testimonials');
  }
}
