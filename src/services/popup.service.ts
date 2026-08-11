import type {
  PopupBanner,
  CreatePopupBannerPayload,
  UpdatePopupBannerPayload,
  PopupBannerListParams,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/marketing/popups';

export function getPopupBanners(params: PopupBannerListParams = {}) {
  return httpGet<PopupBanner[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function createPopupBanner(payload: CreatePopupBannerPayload) {
  return httpPost<PopupBanner>(BASE_URL, payload);
}

export function updatePopupBanner(payload: UpdatePopupBannerPayload) {
  return httpPatch<PopupBanner>(BASE_URL, payload);
}

export function deletePopupBanner(_id: string) {
  return httpDelete<null>(`${BASE_URL}?_id=${_id}`);
}
