import {
  generateOtp,
  storeOtp,
  verifyOtp,
  isRateLimited,
  recordOtpRequest,
} from '@/models/otp.model';

export const OtpService = {
  generate(): string {
    return generateOtp();
  },

  async store(email: string, otp: string, name: string = '', password?: string): Promise<void> {
    return storeOtp(email, otp, name, password);
  },

  async verify(email: string, otp: string): Promise<{ valid: boolean; name?: string; password?: string }> {
    return verifyOtp(email, otp);
  },

  checkRateLimit(email: string): boolean {
    return isRateLimited(email);
  },

  recordRequest(email: string): void {
    return recordOtpRequest(email);
  },
};
