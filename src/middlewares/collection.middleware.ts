import { NextRequest, NextResponse } from 'next/server';
import { CollectionModel } from '@/models/collection.model';
import type { CollectionItem } from '@/types';
import { api } from '@/lib/api-response';

export interface CollectionMiddlewareResult {
  collection: CollectionItem;
}

export async function requireCollection(
  request: NextRequest,
  collectionId?: string
): Promise<CollectionMiddlewareResult | NextResponse> {
  const id = collectionId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Collection ID is required');

  const collection = await CollectionModel.findById(id);
  if (!collection) return api.notFound('Collection not found');

  return { collection: collection as unknown as CollectionItem };
}

export function validateCollectionPayload(data: Record<string, unknown>): NextResponse | null {
  if ('name' in data && (!data.name || typeof data.name !== 'string' || !data.name.trim())) {
    return api.badRequest('Collection name is required');
  }

  return null;
}
