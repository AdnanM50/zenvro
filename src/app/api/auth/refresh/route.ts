import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/user.model';
import { verifyRefreshToken, generateTokenPair, getTokenExpiration } from '@/lib/auth';
import { api } from '@/lib/api-response';

function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const cookieOpts = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
    path: '/',
  });
  response.cookies.set('access_token', accessToken, cookieOpts(60 * 15));
  response.cookies.set('refresh_token', refreshToken, cookieOpts(60 * 60 * 24 * 7));
  return response;
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const refreshTokenValue = request.cookies.get('refresh_token')?.value;

    if (!refreshTokenValue) return api.unauthorized('Refresh token not found');

    const decoded = verifyRefreshToken(refreshTokenValue);
    if (!decoded) {
      return clearAuthCookies(api.unauthorized('Invalid or expired refresh token'));
    }

    const storedToken = await UserModel.refreshToken.findByToken(refreshTokenValue);
    if (!storedToken) {
      return clearAuthCookies(api.unauthorized('Refresh token has been revoked'));
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return clearAuthCookies(api.unauthorized('User not found'));
    }

    await UserModel.refreshToken.revokeByToken(refreshTokenValue);

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user.id, user.email, user.role);
    const newRefreshExpiresAt = getTokenExpiration(newRefreshToken);

    if (newRefreshExpiresAt) {
      await UserModel.refreshToken.create(user.id, newRefreshToken, newRefreshExpiresAt);
    }

    const activeTokenCount = await UserModel.refreshToken.countByUserId(user.id);
    if (activeTokenCount > 5) {
      await UserModel.refreshToken.revokeByUserId(user.id);
      await UserModel.refreshToken.create(user.id, newRefreshToken, newRefreshExpiresAt!);
    }

    const response = api.ok(null, 'Token refreshed successfully');
    return setAuthCookies(response, accessToken, newRefreshToken);
  } catch (error) {
    console.error('Token refresh error:', error);
    return api.serverError();
  }
}
