import { NextRequest } from 'next/server';
import { UserModel } from '@/models/user.model';
import { verifyOtp } from '@/models/otp.model';
import { hashPassword } from '@/lib/auth';
import { api } from '@/lib/api-response';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return api.badRequest('Email, OTP, and new password are required');
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return api.badRequest('New password must be at least 6 characters long');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      return api.notFound('Account not found');
    }

    const otpResult = await verifyOtp(normalizedEmail, String(otp).trim());
    if (!otpResult || !otpResult.valid) {
      return api.badRequest('Invalid or expired OTP code');
    }

    // Hash the new password and update user record
    const hashedPassword = await hashPassword(newPassword);
    const db = await getDb();
    await db.collection('users').updateOne(
      { email: normalizedEmail },
      { $set: { password: hashedPassword } }
    );

    return api.ok({}, 'Password reset successfully. You can now log in.');
  } catch (error: any) {
    console.error('Reset password API error:', error);
    return api.serverError(error?.message || 'Internal server error');
  }
}
