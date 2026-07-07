interface OtpEntry {
  otp: string;
  name: string;
  email: string;
  password: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpEntry>();

const OTP_EXPIRY_MS = 60 * 1000;
const MAX_ATTEMPTS = 3;

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(
  email: string,
  otp: string,
  name: string,
  password: string,
): void {
  otpStore.set(email, {
    otp,
    name,
    email,
    password,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
}

export function verifyOtp(
  email: string,
  otp: string,
): { valid: boolean; name?: string; password?: string } {
  const entry = otpStore.get(email);

  if (!entry) {
    return { valid: false };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return { valid: false };
  }

  entry.attempts += 1;

  if (entry.attempts > MAX_ATTEMPTS) {
    otpStore.delete(email);
    return { valid: false };
  }

  if (entry.otp !== otp) {
    return { valid: false };
  }

  otpStore.delete(email);
  return { valid: true, name: entry.name, password: entry.password };
}

export function getOtpExpiresAt(email: string): number | null {
  const entry = otpStore.get(email);
  if (!entry) return null;
  return entry.expiresAt;
}

const rateLimitMap = new Map<string, number[]>();

export function isRateLimited(email: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(email) || [];
  const recent = timestamps.filter((t) => now - t < 60 * 1000);
  rateLimitMap.set(email, recent);
  return recent.length >= 3;
}

export function recordOtpRequest(email: string): void {
  const timestamps = rateLimitMap.get(email) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(email, timestamps);
}
