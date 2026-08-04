import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import type { UserRole } from '@/types';

export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
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

const USERS_COLLECTION = 'users';
const REFRESH_COLLECTION = 'refresh_tokens';

async function usersCol(): Promise<Collection> {
  const db = await getDb();
  return db.collection(USERS_COLLECTION);
}

async function refreshCol(): Promise<Collection<RefreshToken>> {
  const db = await getDb();
  return db.collection<RefreshToken>(REFRESH_COLLECTION);
}

function buildIdQuery(id: string): any {
  if (ObjectId.isValid(id)) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }, { id }] };
  }
  return { $or: [{ _id: id }, { id }] };
}

function normalizeUser(raw: any): User {
  const _id = raw._id ? raw._id.toString() : raw.id || '';
  return {
    _id,
    email: raw.email,
    password: raw.password,
    name: raw.name,
    role: raw.role || 'user',
    createdAt: raw.createdAt,
  };
}

export const UserModel = {
  async create(data: Omit<User, '_id' | 'createdAt' | 'role'>): Promise<User> {
    const col = await usersCol();
    const _id = new ObjectId();
    const doc = {
      _id,
      ...data,
      role: 'user' as UserRole,
      createdAt: new Date(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await col.insertOne(doc as any);
    return {
      _id: _id.toHexString(),
      ...data,
      role: 'user',
      createdAt: doc.createdAt,
    };
  },

  async findByEmail(email: string): Promise<User | null> {
    const col = await usersCol();
    const raw = await col.findOne({ email });
    return raw ? normalizeUser(raw) : null;
  },

  async findById(id: string): Promise<User | null> {
    const col = await usersCol();
    const raw = await col.findOne(buildIdQuery(id));
    return raw ? normalizeUser(raw) : null;
  },

  async updateRole(id: string, role: UserRole): Promise<boolean> {
    const col = await usersCol();
    const result = await col.updateOne(buildIdQuery(id), { $set: { role } });
    return result.modifiedCount > 0;
  },

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const col = await usersCol();
    const raws = await col.find({}, { projection: { password: 0 } }).toArray();
    return raws.map((raw) => {
      const { password: _, ...rest } = normalizeUser(raw);
      return rest;
    });
  },

  async findPaginated({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const col = await usersCol();
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await col.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const skip = (safePage - 1) * limit;

    const raws = await col
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const users = raws.map((raw) => {
      const { password: _, ...rest } = normalizeUser(raw);
      return rest;
    });

    return {
      users,
      total,
      page: safePage,
      limit,
      totalPages,
    };
  },

  async deleteById(id: string): Promise<boolean> {
    const col = await usersCol();
    const result = await col.deleteOne(buildIdQuery(id));
    return result.deletedCount > 0;
  },

  // Refresh token operations
  refreshToken: {
    async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
      const col = await refreshCol();
      const id = new ObjectId().toHexString();
      const refreshToken: RefreshToken = {
        id,
        userId,
        token,
        expiresAt,
        createdAt: new Date(),
        isRevoked: false,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await col.insertOne(refreshToken as any);
      return refreshToken;
    },

    async findByToken(token: string): Promise<RefreshToken | null> {
      const col = await refreshCol();
      return col.findOne({ token, isRevoked: false });
    },

    async revokeByToken(token: string): Promise<boolean> {
      const col = await refreshCol();
      const result = await col.updateOne({ token }, { $set: { isRevoked: true } });
      return result.modifiedCount > 0;
    },

    async revokeByUserId(userId: string): Promise<void> {
      const col = await refreshCol();
      await col.updateMany({ userId, isRevoked: false }, { $set: { isRevoked: true } });
    },

    async deleteExpired(): Promise<void> {
      const col = await refreshCol();
      await col.deleteMany({ expiresAt: { $lt: new Date() } });
    },

    async countByUserId(userId: string): Promise<number> {
      const col = await refreshCol();
      return col.countDocuments({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });
    },
  },
};
