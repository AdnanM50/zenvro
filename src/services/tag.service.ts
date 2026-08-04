import type { Tag, CreateTagPayload, UpdateTagPayload } from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/tags';

export interface TagListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function getTags(params: TagListParams = {}) {
  return httpGet<Tag[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createTag(payload: CreateTagPayload) {
  return httpPost<Tag>(BASE_URL, payload);
}

export function updateTag(payload: UpdateTagPayload) {
  return httpPatch<Tag>(BASE_URL, payload);
}

export function deleteTag(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
