import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/user.model';
import { generateTokenPair, getTokenExpiration } from '@/lib/auth';
import { verifyOtp } from '@/models/otp.model';
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
    const { email, otp } = body;

    if (!email || !otp) return api.badRequest('Email and OTP are required');

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = await verifyOtp(normalizedEmail, String(otp).trim());
    if (!result || !result.valid) return api.badRequest('Invalid or expired OTP');

    const { name, password } = result;
    if (!name || !password) return api.badRequest('Registration data not found. Please start over.');

    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) return api.conflict('User with this email already exists');

    const user = await UserModel.create({ name: name!, email: normalizedEmail, password });

    const { accessToken, refreshToken } = generateTokenPair(user._id, user.email, user.role);
    const refreshExpiresAt = getTokenExpiration(refreshToken);

    if (refreshExpiresAt) {
      await UserModel.refreshToken.create(user._id, refreshToken, refreshExpiresAt);
    }

    const response = api.created(
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      'User created successfully',
    );

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error: any) {
    console.error('Signup error:', error);
    return api.serverError(error?.message || 'Failed to complete registration');
  }
}
