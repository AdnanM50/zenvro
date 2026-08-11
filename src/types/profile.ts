// ---------------------------------------------------------------------------
// Admin Profile Module Types
// ---------------------------------------------------------------------------

import type { UserStatus } from './user';

/** Current user's profile returned by the admin profile API */
export interface Profile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  status: UserStatus;
  createdAt: Date;
}

/** Payload for updating profile details */
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

/** Payload for changing the account password */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
