jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      json(data: any, init?: { status?: number }) {
        return {
          status: init?.status ?? 200,
          json: async () => data,
        };
      },
    },
  };
});

jest.mock('@/models/user.model', () => ({
  UserModel: {
    findByEmail: jest.fn(),
  },
}));

jest.mock('@/models/otp.model', () => ({
  generateOtp: jest.fn().mockReturnValue('123456'),
  storeOtp: jest.fn(),
  verifyOtp: jest.fn(),
  isRateLimited: jest.fn().mockReturnValue(false),
  recordOtpRequest: jest.fn(),
}));

jest.mock('@/lib/mail', () => ({
  sendPasswordResetOtpEmail: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  getDb: jest.fn().mockResolvedValue({
    collection: jest.fn().mockReturnValue({
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    }),
  }),
}));

import type { NextRequest } from 'next/server';
import { POST as forgotPasswordHandler } from '@/app/api/auth/forgot-password/route';
import { POST as resetPasswordHandler } from '@/app/api/auth/reset-password/route';
import { UserModel } from '@/models/user.model';
import { verifyOtp, isRateLimited, storeOtp } from '@/models/otp.model';
import { sendPasswordResetOtpEmail } from '@/lib/mail';

function makeRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as unknown as NextRequest;
}

describe('Forgot & Reset Password API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/forgot-password', () => {
    it('returns 400 if email is missing', async () => {
      const res: any = await forgotPasswordHandler(makeRequest({}));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Email address is required');
    });

    it('sends OTP if user exists', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'user1',
        email: 'test@example.com',
      });
      (isRateLimited as jest.Mock).mockReturnValue(false);
      (storeOtp as jest.Mock).mockResolvedValue(undefined);
      (sendPasswordResetOtpEmail as jest.Mock).mockResolvedValue(undefined);

      const res: any = await forgotPasswordHandler(makeRequest({ email: 'test@example.com' }));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(sendPasswordResetOtpEmail).toHaveBeenCalledWith('test@example.com', '123456');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('returns 400 if payload is incomplete', async () => {
      const res: any = await resetPasswordHandler(makeRequest({ email: 'test@example.com' }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Email, OTP, and new password are required');
    });

    it('returns 400 if password is less than 6 characters', async () => {
      const res: any = await resetPasswordHandler(
        makeRequest({ email: 'test@example.com', otp: '123456', newPassword: '123' })
      );
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('New password must be at least 6 characters long');
    });

    it('resets password successfully when OTP is valid', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue({
        _id: 'user1',
        email: 'test@example.com',
      });
      (verifyOtp as jest.Mock).mockResolvedValue(true);

      const res: any = await resetPasswordHandler(
        makeRequest({
          email: 'test@example.com',
          otp: '123456',
          newPassword: 'newpassword123',
        })
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toBe('Password reset successfully. You can now log in.');
    });
  });
});
