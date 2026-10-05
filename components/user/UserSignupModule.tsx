'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconAlertCircle, IconUserPlus, IconCheck, IconEye, IconEyeOff, IconX } from '@tabler/icons-react';
import api from '@/lib/api/api';
import { saveAuth } from '@/lib/auth/tokenStore';
import { flushGuestViews, safeRedirect } from '@/lib/tracking';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Human-friendly labels for known category slugs. Anything not in this
// map still renders fine — just capitalized as-is — since the category
// list itself always comes live from the backend (see the effect below),
// not a hardcoded guess that could drift out of sync with the catalog.
const CATEGORY_LABELS: Record<string, string> = {
  trek: 'Trekking',
  trekking: 'Trekking',
  cultural: 'Cultural',
  adventure: 'Adventure',
  wildlife: 'Wildlife',
  sightseeing: 'Sightseeing',
  pilgrimage: 'Pilgrimage',
};

function labelFor(category: string) {
  return CATEGORY_LABELS[category.toLowerCase()] ?? (category.charAt(0).toUpperCase() + category.slice(1));
}

interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

function checkPassword(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function allChecksPassed(checks: PasswordChecks): boolean {
  return Object.values(checks).every(Boolean);
}

const STRENGTH_LEVELS = [
  { label: 'Very weak', color: '#ef4444' },
  { label: 'Weak',      color: '#f59e0b' },
  { label: 'Fair',      color: '#eab308' },
  { label: 'Good',      color: '#3b82f6' },
  { label: 'Strong',    color: '#10b981' },
] as const;

function getStrength(checks: PasswordChecks, password: string) {
  if (!password) return null;
  const passedCount = Object.values(checks).filter(Boolean).length; // 0-5
  const level = STRENGTH_LEVELS[Math.min(passedCount, STRENGTH_LEVELS.length - 1)];
  return { ...level, filled: passedCount };
}

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <IconCheck size={13} className="text-teal-600 shrink-0" />
      ) : (
        <IconX size={13} className="text-gray-300 shrink-0" />
      )}
      <span className={`text-[0.72rem] ${met ? 'text-teal-700' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

export default function UserSignupModule() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordChecks = useMemo(() => checkPassword(password), [password]);
  const passwordValid = allChecksPassed(passwordChecks);
  const strength = useMemo(() => getStrength(passwordChecks, password), [passwordChecks, password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // ── Email verification (same OTP flow used at checkout) ──
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Preferred tour types (seeds recommendations before any real
  // interaction history exists) ──
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    api.get<string[]>('/packages/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Editing the email after it was verified (or while a code is pending)
  // invalidates that verification — it no longer proves anything about
  // the new address.
  useEffect(() => {
    if (codeSent || emailVerified) {
      setCodeSent(false);
      setEmailVerified(false);
      setVerificationToken(null);
      setVerificationCode('');
      setVerifyError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleSendCode = async () => {
    if (!EMAIL_REGEX.test(email)) {
      setVerifyError('Please enter a valid email address first.');
      return;
    }
    setSendingCode(true);
    setVerifyError('');
    try {
      await api.post('/bookings/email/send-code', { email });
      setCodeSent(true);
      setEmailVerified(false);
      setVerificationToken(null);
      setVerificationCode('');
      setResendCooldown(60);
    } catch (err: any) {
      const msg = !err?.response
        ? "We couldn't reach the server. Please check your connection and try again."
        : err.response.data?.message ?? 'Could not send a verification code. Please try again.';
      setVerifyError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.trim().length !== 6) {
      setVerifyError('Enter the 6-digit code from your email.');
      return;
    }
    setVerifyingCode(true);
    setVerifyError('');
    try {
      const { data } = await api.post('/bookings/email/verify-code', {
        email: email.trim(),
        code: verificationCode.trim(),
      });
      setEmailVerified(true);
      setVerificationToken(data.token);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "That code didn't match. Please try again.";
      setVerifyError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      setError('Please meet all password requirements before continuing.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }
    if (!emailVerified || !verificationToken) {
      setError('Please verify your email address before creating your account.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        emailVerificationToken: verificationToken,
        preferredCategories: selectedCategories,
      });
      if (data.access_token) {
        saveAuth(data.access_token, data.user);
        // Replay anything they browsed as a guest so it counts toward
        // their recommendations from day one.
        flushGuestViews();
      }
      router.push(safeRedirect(searchParams.get('redirect'), '/account'));
    } catch (err: any) {
      if (!err?.response) {
        setError("We couldn't reach the server. Please check your connection and try again.");
      } else {
        const raw = err.response.data?.message;
        const msg = Array.isArray(raw) ? raw.join(', ') : raw;
        setError(msg ?? 'Could not create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginHref = (() => {
    const redirect = safeRedirect(searchParams.get('redirect'), '');
    return redirect ? `/user/login?redirect=${encodeURIComponent(redirect)}` : '/user/login';
  })();

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
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
                Join us
              </span>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-ink">Create your account</h1>
            <p className="text-[0.82rem] text-pebble mt-1">
              Save your trips and get personalized recommendations.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5">
              <IconAlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-[0.8rem] text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
              />
            </div>

            {/* ── Email verification ── */}
            <div
              className="p-3.5 rounded-xl border"
              style={{
                background: emailVerified ? 'linear-gradient(135deg, #f0fff4, #e8faf0)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                borderColor: emailVerified ? 'rgba(39,174,96,0.35)' : 'rgba(46,134,193,0.15)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {emailVerified ? (
                    <div className="flex items-center gap-1.5">
                      <IconCheck size={15} className="text-teal-600" />
                      <span className="text-[0.8rem] font-semibold text-teal-700">Email verified</span>
                    </div>
                  ) : (
                    <p className="text-[0.76rem] text-gray-500">
                      {codeSent
                        ? `We sent a 6-digit code to ${email}.`
                        : "We'll send a code to confirm this email actually exists."}
                    </p>
                  )}
                </div>
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || resendCooldown > 0}
                    className="shrink-0 text-[0.75rem] font-medium text-sky-accent border border-sky-accent/30 rounded-full px-3 py-1.5 hover:bg-sky-light transition-colors disabled:opacity-50"
                  >
                    {sendingCode
                      ? 'Sending…'
                      : codeSent
                        ? resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : 'Resend code'
                        : 'Send code'}
                  </button>
                )}
              </div>

              {codeSent && !emailVerified && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="6-digit code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyCode();
                      }
                    }}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyingCode}
                    className="px-4 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #2E86C1, #1A5276)' }}
                  >
                    {verifyingCode ? 'Verifying…' : 'Verify'}
                  </button>
                </div>
              )}
              {verifyError && <p className="text-[0.75rem] text-red-500 mt-2">{verifyError}</p>}
            </div>

            {/* ── Password ── */}
            <div>
              <label className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

              {/* Strength meter */}
              {strength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{ background: i < strength.filled ? strength.color : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  <p className="text-[0.72rem] mt-1 font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}

              {/* Requirement checklist */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                <RequirementRow met={passwordChecks.length} label="At least 8 characters" />
                <RequirementRow met={passwordChecks.uppercase} label="One uppercase letter" />
                <RequirementRow met={passwordChecks.lowercase} label="One lowercase letter" />
                <RequirementRow met={passwordChecks.number} label="One number" />
                <RequirementRow met={passwordChecks.special} label="One special character" />
              </div>
            </div>

            {/* ── Confirm Password ── */}
            <div>
              <label className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-gray-800 placeholder-gray-300 outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: passwordsMismatch ? '#fca5a5' : passwordsMatch ? '#86efac' : '#e5e7eb',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
              {passwordsMatch && (
                <p className="flex items-center gap-1 text-[0.72rem] text-teal-600 mt-1.5">
                  <IconCheck size={13} /> Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="flex items-center gap-1 text-[0.72rem] text-red-500 mt-1.5">
                  <IconX size={13} /> Passwords do not match
                </p>
              )}
            </div>

            {/* ── Preferred tour types ── */}
            {categories.length > 0 && (
              <div>
                <label className="block text-[0.75rem] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  What kind of trips are you into? <span className="normal-case font-normal text-gray-400">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="px-3.5 py-1.5 rounded-full text-[0.78rem] font-medium border transition-colors"
                        style={{
                          borderColor: active ? '#2E86C1' : 'rgba(46,134,193,0.25)',
                          background: active ? 'linear-gradient(135deg, #f0f8ff, #e0f0fa)' : 'transparent',
                          color: active ? '#1A5276' : '#6b7c8d',
                        }}
                      >
                        {labelFor(cat)}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[0.7rem] text-gray-400 mt-1.5">
                  We&apos;ll use this to pick your first recommendations — they&apos;ll keep improving as you browse and book.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2E86C1, #1A5276)' }}
            >
              <IconUserPlus size={16} />
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-[0.8rem] text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href={loginHref} className="text-sky-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[0.7rem] text-gray-300 mt-6">
          © {new Date().getFullYear()} Sajilo Yatra. All rights reserved.
        </p>
      </div>
    </div>
  );
}