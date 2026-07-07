import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
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

    const result = verifyOtp(email, otp);

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

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      name: name!,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user.id, user.email);

    const response = NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 },
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
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
