import { NextRequest, NextResponse } from 'next/server';
import { VariantModel } from '@/models/variant.model';
import type { Variant } from '@/types';
import { api } from '@/lib/api-response';

export interface VariantMiddlewareResult {
  variant: Variant;
}

export async function requireVariant(
  request: NextRequest,
  variantId?: string
): Promise<VariantMiddlewareResult | NextResponse> {
  const id = variantId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Variant ID is required');

  const variant = await VariantModel.findById(id);
  if (!variant) return api.notFound('Variant not found');

  return { variant };
}

export function validateVariantPayload(data: Record<string, unknown>): NextResponse | null {
  if ('sku' in data && (!data.sku || typeof data.sku !== 'string' || !data.sku.trim())) {
    return api.badRequest('Variant SKU is required');
  }

  if ('price' in data && (typeof data.price !== 'number' || data.price < 0)) {
    return api.badRequest('Variant price must be a non-negative number');
  }

  if ('stock' in data && (typeof data.stock !== 'number' || data.stock < 0)) {
    return api.badRequest('Variant stock must be a non-negative number');
  }

  return null;
}
