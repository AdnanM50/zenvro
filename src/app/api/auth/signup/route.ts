import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTokenPair, getTokenExpiration } from '@/lib/auth';
import { verifyOtp } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 },
      );
    }

    const result = await verifyOtp(email, otp);

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 },
      );
    }

    const { name, password } = result;

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Registration data not found. Please start over.' },
        { status: 400 },
      );
    }

    const existingUser = await db.user.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 },
      );
    }

    // Password is already hashed by storeOtp, so use it directly
    const user = await db.user.create({
      name: name!,
      email,
      password,
    });

    console.log('User created successfully:', { id: user.id, email: user.email });

    const { accessToken, refreshToken } = generateTokenPair(user.id, user.email);
    const refreshExpiresAt = getTokenExpiration(refreshToken);

    if (refreshExpiresAt) {
      await db.refreshToken.create(user.id, refreshToken, refreshExpiresAt);
    }

    const response = NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 },
    );

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
