import { NextRequest, NextResponse } from 'next/server';
import { HomeSectionModel } from '@/models/home-section.model';
import type { HomeSection } from '@/types';
import { api } from '@/lib/api-response';

export interface HomeSectionMiddlewareResult {
  homeSection: HomeSection;
}

export async function requireHomeSection(
  request: NextRequest,
  sectionId?: string
): Promise<HomeSectionMiddlewareResult | NextResponse> {
  const id = sectionId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Home section ID is required');

  const homeSection = await HomeSectionModel.findById(id);
  if (!homeSection) return api.notFound('Home section not found');

  return { homeSection };
}

export function validateHomeSectionPayload(data: Record<string, unknown>): NextResponse | null {
  if ('title' in data && (!data.title || typeof data.title !== 'string' || !data.title.trim())) {
    return api.badRequest('Home section title is required');
  }

  if ('type' in data && (!data.type || typeof data.type !== 'string')) {
    return api.badRequest('Home section type is required');
  }

  return null;
}
