import type { CollectionItem, CreateCollectionPayload, UpdateCollectionPayload } from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/collections';
const PUBLIC_BASE_URL = '/api/collections';

export interface CollectionListParams {
  page?: number;
  limit?: number;
  search?: string;
  all?: boolean;
}

export function getCollections(params: CollectionListParams = {}) {
  return httpGet<CollectionItem[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function getPublicCollections(params: CollectionListParams = {}) {
  return httpGet<CollectionItem[]>(`${PUBLIC_BASE_URL}${buildQueryString(params)}`);
}

export function getPublicCollectionBySlug(slug: string) {
  return httpGet<{ collection: CollectionItem; products: any[] }>(`${PUBLIC_BASE_URL}/${slug}`);
}

export function createCollection(payload: CreateCollectionPayload) {
  return httpPost<CollectionItem>(BASE_URL, payload);
}

export function updateCollection(payload: UpdateCollectionPayload) {
  return httpPatch<CollectionItem>(BASE_URL, payload);
}

export function deleteCollection(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}

