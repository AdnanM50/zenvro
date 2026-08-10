import { NextRequest } from 'next/server';
import { UserModel } from '@/models/user.model';
import { generateOtp, storeOtp, isRateLimited, recordOtpRequest } from '@/models/otp.model';
import { sendPasswordResetOtpEmail } from '@/lib/mail';
import { api } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return api.badRequest('Email address is required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      // Return 200/ok for security so attacker cannot enumerate existing emails
      return api.ok({}, 'If an account exists with this email, an OTP has been sent.');
    }

    if (isRateLimited(normalizedEmail)) {
      return api.tooMany('Too many requests. Please wait a minute before requesting another OTP.');
    }

    const otp = generateOtp();
    await storeOtp(normalizedEmail, otp);
    recordOtpRequest(normalizedEmail);

    try {
      await sendPasswordResetOtpEmail(normalizedEmail, otp);
    } catch (mailError) {
      console.error('Failed to send password reset OTP email:', mailError);
    }

    return api.ok({}, 'Password reset OTP sent to your email.');
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return api.serverError(error?.message || 'Internal server error');
  }
}
