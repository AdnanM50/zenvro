import type { Brand, CreateBrandPayload, UpdateBrandPayload } from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/brands';

export interface BrandListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function getBrands(params: BrandListParams = {}) {
  return httpGet<Brand[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createBrand(payload: CreateBrandPayload) {
  return httpPost<Brand>(BASE_URL, payload);
}

export function updateBrand(payload: UpdateBrandPayload) {
  return httpPatch<Brand>(BASE_URL, payload);
}

export function deleteBrand(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
