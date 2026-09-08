import { NextRequest } from 'next/server';
import { requireUser } from '@/middlewares';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { api } from '@/lib/api-response';

const MIN_PASSWORD_LENGTH = 6;
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'notFound' });
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { currentPassword, newPassword } = body ?? {};

    if (typeof currentPassword !== 'string' || !currentPassword.trim()) {
      return api.badRequest('Current password is required');
    }
    if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      return api.badRequest(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    if (newPassword === currentPassword) {
      return api.badRequest('New password must be different from the current password');
    }

    const valid = await verifyPassword(currentPassword, auth.user.password);
    if (!valid) return api.badRequest('Current password is incorrect');

    const hashedPassword = await hashPassword(newPassword);
    const updated = await UserModel.updatePassword(auth.user._id, hashedPassword);
    if (!updated) return api.notFound('User not found');

    return api.ok(null, 'Password updated successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return api.serverError();
  }
}
