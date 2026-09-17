import { NextRequest } from 'next/server';
import { requireUser } from '@/middlewares';
import { UserModel } from '@/models/user.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    const user = await UserModel.findByIdPublic(auth.user._id);
    if (!user) return api.notFound('User profile not found');

    return api.ok(user, 'Profile fetched successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return api.serverError('Failed to fetch profile');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, phone } = body;

    const updated = await UserModel.updateProfile(auth.user._id, { name, phone });
    if (!updated) return api.badRequest('Failed to update profile or invalid data');

    return api.ok(updated, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return api.serverError('Failed to update profile');
  }
}
