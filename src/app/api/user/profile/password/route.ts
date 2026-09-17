import { NextRequest } from 'next/server';
import { requireUser } from '@/middlewares';
import { UserModel } from '@/models/user.model';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { api } from '@/lib/api-response';

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return api.badRequest('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return api.badRequest('New password must be at least 6 characters');
    }

    // Get full user with password
    const user = await UserModel.findById(auth.user._id);
    if (!user || !user.password) {
      return api.unauthorized('User not found');
    }

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return api.badRequest('Incorrect current password');
    }

    const hashedPassword = await hashPassword(newPassword);
    const updated = await UserModel.updatePassword(auth.user._id, hashedPassword);

    if (!updated) {
      return api.serverError('Failed to update password');
    }

    return api.ok(null, 'Password updated successfully');
  } catch (error) {
    console.error('Update password error:', error);
    return api.serverError('Failed to update password');
  }
}
