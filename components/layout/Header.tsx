'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { IconUser, IconUserCircle, IconLogin, IconUserPlus } from '@tabler/icons-react';
import { getUser, clearAuth, AuthUser } from '@/lib/auth/tokenStore';

const WHATSAPP_URL = 'https://wa.me/9779845439816?text=Hi%2C%20I%27d%20like%20to%20plan%20a%20trip%20to%20Nepal!';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);

  // ── Account: user icon, logged-in dropdown ──
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loggedOutMenuOpen, setLoggedOutMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Header lives in the root layout and persists across client-side
    // navigations between normal pages — it never unmounts just because
    // you go from one page to another. Re-checking on every pathname
    // change (not just once on the very first load) is what makes the
    // navbar actually reflect a login/logout that happened on a
    // different page (e.g. /user/login redirecting back here) instead
    // of staying stuck on whatever it saw at the very first page load.
    setAuthUser(getUser());
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
        setLoggedOutMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handlePlanTripClick = () => {
    setMobileOpen(false);
    setShowWaModal(true);
  };

  const confirmWhatsAppRedirect = () => {
    setShowWaModal(false);
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  };

  const handleUserIconClick = () => {
    setMobileOpen(false);
    if (authUser) {
      setAccountMenuOpen((v) => !v);
    } else {
      setLoggedOutMenuOpen((v) => !v);
    }
  };

  const handleSignOut = () => {
    clearAuth();
    setAuthUser(null);
    setAccountMenuOpen(false);
    router.push('/');
  };

  const initials = authUser
    ? (authUser.name || authUser.email)
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-[68px] bg-[rgba(248,252,255,0.88)] backdrop-blur-lg border-b border-sky-mid/20 transition-shadow duration-300 ${scrolled ? 'shadow-[0_8px_40px_rgba(30,80,120,0.10)]' : ''}`}>
      <Link href="/" aria-label="Sajilo Yatra Nepal home" className="flex items-center no-underline select-none">
        <Image
          src="/images/logos.png"
          alt="Sajilo Yatra Nepal"
          width={220}
          height={67}
          priority
          className="h-14 w-auto object-contain"
        />
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex gap-8 items-center">
        <Link href="/#search-section" className="text-sm font-normal text-black tracking-wide no-underline hover:text-sky-accent transition-colors">Destinations</Link>
        <Link href="/?category=trek#search-section" className="text-sm font-normal text-black tracking-wide no-underline hover:text-sky-accent transition-colors">Trek Types</Link>
        <a href="/about" className="text-sm font-normal text-black tracking-wide no-underline hover:text-sky-accent transition-colors">About</a>
        <button
          type="button"
          onClick={handlePlanTripClick}
          className="bg-sky-accent text-white px-5 py-2 rounded-full text-sm font-medium no-underline hover:bg-sky-dark transition-all hover:-translate-y-px"
        >
          Plan My Trip
        </button>

        {/* User account icon + dropdown */}
        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            onClick={handleUserIconClick}
            aria-label={authUser ? 'Account menu' : 'Sign in'}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-sky-mid/30 bg-white hover:border-sky-accent hover:bg-sky-light transition-colors"
          >
            {authUser ? (
              <span className="w-full h-full rounded-full bg-sky-accent text-white flex items-center justify-center text-[0.7rem] font-semibold">
                {initials}
              </span>
            ) : (
              <IconUser size={18} className="text-ink" stroke={1.7} />
            )}
          </button>

          {accountMenuOpen && authUser && (
            <div
              className="absolute right-0 top-[calc(100%+10px)] w-56 bg-white rounded-xl border border-sky-mid/20 shadow-[0_12px_40px_rgba(30,80,120,0.16)] py-2 z-[70]"
              role="menu"
            >
              <div className="px-4 py-2 border-b border-sky-mid/10 mb-1">
                <p className="text-sm font-medium text-ink truncate">{authUser.name || 'My Account'}</p>
                <p className="text-xs text-pebble truncate">{authUser.email}</p>
              </div>
              <Link
                href="/account"
                onClick={() => setAccountMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-sky-light transition-colors no-underline"
              >
                <IconUserCircle size={16} className="text-sky-accent" />
                My Dashboard
              </Link>
              {authUser.role === 'admin' && (
                <Link
                  href="/dashboard"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-sky-light transition-colors no-underline"
                >
                  <IconUserCircle size={16} className="text-sky-accent" />
                  Admin Panel
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}

          {loggedOutMenuOpen && !authUser && (
            <div
              className="absolute right-0 top-[calc(100%+10px)] w-52 bg-white rounded-xl border border-sky-mid/20 shadow-[0_12px_40px_rgba(30,80,120,0.16)] py-2 z-[70]"
              role="menu"
            >
              <Link
                href="/user/login"
                onClick={() => setLoggedOutMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-sky-light transition-colors no-underline"
              >
                <IconLogin size={16} className="text-sky-accent" />
                Log in
              </Link>
              <Link
                href="/user/signup"
                onClick={() => setLoggedOutMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-sky-light transition-colors no-underline"
              >
                <IconUserPlus size={16} className="text-sky-accent" />
                Create account
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile hamburger + user icon */}
      <div className="md:hidden flex items-center gap-1">
        <button
          type="button"
          onClick={handleUserIconClick}
          aria-label={authUser ? 'Account menu' : 'Sign in'}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-sky-mid/30 bg-white"
        >
          {authUser ? (
            <span className="w-full h-full rounded-full bg-sky-accent text-white flex items-center justify-center text-[0.7rem] font-semibold">
              {initials}
            </span>
          ) : (
            <IconUser size={17} className="text-ink" stroke={1.7} />
          )}
        </button>
        <button
          className="flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-ink transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-ink transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-ink transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-[68px] left-0 right-0 bg-[rgba(248,252,255,0.97)] backdrop-blur-lg border-b border-sky-mid/20 shadow-lg md:hidden py-4 px-6 flex flex-col gap-4">
          <Link href="/#search-section" onClick={() => setMobileOpen(false)} className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">Destinations</Link>
          <Link href="/?category=trek#search-section" onClick={() => setMobileOpen(false)} className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">Trek Types</Link>
          <a href="/about" onClick={() => setMobileOpen(false)} className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">About</a>
          {authUser && (
            <Link href="/account" onClick={() => setMobileOpen(false)} className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">My Dashboard</Link>
          )}
          <button
            type="button"
            onClick={handlePlanTripClick}
            className="bg-sky-accent text-white px-5 py-2 rounded-full text-sm font-medium text-center hover:bg-sky-dark transition-all"
          >
            Plan My Trip
          </button>
          {authUser ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-normal text-red-500 tracking-wide text-left"
            >
              Sign out
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/user/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors"
              >
                <IconLogin size={16} /> Log in
              </Link>
              <Link
                href="/user/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors"
              >
                <IconUserPlus size={16} /> Create account
              </Link>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp redirect confirmation modal */}
      {showWaModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wa-modal-title"
          onClick={() => setShowWaModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="wa-modal-title" className="font-serif text-lg font-semibold text-ink mb-2">
              Redirecting to WhatsApp
            </h3>
            <p className="text-sm text-stone mb-6">
              You&apos;re about to be redirected to WhatsApp to chat with us. Do you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowWaModal(false)}
                className="px-4 py-2 rounded-full text-sm font-medium text-ink border border-sky-mid/30 hover:bg-sky-light transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmWhatsAppRedirect}
                className="px-4 py-2 rounded-full text-sm font-medium text-white bg-sky-accent hover:bg-sky-dark transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}