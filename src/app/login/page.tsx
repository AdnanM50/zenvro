'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push('/user-dashboard');
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface-container-low rounded-2xl p-8 md:p-10 border border-surface-container">
        <div className="text-center mb-8 md:mb-10">
          <p className="font-label text-[10px] md:text-xs tracking-widest text-primary-fixed uppercase font-bold mb-3">
            {"// SIGN IN"}
          </p>
          <h1 className="hero-text text-black">
            Welcome<br />Back
          </h1>
          <p className="font-body text-sm text-secondary mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-label font-bold text-primary-fixed hover:text-primary-fixed-dim transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
