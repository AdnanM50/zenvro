import { NextRequest, NextResponse } from 'next/server';
import { UserModel, type User } from '@/models/user.model';
import { api } from '@/lib/api-response';

export interface UserMiddlewareResult {
  targetUser: User;
}

/**
 * Middleware to require that a target user exists by ID from request query or params.
 */
export async function requireTargetUser(
  request: NextRequest,
  userId?: string
): Promise<UserMiddlewareResult | NextResponse> {
  const id = userId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('User ID is required');

  const targetUser = await UserModel.findById(id);
  if (!targetUser) return api.notFound('Target user not found');

  return { targetUser };
}

/**
 * Middleware to validate user creation/update payload.
 */
export function validateUserPayload(data: Record<string, unknown>): NextResponse | null {
  if (data.email && typeof data.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return api.badRequest('Invalid email format');
    }
  }

  if (data.role && !['user', 'admin'].includes(data.role as string)) {
    return api.badRequest('Invalid user role');
  }

  if (data.status && !['active', 'blocked'].includes(data.status as string)) {
    return api.badRequest('Invalid user status');
  }

  return null;
}
