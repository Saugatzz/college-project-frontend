'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const WHATSAPP_URL = 'https://wa.me/9779845439816?text=Hi%2C%20I%27d%20like%20to%20plan%20a%20trip%20to%20Nepal!';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);

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
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMobileOpen(prev => !prev)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-ink transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-ink transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-ink transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-[68px] left-0 right-0 bg-[rgba(248,252,255,0.97)] backdrop-blur-lg border-b border-sky-mid/20 shadow-lg md:hidden py-4 px-6 flex flex-col gap-4">
          <Link href="/#search-section" onClick={() => setMobileOpen(false)} className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">Destinations</Link>
          <Link href="/?category=trek#search-section" onClick={() => setMobileOpen(false)} className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">Trek Types</Link>
          <a href="/about" onClick={() => setMobileOpen(false)} className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">About</a>
          <button
            type="button"
            onClick={handlePlanTripClick}
            className="bg-sky-accent text-white px-5 py-2 rounded-full text-sm font-medium text-center hover:bg-sky-dark transition-all"
          >
            Plan My Trip
          </button>
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