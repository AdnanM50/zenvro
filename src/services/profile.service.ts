import type { Profile, UpdateProfilePayload, ChangePasswordPayload } from '@/types';
import { httpGet, httpPatch } from '@/lib/http-client';

const BASE_URL = '/api/admin/profile';

/** Fetches the current user's profile */
export function getProfile() {
  return httpGet<Profile>(BASE_URL);
}

/** Updates the current user's profile details */
export function updateProfile(payload: UpdateProfilePayload) {
  return httpPatch<Profile>(BASE_URL, payload);
}

/** Changes the current user's password */
export function changePassword(payload: ChangePasswordPayload) {
  return httpPatch<null>(`${BASE_URL}/password`, payload);
}
