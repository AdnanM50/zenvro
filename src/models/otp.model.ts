import { Collection } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

export interface OtpEntry {
  email: string;
  otp: string;
  name: string;
  password: string;
  expiresAt: Date;
  attempts: number;
}

const COLLECTION = 'otps';
const MAX_ATTEMPTS = 3;
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const SALT_ROUNDS = 12;

function collection(): Promise<Collection<OtpEntry>> {
  return getDb().then((db) => db.collection<OtpEntry>(COLLECTION));
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOtp(
  email: string,
  otp: string,
  name: string = '',
  password?: string,
): Promise<void> {
  const col = await collection();
  const hashedPassword = password ? await bcrypt.hash(password, SALT_ROUNDS) : '';
  await col.updateOne(
    { email },
    {
      $set: {
        email,
        otp,
        name,
        ...(hashedPassword ? { password: hashedPassword } : {}),
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
  const col = await collection();
  const entry = await col.findOne({ email });

  if (!entry) {
    return { valid: false };
  }

  if (new Date() > entry.expiresAt) {
    await col.deleteOne({ email });
    return { valid: false };
  }

  const newAttempts = entry.attempts + 1;

  if (newAttempts > MAX_ATTEMPTS) {
    await col.deleteOne({ email });
    return { valid: false };
  }

  if (entry.otp !== otp) {
    await col.updateOne({ email }, { $set: { attempts: newAttempts } });
    return { valid: false };
  }

  await col.deleteOne({ email });
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
