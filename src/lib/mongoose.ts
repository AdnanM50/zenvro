import mongoose from 'mongoose';

const MONGODB_URI = process.env.DB_STRING || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/velour';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const getCache = (): MongooseCache => {
  if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null };
  }
  return global.mongooseCache;
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  const cache = getCache();

  if (cache.conn) {
    return cache.conn;
  }

  if (process.env.NODE_ENV === 'test') {
    if (mongoose.connection.readyState >= 1) {
      cache.conn = mongoose;
      return mongoose;
    }
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: true,
      dbName: 'velour',
      serverSelectionTimeoutMS: 2000,
    };

    cache.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m).catch((err) => {
      if (process.env.NODE_ENV === 'test') {
        return mongoose;
      }
      throw err;
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    if (process.env.NODE_ENV === 'test') {
      return mongoose;
    }
    throw e;
  }

  return cache.conn;
}

export default connectToDatabase;
