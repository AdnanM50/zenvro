import { NextRequest, NextResponse } from 'next/server';
import { CouponModel } from '@/models/coupon.model';
import type { Coupon } from '@/types';
import { api } from '@/lib/api-response';

export interface CouponMiddlewareResult {
  coupon: Coupon;
}

export async function requireCoupon(
  request: NextRequest,
  couponId?: string
): Promise<CouponMiddlewareResult | NextResponse> {
  const id = couponId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Coupon ID is required');

  const coupon = await CouponModel.findById(id);
  if (!coupon) return api.notFound('Coupon not found');

  return { coupon };
}

export function validateCouponPayload(data: Record<string, unknown>): NextResponse | null {
  if ('code' in data && (!data.code || typeof data.code !== 'string' || !data.code.trim())) {
    return api.badRequest('Coupon code is required');
  }

  if ('discountValue' in data && (typeof data.discountValue !== 'number' || data.discountValue <= 0)) {
    return api.badRequest('Discount value must be a positive number');
  }

  if ('discountType' in data && !['percentage', 'fixed'].includes(data.discountType as string)) {
    return api.badRequest('Invalid discount type (percentage or fixed expected)');
  }

  return null;
}
