import { NextRequest, NextResponse } from 'next/server';
import { FlashSaleModel } from '@/models/flash-sale.model';
import type { FlashSale } from '@/types';
import { api } from '@/lib/api-response';

export interface FlashSaleMiddlewareResult {
  flashSale: FlashSale;
}

export async function requireFlashSale(
  request: NextRequest,
  flashSaleId?: string
): Promise<FlashSaleMiddlewareResult | NextResponse> {
  const id = flashSaleId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Flash sale ID is required');

  const flashSale = await FlashSaleModel.findById(id);
  if (!flashSale) return api.notFound('Flash sale not found');

  return { flashSale };
}

export function validateFlashSalePayload(data: Record<string, unknown>): NextResponse | null {
  if ('title' in data && (!data.title || typeof data.title !== 'string' || !data.title.trim())) {
    return api.badRequest('Flash sale title is required');
  }

  if ('startTime' in data && 'endTime' in data) {
    const start = new Date(data.startTime as string).getTime();
    const end = new Date(data.endTime as string).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) {
      return api.badRequest('End time must be after start time');
    }
  }

  return null;
}
