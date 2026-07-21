'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (countdown <= 0) {
      setOtpExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setOtp('');
    setOtpExpired(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(data.data.expiresIn || 60);
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signup(email, otp);

    if (result.success) {
      router.push(result.role === 'admin' ? '/admin' : '/user-dashboard');
    } else {
      setError(result.error || 'Verification failed');
      setOtp('');
    }

    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface-container-low rounded-2xl p-8 md:p-10 border border-surface-container">
        <div className="text-center mb-8 md:mb-10">
          <p className="font-label text-[10px] md:text-xs tracking-widest text-primary-fixed uppercase font-bold mb-3">
            {"// JOIN US"}
          </p>
          <h1 className="hero-text text-black">
            {step === 1 ? 'Create\nAccount' : 'Verify\nEmail'}
          </h1>
          {step === 1 ? (
            <p className="font-body text-sm text-secondary mt-4">
              Already have an account?{' '}
              <Link href="/login" className="font-label font-bold text-primary-fixed hover:text-primary-fixed-dim transition-colors">
                Sign in
              </Link>
            </p>
          ) : (
            <p className="font-body text-sm text-secondary mt-4">
              A 6-digit code was sent to <span className="font-bold text-on-surface">{email}</span>
            </p>
          )}
        </div>

        {step === 1 ? (
          <form className="space-y-5" onSubmit={handleSendOtp}>
            <div>
              <label htmlFor="name" className="font-label text-[10px] md:text-xs uppercase tracking-widest font-bold text-secondary block mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-surface-container-high text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary-fixed rounded-xl text-sm transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="font-label text-[10px] md:text-xs uppercase tracking-widest font-bold text-secondary block mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-surface-container-high text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary-fixed rounded-xl text-sm transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="font-label text-[10px] md:text-xs uppercase tracking-widest font-bold text-secondary block mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full px-4 py-3 bg-white border border-surface-container-high text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary-fixed rounded-xl text-sm transition-all"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-error-container p-4">
                <p className="font-label text-xs text-on-error-container">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-label text-[11px] font-black uppercase tracking-[0.2em] py-3.5 rounded-xl hover:bg-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleVerifyOtp}>
            <div>
              <label htmlFor="otp" className="font-label text-[10px] md:text-xs uppercase tracking-widest font-bold text-secondary block mb-2">
                One-Time Password
              </label>
              <input
              id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-white border border-surface-container-high text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary-fixed rounded-xl text-sm transition-all text-center text-2xl tracking-[0.3em] font-headline font-black disabled:opacity-50"
                placeholder="000000"
                disabled={otpExpired}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className={`font-label text-xs font-bold uppercase tracking-widest ${otpExpired ? 'text-on-error-container' : 'text-secondary'}`}>
                {otpExpired ? 'Code expired' : `Expires in ${formatTime(countdown)}`}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-error-container p-4">
                <p className="font-label text-xs text-on-error-container">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6 || otpExpired}
              className="w-full bg-primary text-white font-label text-[11px] font-black uppercase tracking-[0.2em] py-3.5 rounded-xl hover:bg-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="text-center">
              <button
                type="button"
                disabled={isLoading || (!otpExpired && countdown > 0)}
                onClick={handleSendOtp}
                className="font-label text-xs uppercase tracking-widest font-bold text-primary-fixed hover:text-primary-fixed-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {countdown > 0 && !otpExpired
                  ? `Resend in ${formatTime(countdown)}`
                  : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
