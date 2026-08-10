'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [otpExpired, setOtpExpired] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'reset' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (step === 'reset' && countdown === 0) {
      setOtpExpired(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage('OTP code sent! Please check your email.');
        toast.success('OTP sent to your email.');
        setStep('reset');
        setCountdown(300);
        setOtpExpired(false);
      } else {
        setError(data.error || 'Failed to send OTP code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Password reset successfully!');
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface-container-low rounded-2xl p-8 md:p-10 border border-surface-container">
        <div className="text-center mb-8 md:mb-10">
          <p className="font-label text-[10px] md:text-xs tracking-widest text-primary-fixed uppercase font-bold mb-3">
            {"// RECOVER ACCOUNT"}
          </p>
          <h1 className="hero-text text-on-surface">
            Forgot<br />Password
          </h1>
          <p className="font-body text-sm text-secondary mt-4">
            Remember your password?{' '}
            <Link href="/login" className="font-label font-bold text-primary-fixed hover:text-primary-fixed-dim transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {step === 'email' ? (
          <form className="space-y-5" onSubmit={handleSendOtp}>
            <div>
              <label htmlFor="email" className="font-label text-[10px] md:text-xs uppercase tracking-widest font-bold text-secondary block mb-2">
                Your Account Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-surface-container-high text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary-fixed rounded-xl text-sm transition-all"
                placeholder="enter your registered email"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-error-container p-4">
                <p className="font-label text-xs text-on-error-container">{error}</p>
              </div>
            )}
            {message && (
              <div className="rounded-xl bg-primary/10 p-4 border border-primary/20">
                <p className="font-label text-xs text-primary">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-primary text-background font-label text-[11px] font-black uppercase tracking-[0.2em] py-3.5 rounded-xl hover:bg-primary-fixed hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending OTP...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="otp" className="font-label text-[10px] md:text-xs uppercase tracking-widest font-bold text-secondary block mb-2">
                6-Digit OTP Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-surface-container-high text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary-fixed rounded-xl text-sm transition-all text-center tracking-widest font-mono text-lg"
                placeholder="123456"
              />
              <div className="mt-2 text-right">
                <span className={`font-mono text-xs ${otpExpired ? 'text-red-500 font-bold' : 'text-secondary'}`}>
                  {otpExpired ? 'OTP Expired' : `Expires in ${formatTime(countdown)}`}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="font-label text-[10px] md:text-xs uppercase tracking-widest font-bold text-secondary block mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-surface-container-high text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary-fixed rounded-xl text-sm transition-all"
                placeholder="enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="font-label text-[10px] md:text-xs uppercase tracking-widest font-bold text-secondary block mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-surface-container-high text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:border-primary-fixed rounded-xl text-sm transition-all"
                placeholder="confirm new password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-error-container p-4">
                <p className="font-label text-xs text-on-error-container">{error}</p>
              </div>
            )}
            {message && (
              <div className="rounded-xl bg-primary/10 p-4 border border-primary/20">
                <p className="font-label text-xs text-primary">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6 || !newPassword || otpExpired}
              className="w-full bg-primary text-background font-label text-[11px] font-black uppercase tracking-[0.2em] py-3.5 rounded-xl hover:bg-primary-fixed hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="font-label text-xs text-secondary hover:text-on-surface transition-colors"
              >
                ← Back to Email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading || (!otpExpired && countdown > 0)}
                className="font-label text-xs text-primary-fixed hover:underline disabled:opacity-40"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
