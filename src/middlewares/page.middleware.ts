import { NextRequest, NextResponse } from 'next/server';
import { PageModel } from '@/models/page.model';
import type { Page } from '@/types';
import { api } from '@/lib/api-response';

export interface PageMiddlewareResult {
  page: Page;
}

export async function requireCMSPage(
  request: NextRequest,
  pageId?: string
): Promise<PageMiddlewareResult | NextResponse> {
  const id = pageId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Page ID is required');

  const page = await PageModel.findById(id);
  if (!page) return api.notFound('CMS Page not found');

  return { page: page as unknown as Page };
}

export function validatePagePayload(data: Record<string, unknown>): NextResponse | null {
  if ('title' in data && (!data.title || typeof data.title !== 'string' || !data.title.trim())) {
    return api.badRequest('Page title is required');
  }

  if ('slug' in data && (!data.slug || typeof data.slug !== 'string' || !data.slug.trim())) {
    return api.badRequest('Page slug is required');
  }

  return null;
}
