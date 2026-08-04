import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/user.model';
import { verifyPassword, generateTokenPair, getTokenExpiration } from '@/lib/auth';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) return api.badRequest('Email and password are required');

    const user = await UserModel.findByEmail(email);
    if (!user) return api.unauthorized('Invalid email or password');

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return api.unauthorized('Invalid email or password');

    const { accessToken, refreshToken } = generateTokenPair(user._id, user.email, user.role);
    const refreshExpiresAt = getTokenExpiration(refreshToken);

    if (refreshExpiresAt) {
      await UserModel.refreshToken.create(user._id, refreshToken, refreshExpiresAt);
    }

    const response = api.ok(
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      'Login successful',
    );

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Login error:', error);
    return api.serverError();
  }
}
