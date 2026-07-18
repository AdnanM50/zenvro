import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRefreshToken, generateTokenPair, getTokenExpiration } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshTokenValue = request.cookies.get('refresh_token')?.value;

    if (!refreshTokenValue) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    const decoded = verifyRefreshToken(refreshTokenValue);
    if (!decoded) {
      const response = NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }

    const storedToken = await db.refreshToken.findByToken(refreshTokenValue);
    if (!storedToken) {
      const response = NextResponse.json(
        { error: 'Refresh token has been revoked' },
        { status: 401 }
      );
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }

    const user = await db.user.findById(decoded.userId);
    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }

    await db.refreshToken.revokeByToken(refreshTokenValue);

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user.id, user.email);
    const newRefreshExpiresAt = getTokenExpiration(newRefreshToken);

    if (newRefreshExpiresAt) {
      await db.refreshToken.create(user.id, newRefreshToken, newRefreshExpiresAt);
    }

    const activeTokenCount = await db.refreshToken.countByUserId(user.id);
    if (activeTokenCount > 5) {
      await db.refreshToken.revokeByUserId(user.id);
      await db.refreshToken.create(user.id, newRefreshToken, newRefreshExpiresAt!);
    }

    const response = NextResponse.json(
      { message: 'Token refreshed successfully' },
      { status: 200 }
    );

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
