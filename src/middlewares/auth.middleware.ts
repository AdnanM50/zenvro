import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel, type User } from '@/models/user.model';
import { api } from '@/lib/api-response';

export interface AuthenticatedUserResult {
  user: User;
}

export interface AuthenticatedAdminResult {
  admin: User;
}

/**
 * Extracts JWT token from request cookies or Authorization header.
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('access_token')?.value;
  if (token) return token;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Verifies JWT token from request.
 */
export function verifyToken(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyAccessToken(token);
}

export interface RequireUserOptions {
  /** Response behavior when the authenticated user does not exist. */
  onUserNotFound?: 'forbidden' | 'notFound' | 'unauthorized';
  /** Reject blocked accounts. */
  checkBlocked?: boolean;
}

/**
 * Middleware requirement for authenticated user routes.
 */
export async function requireUser(
  request: NextRequest,
  options: RequireUserOptions = {}
): Promise<AuthenticatedUserResult | NextResponse> {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();

  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');

  const user = await UserModel.findById(decoded.userId);
  if (!user) {
    if (options.onUserNotFound === 'notFound') return api.notFound('User not found');
    if (options.onUserNotFound === 'unauthorized') return api.unauthorized('User not found');
    return api.forbidden();
  }
  if (options.checkBlocked && user.status === 'blocked') return api.forbidden('Account is blocked');

  return { user };
}

/**
 * Middleware requirement for protected admin routes.
 */
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedAdminResult | NextResponse> {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();

  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');

  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();

  return { admin: user };
}
