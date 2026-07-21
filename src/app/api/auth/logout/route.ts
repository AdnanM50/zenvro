import { NextRequest } from 'next/server';
import { UserModel } from '@/models/user.model';
import { verifyRefreshToken } from '@/lib/auth';
import { api } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const refreshTokenValue = request.cookies.get('refresh_token')?.value;

    if (refreshTokenValue) {
      const decoded = verifyRefreshToken(refreshTokenValue);
      if (decoded) {
        await UserModel.refreshToken.revokeByUserId(decoded.userId);
      }
    }

    const response = api.ok(null, 'Logged out successfully');
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return api.serverError();
  }
}
