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
    const normalizedEmail = String(email).trim().toLowerCase();
    if (isRateLimited(normalizedEmail)) return api.tooMany('Too many OTP requests. Please wait a minute.');

    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) return api.conflict('User with this email already exists');

    const otp = generateOtp();
    await storeOtp(normalizedEmail, otp, String(name).trim(), password);
    recordOtpRequest(normalizedEmail);

    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (mailError: any) {
      console.error('Failed to send OTP email:', mailError);
      console.log(`\n========================================\n[DEV OTP] OTP for ${normalizedEmail}: ${otp}\n========================================\n`);
      if (process.env.NODE_ENV === 'production') {
        return api.serverError('Failed to send verification email. Please check your email configuration.');
      }
    }

    return api.ok({ expiresIn: 300 }, 'OTP sent successfully');
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return api.serverError(error?.message || 'Failed to send OTP');
  }
}
