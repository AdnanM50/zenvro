// In-memory OTP storage (replace with Redis/database in production)
interface OTPRecord {
  otp: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

const otpStore: Map<string, OTPRecord> = new Map();

const OTP_EXPIRY_MINUTES = 10;

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTP(email: string): Promise<string> {
  const otp = generateOTP();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  otpStore.set(email, {
    otp,
    email,
    createdAt: now,
    expiresAt,
  });

  return otp;
}

export function verifyOTP(email: string, otp: string): boolean {
  const record = otpStore.get(email);
  
  if (!record) {
    return false;
  }

  const now = new Date();
  if (now > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }

  if (record.otp !== otp) {
    return false;
  }

  // OTP is valid, remove it to prevent reuse
  otpStore.delete(email);
  return true;
}

export function clearOTP(email: string): void {
  otpStore.delete(email);
}

// Cleanup expired OTPs (call periodically in production)
export function cleanupExpiredOTPs(): void {
  const now = new Date();
  for (const [email, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(email);
    }
  }
}
