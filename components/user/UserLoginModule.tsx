'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconAlertCircle, IconLogin, IconEye, IconEyeOff, IconArrowLeft } from '@tabler/icons-react';
import api from '@/lib/api/api';
import { saveAuth } from '@/lib/auth/tokenStore';
import { flushGuestViews, safeRedirect } from '@/lib/tracking';

export default function UserLoginModule() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectParam = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password,
        audience: 'user',
      });
      if (data.access_token) {
        saveAuth(data.access_token, data.user);
        // Replay anything they browsed as a guest so it counts toward
        // their recommendations.
        flushGuestViews();
      }
      router.push(safeRedirect(redirectParam, '/account'));
    } catch (err: any) {
      if (!err?.response) {
        setError("We couldn't reach the server. Please check your connection and try again.");
      } else if (err.response.status === 401) {
        setError('That email and password don\u2019t match. Please try again.');
      } else {
        const raw = err.response.data?.message;
        const msg = Array.isArray(raw) ? raw.join(', ') : raw;
        setError(msg ?? 'Something went wrong signing you in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signupHref = safeRedirect(redirectParam, '')
    ? `/user/signup?redirect=${encodeURIComponent(safeRedirect(redirectParam, ''))}`
    : '/user/signup';

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="flex justify-center mb-8 no-underline select-none">
          <Image
            src="/images/logos.png"
            alt="Sajilo Yatra Nepal"
            width={200}
            height={60}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="bg-white rounded-2xl border border-sky-mid/15 shadow-[0_4px_24px_rgba(30,80,120,0.07)] p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-accent" />
              <span className="text-[10px] font-medium tracking-widest text-sky-accent uppercase">
                Welcome back
              </span>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-ink">Sign in to your account</h1>
            <p className="text-[0.82rem] text-pebble mt-1">
              Track bookings and get tours picked just for you.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5"
            >
              <IconAlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-[0.8rem] text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5"
              >
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2E86C1, #1A5276)' }}
            >
              <IconLogin size={16} />
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[0.8rem] text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href={signupHref} className="text-sky-accent font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-[0.78rem] text-pebble hover:text-sky-accent transition-colors mt-6 no-underline"
        >
          <IconArrowLeft size={14} /> Back to tours
        </Link>

        <p className="text-center text-[0.7rem] text-gray-300 mt-4">
          © {new Date().getFullYear()} Sajilo Yatra. All rights reserved.
        </p>
      </div>
    </div>
  );
}
