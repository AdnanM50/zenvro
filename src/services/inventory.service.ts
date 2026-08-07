import type {
  InventoryItem,
  CreateInventoryPayload,
  InventoryListParams,
} from '@/types';
import { httpGet, httpPost, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/inventory';

export function getInventoryLogs(params: InventoryListParams = {}) {
  return httpGet<InventoryItem[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createInventoryLog(payload: CreateInventoryPayload) {
  return httpPost<InventoryItem>(BASE_URL, payload);
}

export function deleteInventoryLog(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
