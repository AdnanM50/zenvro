import { NextRequest, NextResponse } from 'next/server';
import { RedirectModel } from '@/models/redirect.model';
import type { Redirect } from '@/types';
import { api } from '@/lib/api-response';

export interface RedirectMiddlewareResult {
  redirect: Redirect;
}

export async function requireRedirectRule(
  request: NextRequest,
  redirectId?: string
): Promise<RedirectMiddlewareResult | NextResponse> {
  const id = redirectId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Redirect ID is required');

  const redirect = await RedirectModel.findById(id);
  if (!redirect) return api.notFound('Redirect rule not found');

  return { redirect: redirect as unknown as Redirect };
}

export function validateRedirectPayload(data: Record<string, unknown>): NextResponse | null {
  if ('from' in data && (!data.from || typeof data.from !== 'string' || !data.from.trim())) {
    return api.badRequest('"from" path is required');
  }

  if ('to' in data && (!data.to || typeof data.to !== 'string' || !data.to.trim())) {
    return api.badRequest('"to" path is required');
  }

  if (data.from && data.to && (data.from as string).trim() === (data.to as string).trim()) {
    return api.badRequest('"from" and "to" paths cannot be identical');
  }

  if ('type' in data) {
    const validTypes = [301, 302, 307, 308];
    if (!validTypes.includes(data.type as number)) {
      return api.badRequest('Redirect type must be 301, 302, 307, or 308');
    }
  }

  return null;
}
