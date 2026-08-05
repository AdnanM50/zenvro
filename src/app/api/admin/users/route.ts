import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { api } from '@/lib/api-response';
import type { UserRole, UserStatus } from '@/types';

const VALID_ROLES: UserRole[] = ['admin', 'user'];
const VALID_STATUSES: UserStatus[] = ['active', 'inactive', 'blocked'];

function parseRole(value: string | null): UserRole | undefined {
  if (value && (VALID_ROLES as string[]).includes(value)) return value as UserRole;
  return undefined;
}

function parseStatusFilter(value: string | null): UserStatus | undefined {
  if (value && (VALID_STATUSES as string[]).includes(value)) return value as UserStatus;
  return undefined;
}

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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search') || '';
    const status = parseStatusFilter(searchParams.get('status'));
    const role = parseRole(searchParams.get('role'));

    const result = await UserModel.findPaginated({ page, limit, search, status, role });
    return api.paginated(
      result.users,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      'Users fetched',
    );
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
    const { userId, role, status } = body;

    if (!userId) return api.badRequest('userId is required');
    if (!role && !status) return api.badRequest('role or status is required');

    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) return api.badRequest('Invalid role');
      const updated = await UserModel.updateRole(userId, role);
      if (!updated) return api.notFound('User not found');
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) return api.badRequest('Invalid status');
      const updated = await UserModel.updateStatus(userId, status);
      if (!updated) return api.notFound('User not found');
    }

    return api.ok(null, 'User updated');
  } catch (error) {
    console.error('Update user error:', error);
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

    if (userId === (auth as { admin: { _id: string } }).admin._id) {
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
