import { NextResponse } from 'next/server';
import { api } from '@/lib/api-response';

export function validateWishlistPayload(data: Record<string, unknown>): NextResponse | null {
  if ('productId' in data && (!data.productId || typeof data.productId !== 'string')) {
    return api.badRequest('Product ID is required for wishlist operations');
  }

  return null;
}
