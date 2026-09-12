import { NextRequest, NextResponse } from 'next/server';
import { ReviewModel } from '@/models/review.model';
import type { Review } from '@/types';
import { api } from '@/lib/api-response';

export interface ReviewMiddlewareResult {
  review: Review;
}

export async function requireReview(
  request: NextRequest,
  reviewId?: string
): Promise<ReviewMiddlewareResult | NextResponse> {
  const id = reviewId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Review ID is required');

  const review = await ReviewModel.findById(id);
  if (!review) return api.notFound('Review not found');

  return { review };
}

export function validateReviewPayload(data: Record<string, unknown>): NextResponse | null {
  if ('rating' in data && (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5)) {
    return api.badRequest('Rating must be an integer between 1 and 5');
  }

  if ('comment' in data && (!data.comment || typeof data.comment !== 'string' || !data.comment.trim())) {
    return api.badRequest('Review comment is required');
  }

  return null;
}
