import type {
  HomeSection,
  CreateHomeSectionPayload,
  UpdateHomeSectionPayload,
  HomeSectionListParams,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/marketing/home-sections';

export function getHomeSections(params: HomeSectionListParams = {}) {
  return httpGet<HomeSection[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createHomeSection(payload: CreateHomeSectionPayload) {
  return httpPost<HomeSection>(BASE_URL, payload);
}

export function updateHomeSection(payload: UpdateHomeSectionPayload) {
  return httpPatch<HomeSection>(BASE_URL, payload);
}

export function deleteHomeSection(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
