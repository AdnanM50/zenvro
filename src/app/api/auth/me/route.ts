import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return api.unauthorized();

    const decoded = verifyAccessToken(token);
    if (!decoded) return api.unauthorized('Invalid or expired token');

    const user = await UserModel.findById(decoded.userId);
    if (!user) return api.notFound('User not found');

    return api.ok(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      'User fetched',
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return api.serverError();
  }
}
