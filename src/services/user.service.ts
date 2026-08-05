import type { PublicUser, UserListParams, UserRole, UserStatus } from '@/types';
import { httpGet, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

const BASE_URL = '/api/admin/users';

/** Stats shape returned by the users stats endpoint */
export interface UserStats {
  total: number;
  admins: number;
  users: number;
  active: number;
  inactive: number;
  blocked: number;
}

export function getUsers(params: UserListParams = {}) {
  return httpGet<PublicUser[]>(`${BASE_URL}${buildQueryString(params)}`);
}

export function getUserStats() {
  return httpGet<UserStats>(`${BASE_URL}/stats`);
}

export function updateUserRole(payload: { userId: string; role: UserRole }) {
  return httpPatch<null>(BASE_URL, payload);
}

export function updateUserStatus(payload: { userId: string; status: UserStatus }) {
  return httpPatch<null>(BASE_URL, payload);
}

export function deleteUser(userId: string) {
  return httpDelete<null>(`${BASE_URL}?userId=${encodeURIComponent(userId)}`);
}
