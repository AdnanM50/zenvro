import { NextRequest, NextResponse } from 'next/server';
import { BrandModel } from '@/models/brand.model';
import type { Brand } from '@/types';
import { api } from '@/lib/api-response';

export interface BrandMiddlewareResult {
  brand: Brand;
}

export async function requireBrand(
  request: NextRequest,
  brandId?: string
): Promise<BrandMiddlewareResult | NextResponse> {
  const id = brandId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Brand ID is required');

  const brand = await BrandModel.findById(id);
  if (!brand) return api.notFound('Brand not found');

  return { brand };
}

export function validateBrandPayload(data: Record<string, unknown>): NextResponse | null {
  if ('name' in data && (!data.name || typeof data.name !== 'string' || !data.name.trim())) {
    return api.badRequest('Brand name is required');
  }

  return null;
}
