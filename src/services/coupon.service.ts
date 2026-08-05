import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponListParams,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/coupons';

export function getCoupons(params: CouponListParams = {}) {
  return httpGet<Coupon[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createCoupon(payload: CreateCouponPayload) {
  return httpPost<Coupon>(BASE_URL, payload);
}

export function updateCoupon(payload: UpdateCouponPayload) {
  return httpPatch<Coupon>(BASE_URL, payload);
}

export function deleteCoupon(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
