import type {
  ContactMessage,
  ContactMessageStats,
  CreateContactMessagePayload,
  UpdateContactMessagePayload,
  ContactMessageListParams,
} from '@/types';
import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const ADMIN_BASE_URL = '/api/admin/contact';
const PUBLIC_BASE_URL = '/api/contact';

export function getContactMessages(params: ContactMessageListParams = {}) {
  return httpGet<ContactMessage[]>(`${ADMIN_BASE_URL}${buildQueryString(params)}`);
}

export function getContactMessageStats() {
  return httpGet<ContactMessageStats>(`${ADMIN_BASE_URL}/stats`);
}

export function createContactMessage(payload: CreateContactMessagePayload) {
  return httpPost<ContactMessage>(PUBLIC_BASE_URL, payload);
}

export function updateContactMessage(payload: UpdateContactMessagePayload) {
  return httpPatch<ContactMessage>(ADMIN_BASE_URL, payload);
}

export function deleteContactMessage(_id: string) {
  return httpDelete<null>(`${ADMIN_BASE_URL}?_id=${_id}`);
}
