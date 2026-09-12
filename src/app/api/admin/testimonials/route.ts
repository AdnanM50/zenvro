import { NextRequest } from 'next/server';
import { requireAdmin, validateTestimonialPayload, requireTestimonial } from '@/middlewares';
import { TestimonialModel } from '@/models/testimonial.model';
import { api } from '@/lib/api-response';
import { revalidatePublicTestimonials } from '@/lib/revalidate-page';

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseBooleanParam(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const isFeatured = parseBooleanParam(searchParams.get('isFeatured'));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { testimonials, total } = await TestimonialModel.findPaginated(page, limit, {
      search,
      status,
      isFeatured,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(testimonials, { page, limit, total, totalPages }, 'Testimonials fetched');
  } catch (error) {
    console.error('Get testimonials error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const validationError = validateTestimonialPayload({ author: body.name, content: body.quote });
    if (validationError) return validationError;

    const { name, role, quote, avatar, rating, reviewCount, isFeatured, status } = body;

    const ratingNum = parseNumber(rating);
    if (ratingNum !== undefined && (ratingNum < 1 || ratingNum > 5)) {
      return api.badRequest('Rating must be between 1 and 5');
    }

    if (status !== undefined && !['active', 'inactive'].includes(status)) {
      return api.badRequest('Status must be active or inactive');
    }

    const testimonial = await TestimonialModel.create({
      name: name.trim(),
      role: role ? role.trim() : 'Customer',
      quote: quote.trim(),
      avatar: typeof avatar === 'string' ? avatar.trim() : undefined,
      rating: ratingNum ?? 5,
      reviewCount: parseNumber(reviewCount),
      isFeatured: Boolean(isFeatured),
      status: status || 'active',
    });

    await revalidatePublicTestimonials();

    return api.created(testimonial, 'Testimonial created');
  } catch (error) {
    console.error('Create testimonial error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id, name, role, quote, avatar, rating, reviewCount, isFeatured, status } = body;

    const testimonialRes = await requireTestimonial(request, _id);
    if (testimonialRes instanceof Response) return testimonialRes;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) return api.badRequest('Name cannot be empty');
      updateData.name = name.trim();
    }

    if (role !== undefined) {
      if (typeof role !== 'string' || !role.trim()) return api.badRequest('Role cannot be empty');
      updateData.role = role.trim();
    }

    if (quote !== undefined) {
      if (typeof quote !== 'string' || !quote.trim()) return api.badRequest('Quote cannot be empty');
      updateData.quote = quote.trim();
    }

    if (avatar !== undefined) {
      updateData.avatar = typeof avatar === 'string' ? avatar.trim() : '';
    }

    if (rating !== undefined) {
      const ratingNum = parseNumber(rating);
      if (ratingNum === undefined || ratingNum < 1 || ratingNum > 5) {
        return api.badRequest('Rating must be between 1 and 5');
      }
      updateData.rating = ratingNum;
    }

    if (reviewCount !== undefined) {
      const countNum = parseNumber(reviewCount);
      if (countNum === undefined || countNum < 0) {
        return api.badRequest('Review count cannot be negative');
      }
      updateData.reviewCount = countNum;
    }

    if (isFeatured !== undefined) {
      updateData.isFeatured = Boolean(isFeatured);
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return api.badRequest('Status must be active or inactive');
      }
      updateData.status = status;
    }

    const updated = await TestimonialModel.update(_id, updateData);
    if (!updated) return api.notFound('Testimonial not found');

    await revalidatePublicTestimonials();

    return api.ok(null, 'Testimonial updated');
  } catch (error) {
    console.error('Update testimonial error:', error);
    return api.serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const testimonialRes = await requireTestimonial(request);
    if (testimonialRes instanceof Response) return testimonialRes;

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id') || searchParams.get('id')!;

    const deleted = await TestimonialModel.delete(_id);
    if (!deleted) return api.notFound('Testimonial not found');

    await revalidatePublicTestimonials();

    return api.ok(null, 'Testimonial deleted');
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return api.serverError();
  }
}
