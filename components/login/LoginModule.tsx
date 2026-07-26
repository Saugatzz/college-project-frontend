'use client';
import React, { useState } from 'react';
import { PasswordInput, Button } from '@mantine/core';
import api from '@/lib/api/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveAuth } from '@/lib/auth/tokenStore';

const LoginModule = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.access_token) {
        saveAuth(data.access_token, data.user);
      }
      const from = searchParams.get('from') || '/dashboard';
      router.push(from);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9963B]" />
            <span className="text-[10px] font-medium tracking-widest text-[#C9963B] uppercase">
              Admin Panel
            </span>
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-[#1a1a2e]">Sajilo Yatra</h1>
          <p className="text-[0.82rem] text-gray-400 mt-1">Sign in to your admin account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(30,80,120,0.07)] p-8">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[0.8rem] text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@nepaltreks.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#2E86C1] focus:ring-2 focus:ring-[#2E86C1]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <PasswordInput
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="md"
                radius="md"
                styles={{
                  input: { border: '1.5px solid #e5e7eb', fontSize: '0.875rem' },
                }}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="md"
              radius="md"
              mt="xs"
              styles={{
                root: {
                  background: 'linear-gradient(135deg, #2E86C1, #1A5276)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  height: '44px',
                },
              }}
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-[0.7rem] text-gray-300 mt-6">
          © {new Date().getFullYear()} Sajilo Yatra. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginModule;