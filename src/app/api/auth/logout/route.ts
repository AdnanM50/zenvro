import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshTokenValue = request.cookies.get('refresh_token')?.value;

    if (refreshTokenValue) {
      const decoded = verifyRefreshToken(refreshTokenValue);
      if (decoded) {
        await db.refreshToken.revokeByUserId(decoded.userId);
      }
    }

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
