import type { Attribute, CreateAttributePayload, UpdateAttributePayload } from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/attributes';

export interface AttributeListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function getAttributes(params: AttributeListParams = {}) {
  return httpGet<Attribute[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createAttribute(payload: CreateAttributePayload) {
  return httpPost<Attribute>(BASE_URL, payload);
}

export function updateAttribute(payload: UpdateAttributePayload) {
  return httpPatch<Attribute>(BASE_URL, payload);
}

export function deleteAttribute(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
