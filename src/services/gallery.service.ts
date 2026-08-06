import type { GalleryItem, CreateGalleryPayload, UpdateGalleryPayload } from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/gallery';

export interface GalleryListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function getGallery(params: GalleryListParams = {}) {
  return httpGet<GalleryItem[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createGalleryItem(payload: CreateGalleryPayload) {
  return httpPost<GalleryItem>(BASE_URL, payload);
}

export function updateGalleryItem(payload: UpdateGalleryPayload) {
  return httpPatch<GalleryItem>(BASE_URL, payload);
}

export function deleteGalleryItem(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
