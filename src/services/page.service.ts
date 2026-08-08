import type {
  Page,
  CreatePagePayload,
  UpdatePagePayload,
  PageListParams,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const ADMIN_BASE_URL = '/api/admin/cms/pages';
const PUBLIC_BASE_URL = '/api/cms/pages';

export function getPages(params: PageListParams = {}) {
  return httpGet<Page[]>(`${ADMIN_BASE_URL}${buildQueryString(params)}`);
}

export function getPageById(id: string) {
  return httpGet<Page>(`${ADMIN_BASE_URL}/${id}`);
}

export function getPageBySlug(slug: string) {
  return httpGet<Page>(`${PUBLIC_BASE_URL}/${slug}`);
}

export function createPage(payload: CreatePagePayload) {
  return httpPost<Page>(ADMIN_BASE_URL, payload);
}

export function updatePage(payload: UpdatePagePayload) {
  return httpPatch<Page>(`${ADMIN_BASE_URL}/${payload._id}`, payload);
}

export function deletePage(_id: string) {
  return httpDelete<null>(`${ADMIN_BASE_URL}/${_id}`);
}
