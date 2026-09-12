import { NextRequest, NextResponse } from 'next/server';
import { CategoryModel } from '@/models/category.model';
import type { Category } from '@/types';
import { api } from '@/lib/api-response';

export interface CategoryMiddlewareResult {
  category: Category;
}

/**
 * Middleware to verify category existence by ID.
 */
export async function requireCategory(
  request: NextRequest,
  categoryId?: string
): Promise<CategoryMiddlewareResult | NextResponse> {
  const id = categoryId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Category ID is required');

  const category = await CategoryModel.findById(id);
  if (!category) return api.notFound('Category not found');

  return { category };
}

/**
 * Validates category creation/update payload.
 */
export function validateCategoryPayload(data: Record<string, unknown>): NextResponse | null {
  if ('name' in data && (!data.name || typeof data.name !== 'string' || !data.name.trim())) {
    return api.badRequest('Category name is required');
  }

  return null;
}
