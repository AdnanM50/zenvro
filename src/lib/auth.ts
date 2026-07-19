import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@/types';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const ACCESS_TOKEN_EXPIRES = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as string;
const REFRESH_TOKEN_EXPIRES = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string;
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateAccessToken(userId: string, email: string, role: UserRole): string {
  if (!JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET environment variable is not set');
  }
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRES as unknown as number };
  return jwt.sign({ userId, email, role, type: 'access' }, JWT_ACCESS_SECRET, options);
}

export function generateRefreshToken(userId: string, email: string): string {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRES as unknown as number };
  return jwt.sign({ userId, email, type: 'refresh' }, JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): { userId: string; email: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as {
      userId: string;
      email: string;
      role: UserRole;
      type: string;
    };
    if (decoded.type !== 'access') return null;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as {
      userId: string;
      email: string;
      type: string;
    };
    if (decoded.type !== 'refresh') return null;
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

export function generateTokenPair(userId: string, email: string, role: UserRole) {
  return {
    accessToken: generateAccessToken(userId, email, role),
    refreshToken: generateRefreshToken(userId, email),
  };
}
