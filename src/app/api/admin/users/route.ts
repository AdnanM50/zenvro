import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { api } from '@/lib/api-response';
import type { UserRole } from '@/types';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const users = await UserModel.findAll();
    return api.ok(users, 'Users fetched');
  } catch (error) {
    console.error('Get users error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) return api.badRequest('userId and role are required');

    const validRoles: UserRole[] = ['admin', 'user'];
    if (!validRoles.includes(role)) return api.badRequest('Invalid role');

    const updated = await UserModel.updateRole(userId, role);
    if (!updated) return api.notFound('User not found');

    return api.ok(null, 'User role updated');
  } catch (error) {
    console.error('Update user role error:', error);
    return api.serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return api.badRequest('userId is required');

    if (userId === (auth as { admin: { id: string } }).admin.id) {
      return api.badRequest('Cannot delete yourself');
    }

    const deleted = await UserModel.deleteById(userId);
    if (!deleted) return api.notFound('User not found');

    return api.ok(null, 'User deleted');
  } catch (error) {
    console.error('Delete user error:', error);
    return api.serverError();
  }
}
