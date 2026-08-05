import { NextRequest } from 'next/server';
import { ReviewModel } from '@/models/review.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');

    if (!product) return api.badRequest('product is required');

    const summary = await ReviewModel.getProductRatingSummary(product);
    return api.ok(summary, 'Rating summary fetched');
  } catch (error) {
    console.error('Get rating summary error:', error);
    return api.serverError();
  }
}
