import { Collection, ObjectId, type Document, type PullOperator } from 'mongodb';
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
    phone: raw.phone || undefined,
    role: raw.role || 'user',
    status: raw.status || 'active',
    addresses: Array.isArray(raw.addresses) ? raw.addresses : [],
    wishlist: Array.isArray(raw.wishlist) ? raw.wishlist : [],
    createdAt: raw.createdAt,
  };
}

export const UserModel = {
  async create(data: Omit<User, '_id' | 'createdAt' | 'role' | 'status' | 'addresses' | 'wishlist'>): Promise<User> {
    const col = await usersCol();
    const _id = new ObjectId();
    const doc = {
      _id,
      ...data,
      role: 'user' as UserRole,
      status: 'active' as UserStatus,
      addresses: [] as UserAddress[],
      wishlist: [] as WishlistItem[],
      createdAt: new Date(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await col.insertOne(doc as any);
    return {
      _id: _id.toHexString(),
      ...data,
      role: 'user',
      status: 'active',
      addresses: [],
      wishlist: [],
      createdAt: doc.createdAt,
    };
  },

  async findByEmail(email: string): Promise<User | null> {
    const col = await usersCol();
    const raw = await col.findOne({ email: email.toLowerCase().trim() });
    return raw ? normalizeUser(raw) : null;
  },

  async seedAdmin(adminEmail = 'admin@gmail.com', adminPassword = '123456'): Promise<User> {
    const col = await usersCol();
    const email = adminEmail.toLowerCase().trim();
    const existing = await col.findOne({ email });
    const { hashPassword } = await import('@/lib/auth');
    const hashedPassword = await hashPassword(adminPassword);

    if (!existing) {
      const _id = new ObjectId();
      const doc = {
        _id,
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin' as UserRole,
        status: 'active' as UserStatus,
        addresses: [],
        wishlist: [],
        createdAt: new Date(),
      };
      await col.insertOne(doc as any);
      return normalizeUser(doc);
    } else {
      // Ensure existing admin user has a valid hashed password and active status
      await col.updateOne(
        { email },
        { $set: { password: hashedPassword, role: 'admin', status: 'active' } }
      );
      const updated = await col.findOne({ email });
      return normalizeUser(updated);
    }
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

  async updateStatus(id: string, status: UserStatus): Promise<boolean> {
    const col = await usersCol();
    const result = await col.updateOne(buildIdQuery(id), { $set: { status } });
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
    status,
    role,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: UserStatus;
    role?: UserRole;
  }): Promise<{
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const col = await usersCol();
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (role) query.role = role;

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

  async countByStatus(): Promise<{ total: number; admins: number; users: number; active: number; inactive: number; blocked: number }> {
    const col = await usersCol();
    const [total, admins, users, active, inactive, blocked] = await Promise.all([
      col.countDocuments(),
      col.countDocuments({ role: 'admin' }),
      col.countDocuments({ role: 'user' }),
      col.countDocuments({ status: 'active' }),
      col.countDocuments({ status: 'inactive' }),
      col.countDocuments({ status: 'blocked' }),
    ]);
    return { total, admins, users, active, inactive, blocked };
  },

  async deleteById(id: string): Promise<boolean> {
    const col = await usersCol();
    const result = await col.deleteOne(buildIdQuery(id));
    return result.deletedCount > 0;
  },

  // ── Wishlist operations (embedded in the user document) ──────────────────

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    const col = await usersCol();
    const raw = await col.findOne(buildIdQuery(userId), { projection: { wishlist: 1 } });
    return raw && Array.isArray(raw.wishlist) ? raw.wishlist : [];
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const col = await usersCol();
    const found = await col.findOne(
      { $and: [buildIdQuery(userId), { wishlist: { $elemMatch: { product: productId } } }] },
      { projection: { _id: 1 } }
    );
    return Boolean(found);
  },

  async addToWishlist(userId: string, productId: string): Promise<boolean> {
    const col = await usersCol();
    const result = await col.updateOne(buildIdQuery(userId), {
      $addToSet: { wishlist: { product: productId, addedAt: new Date() } },
    });
    return result.modifiedCount > 0;
  },

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const col = await usersCol();
    const result = await col.updateOne(buildIdQuery(userId), {
      $pull: { wishlist: { product: productId } } as unknown as PullOperator<Document>,
    });
    return result.modifiedCount > 0;
  },

  async clearWishlist(userId: string): Promise<boolean> {
    const col = await usersCol();
    const result = await col.updateOne(buildIdQuery(userId), {
      $set: { wishlist: [] },
    });
    return result.modifiedCount > 0;
  },

  async countWishlist(userId: string): Promise<number> {
    const col = await usersCol();
    const raw = await col.findOne(buildIdQuery(userId), { projection: { wishlist: 1 } });
    return raw && Array.isArray(raw.wishlist) ? raw.wishlist.length : 0;
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
