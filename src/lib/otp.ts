import { MongoClient, Collection } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.DB_STRING || '';
const DB_NAME = 'velour';
const SALT_ROUNDS = 12;

let client: MongoClient | null = null;

async function getOtpCollection(): Promise<Collection<OtpEntry>> {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME).collection<OtpEntry>('otps');
}

interface OtpEntry {
  email: string;
  otp: string;
  name: string;
  password: string; // stored as hashed password
  expiresAt: Date;
  attempts: number;
}

const MAX_ATTEMPTS = 3;
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOtp(
  email: string,
  otp: string,
  name: string,
  password: string,
): Promise<void> {
  const collection = await getOtpCollection();
  // Hash the password before storing for security
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await collection.updateOne(
    { email },
    {
      $set: {
        email,
        otp,
        name,
        password: hashedPassword,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        attempts: 0,
      },
    },
    { upsert: true },
  );
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<{ valid: boolean; name?: string; password?: string }> {
  const collection = await getOtpCollection();
  const entry = await collection.findOne({ email });

  if (!entry) {
    return { valid: false };
  }

  if (new Date() > entry.expiresAt) {
    await collection.deleteOne({ email });
    return { valid: false };
  }

  const newAttempts = entry.attempts + 1;

  if (newAttempts > MAX_ATTEMPTS) {
    await collection.deleteOne({ email });
    return { valid: false };
  }

  if (entry.otp !== otp) {
    await collection.updateOne({ email }, { $set: { attempts: newAttempts } });
    return { valid: false };
  }

  await collection.deleteOne({ email });
  // Password is already hashed from storeOtp
  return { valid: true, name: entry.name, password: entry.password };
}

const rateLimitMap = new Map<string, number[]>();

export function isRateLimited(email: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(email) || [];
  const recent = timestamps.filter((t) => now - t < 60 * 1000);
  rateLimitMap.set(email, recent);
  return recent.length >= 3;
}

export function recordOtpRequest(email: string): void {
  const timestamps = rateLimitMap.get(email) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(email, timestamps);
}
