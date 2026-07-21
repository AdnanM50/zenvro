import { NextRequest } from 'next/server';
import { UserModel } from '@/models/user.model';
import { generateOtp, storeOtp, isRateLimited, recordOtpRequest } from '@/models/otp.model';
import { sendOtpEmail } from '@/lib/mail';
import { api } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) return api.badRequest('Name, email, and password are required');
    if (password.length < 6) return api.badRequest('Password must be at least 6 characters long');
    if (isRateLimited(email)) return api.tooMany('Too many OTP requests. Please wait a minute.');

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) return api.conflict('User with this email already exists');

    const otp = generateOtp();
    await storeOtp(email, otp, name, password);
    recordOtpRequest(email);
    await sendOtpEmail(email, otp);

    return api.ok({ expiresIn: 300 }, 'OTP sent successfully');
  } catch (error) {
    console.error('Send OTP error:', error);
    return api.serverError('Failed to send OTP');
  }
}
