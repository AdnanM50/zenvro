import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateOtp, storeOtp, isRateLimited, recordOtpRequest } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 },
      );
    }

    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait a minute.' },
        { status: 429 },
      );
    }

    const existingUser = await db.user.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 },
      );
    }

    const otp = generateOtp();
    storeOtp(email, otp, name, password);
    recordOtpRequest(email);

    await sendOtpEmail(email, otp);

    return NextResponse.json(
      { message: 'OTP sent successfully', expiresIn: 60 },
      { status: 200 },
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 },
    );
  }
}
