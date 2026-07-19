export type UserRole = 'admin' | 'user';

export interface ApiResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
