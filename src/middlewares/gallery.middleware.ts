import { NextRequest, NextResponse } from 'next/server';
import { GalleryModel } from '@/models/gallery.model';
import type { GalleryItem } from '@/types';
import { api } from '@/lib/api-response';

export interface GalleryMiddlewareResult {
  galleryItem: GalleryItem;
}

export async function requireGalleryItem(
  request: NextRequest,
  itemId?: string
): Promise<GalleryMiddlewareResult | NextResponse> {
  const id = itemId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Gallery item ID is required');

  const galleryItem = await GalleryModel.findById(id);
  if (!galleryItem) return api.notFound('Gallery item not found');

  return { galleryItem };
}

export function validateGalleryPayload(data: Record<string, unknown>): NextResponse | null {
  if ('url' in data && (!data.url || typeof data.url !== 'string' || !data.url.trim())) {
    return api.badRequest('Gallery item image URL is required');
  }

  return null;
}
