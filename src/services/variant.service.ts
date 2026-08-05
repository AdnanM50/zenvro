import type { Variant, CreateVariantPayload, UpdateVariantPayload } from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/variants';

export interface VariantListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function getVariants(params: VariantListParams = {}) {
  return httpGet<Variant[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createVariant(payload: CreateVariantPayload) {
  return httpPost<Variant>(BASE_URL, payload);
}

export function updateVariant(payload: UpdateVariantPayload) {
  return httpPatch<Variant>(BASE_URL, payload);
}

export function deleteVariant(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
