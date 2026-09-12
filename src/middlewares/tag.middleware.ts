import { NextRequest, NextResponse } from 'next/server';
import { TagModel } from '@/models/tag.model';
import type { Tag } from '@/types';
import { api } from '@/lib/api-response';

export interface TagMiddlewareResult {
  tag: Tag;
}

export async function requireTag(
  request: NextRequest,
  tagId?: string
): Promise<TagMiddlewareResult | NextResponse> {
  const id = tagId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Tag ID is required');

  const tag = await TagModel.findById(id);
  if (!tag) return api.notFound('Tag not found');

  return { tag };
}

export function validateTagPayload(data: Record<string, unknown>): NextResponse | null {
  if ('name' in data && (!data.name || typeof data.name !== 'string' || !data.name.trim())) {
    return api.badRequest('Tag name is required');
  }

  return null;
}
