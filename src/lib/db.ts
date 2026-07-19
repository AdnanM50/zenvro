import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.DB_STRING || '';
const DB_NAME = 'velour';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function getDb(): Promise<Db> {
  if (database) return database;
  if (!MONGODB_URI) {
    throw new Error('DB_STRING environment variable is not set');
  }
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  database = client.db(DB_NAME);
  return database;
}
