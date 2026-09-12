import { NextRequest, NextResponse } from 'next/server';
import { ProductModel } from '@/models/product.model';
import type { Product } from '@/types';
import { api } from '@/lib/api-response';

export interface ProductMiddlewareResult {
  product: Product;
}

/**
 * Middleware to verify product existence by ID.
 */
export async function requireProduct(
  request: NextRequest,
  productId?: string
): Promise<ProductMiddlewareResult | NextResponse> {
  const id = productId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Product ID is required');

  const product = await ProductModel.findById(id);
  if (!product) return api.notFound('Product not found');

  return { product };
}

/**
 * Validates product creation/update payloads.
 */
export function validateProductPayload(data: Record<string, unknown>): NextResponse | null {
  if ('title' in data && (!data.title || typeof data.title !== 'string' || !data.title.trim())) {
    return api.badRequest('Product title is required');
  }

  if ('price' in data && (typeof data.price !== 'number' || data.price < 0)) {
    return api.badRequest('Price must be a non-negative number');
  }

  if ('compareAtPrice' in data && data.compareAtPrice !== undefined && typeof data.compareAtPrice === 'number' && data.compareAtPrice < 0) {
    return api.badRequest('Compare-at price must be a non-negative number');
  }

  return null;
}
