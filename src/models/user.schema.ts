import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import type { UserRole, UserStatus, UserAddress, WishlistItem } from '@/types';

export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  addresses: UserAddress[];
  wishlist: WishlistItem[];
  createdAt: Date;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
}

export const USERS_COLLECTION = 'users';
export const REFRESH_COLLECTION = 'refresh_tokens';

export async function usersCol(): Promise<Collection> {
  const db = await getDb();
  return db.collection(USERS_COLLECTION);
}

export async function refreshCol(): Promise<Collection<RefreshToken>> {
  const db = await getDb();
  return db.collection<RefreshToken>(REFRESH_COLLECTION);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildIdQuery(id: string): any {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }, { id }] };
  }
  return { $or: [{ _id: id }, { id }] };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeUser(raw: any): User {
  const _id = raw._id ? raw._id.toString() : raw.id || '';
  return {
    _id,
    email: raw.email,
    password: raw.password,
    name: raw.name,
    phone: raw.phone || undefined,
    role: raw.role || 'user',
    status: raw.status || 'active',
    addresses: Array.isArray(raw.addresses) ? raw.addresses : [],
    wishlist: Array.isArray(raw.wishlist) ? raw.wishlist : [],
    createdAt: raw.createdAt,
  };
}
