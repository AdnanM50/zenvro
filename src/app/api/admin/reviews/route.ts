import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ReviewModel } from '@/models/review.model';
import { api } from '@/lib/api-response';
import type { ReviewStatus, ReviewRating } from '@/types';

const REVIEW_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected'];

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

function parseStatus(value: unknown): ReviewStatus | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (REVIEW_STATUSES as string[]).includes(value)) {
    return value as ReviewStatus;
  }
  return 'INVALID' as unknown as ReviewStatus;
}

function parseRating(value: unknown): ReviewRating | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Math.round(Number(value));
  if (Number.isFinite(n) && n >= 1 && n <= 5) return n as ReviewRating;
  return undefined;
}

function parseBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value === 'true' || value === '1';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = parseStatus(searchParams.get('status'));
    const product = searchParams.get('product') || undefined;
    const rating = parseRating(searchParams.get('rating'));
    const isApproved = parseBool(searchParams.get('isApproved'));
    const isVerifiedPurchase = parseBool(searchParams.get('isVerifiedPurchase'));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { reviews, total } = await ReviewModel.findPaginated(page, limit, {
      search,
      status,
      product,
      rating,
      isApproved,
      isVerifiedPurchase,
    });
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(reviews, { page, limit, total, totalPages }, 'Reviews fetched');
  } catch (error) {
    console.error('Get reviews error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id } = body;

    if (!_id) return api.badRequest('_id is required');

    if (body.status !== undefined) {
      const parsedStatus = body.status === '' ? undefined : parseStatus(body.status);
      if (parsedStatus === undefined || parsedStatus === ('INVALID' as unknown as ReviewStatus)) {
        return api.badRequest('Invalid review status');
      }
      const updated = await ReviewModel.updateApproval(_id, parsedStatus);
      if (!updated) return api.notFound('Review not found');
      return api.ok(null, `Review ${parsedStatus}`);
    }

    return api.badRequest('status is required');
  } catch (error) {
    console.error('Update review error:', error);
    return api.serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) return api.badRequest('_id is required');

    const deleted = await ReviewModel.delete(_id);
    if (!deleted) return api.notFound('Review not found');

    return api.ok(null, 'Review deleted');
  } catch (error) {
    console.error('Delete review error:', error);
    return api.serverError();
  }
}
