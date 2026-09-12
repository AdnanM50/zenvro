import { NextRequest, NextResponse } from 'next/server';
import { PopupBannerModel } from '@/models/popup-banner.model';
import type { PopupBanner } from '@/types';
import { api } from '@/lib/api-response';

export interface PopupMiddlewareResult {
  popup: PopupBanner;
}

export async function requirePopup(
  request: NextRequest,
  popupId?: string
): Promise<PopupMiddlewareResult | NextResponse> {
  const id = popupId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Popup ID is required');

  const popup = await PopupBannerModel.findById(id);
  if (!popup) return api.notFound('Popup not found');

  return { popup };
}

export function validatePopupPayload(data: Record<string, unknown>): NextResponse | null {
  if ('title' in data && (!data.title || typeof data.title !== 'string' || !data.title.trim())) {
    return api.badRequest('Popup title is required');
  }

  return null;
}
