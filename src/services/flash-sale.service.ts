import type {
  FlashSale,
  CreateFlashSalePayload,
  UpdateFlashSalePayload,
  FlashSaleListParams,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/marketing/flash-sales';

export function getFlashSales(params: FlashSaleListParams = {}) {
  return httpGet<FlashSale[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createFlashSale(payload: CreateFlashSalePayload) {
  return httpPost<FlashSale>(BASE_URL, payload);
}

export function updateFlashSale(payload: UpdateFlashSalePayload) {
  return httpPatch<FlashSale>(BASE_URL, payload);
}

export function deleteFlashSale(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
