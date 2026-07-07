interface OtpEntry {
  otp: string;
  name: string;
  email: string;
  password: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();

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
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
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

  if (entry.otp !== otp) {
    return { valid: false };
  }

  otpStore.delete(email);
  return { valid: true, name: entry.name, password: entry.password };
}
