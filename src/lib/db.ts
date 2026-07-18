import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.DB_STRING || '';
const DB_NAME = 'velour';

let client: MongoClient | null = null;
let database: Db | null = null;

async function getDb(): Promise<Db> {
  if (database) return database;
  if (!MONGODB_URI) {
    throw new Error('DB_STRING environment variable is not set');
  }
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  database = client.db(DB_NAME);
  return database;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
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

export const db = {
  user: {
    async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
      const database = await getDb();
      const collection: Collection<User> = database.collection('users');
      const id = new ObjectId().toHexString();
      const user: User = {
        id,
        ...data,
        createdAt: new Date(),
      };
      await collection.insertOne(user as any);
      return user;
    },

    async findByEmail(email: string): Promise<User | null> {
      const database = await getDb();
      const collection: Collection<User> = database.collection('users');
      return collection.findOne({ email });
    },

    async findById(id: string): Promise<User | null> {
      const database = await getDb();
      const collection: Collection<User> = database.collection('users');
      return collection.findOne({ id });
    },
  },

  refreshToken: {
    async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
      const database = await getDb();
      const collection: Collection<RefreshToken> = database.collection('refresh_tokens');
      const id = new ObjectId().toHexString();
      const refreshToken: RefreshToken = {
        id,
        userId,
        token,
        expiresAt,
        createdAt: new Date(),
        isRevoked: false,
      };
      await collection.insertOne(refreshToken as any);
      return refreshToken;
    },

    async findByToken(token: string): Promise<RefreshToken | null> {
      const database = await getDb();
      const collection: Collection<RefreshToken> = database.collection('refresh_tokens');
      return collection.findOne({ token, isRevoked: false });
    },

    async revokeByToken(token: string): Promise<boolean> {
      const database = await getDb();
      const collection: Collection<RefreshToken> = database.collection('refresh_tokens');
      const result = await collection.updateOne({ token }, { $set: { isRevoked: true } });
      return result.modifiedCount > 0;
    },

    async revokeByUserId(userId: string): Promise<void> {
      const database = await getDb();
      const collection: Collection<RefreshToken> = database.collection('refresh_tokens');
      await collection.updateMany({ userId, isRevoked: false }, { $set: { isRevoked: true } });
    },

    async deleteExpired(): Promise<void> {
      const database = await getDb();
      const collection: Collection<RefreshToken> = database.collection('refresh_tokens');
      await collection.deleteMany({ expiresAt: { $lt: new Date() } });
    },

    async countByUserId(userId: string): Promise<number> {
      const database = await getDb();
      const collection: Collection<RefreshToken> = database.collection('refresh_tokens');
      return collection.countDocuments({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });
    },
  },
};
