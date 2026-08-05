import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { ReviewModel } from '@/models/review.model';
import { api } from '@/lib/api-response';
import type { ReviewRating } from '@/types';

/** Parses a rating value into a valid 1..5 integer or null when invalid/absent. */
function parseRating(value: unknown): ReviewRating | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Math.round(Number(value));
  if (Number.isFinite(n) && n >= 1 && n <= 5) return n as ReviewRating;
  return null;
}

/** Coerces a raw value into a clean string list (array or comma-separated string). */
function parseStringList(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');

    if (!product) return api.badRequest('product is required');

    const reviews = await ReviewModel.findApprovedByProduct(product);
    return api.ok(reviews, 'Reviews fetched');
  } catch (error) {
    console.error('Get product reviews error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return api.unauthorized();
    const decoded = verifyAccessToken(token);
    if (!decoded) return api.unauthorized('Invalid or expired token');

    const user = await UserModel.findById(decoded.userId);
    if (!user) return api.unauthorized('User not found');

    const body = await request.json();
    const { product, rating, title, comment, images } = body;

    if (typeof product !== 'string' || !product.trim()) {
      return api.badRequest('product is required');
    }
    if (typeof title !== 'string' || !title.trim()) {
      return api.badRequest('Review title is required');
    }
    if (typeof comment !== 'string' || !comment.trim()) {
      return api.badRequest('Review comment is required');
    }
    if (title.trim().length > 100) {
      return api.badRequest('Review title cannot exceed 100 characters');
    }
    if (comment.trim().length > 2000) {
      return api.badRequest('Review comment cannot exceed 2000 characters');
    }

    const parsedRating = parseRating(rating);
    if (parsedRating === null) {
      return api.badRequest('Rating must be a number between 1 and 5');
    }

    const review = await ReviewModel.create({
      product: product.trim(),
      user: user._id,
      rating: parsedRating,
      title: title.trim(),
      comment: comment.trim(),
      images: parseStringList(images),
    });

    return api.created(review, 'Review submitted');
  } catch (error) {
    console.error('Create review error:', error);
    return api.serverError();
  }
}
