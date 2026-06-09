'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const WHATSAPP_URL = 'https://wa.me/9779845439816?text=Hi%2C%20I%27d%20like%20to%20plan%20a%20trip%20to%20Nepal!';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-[68px] bg-[rgba(248,252,255,0.88)] backdrop-blur-lg border-b border-sky-mid/20 transition-shadow duration-300 ${scrolled ? 'shadow-[0_8px_40px_rgba(30,80,120,0.10)]' : ''}`}>
      <Link href="/" aria-label="eBooking Nepal home" className="flex items-center no-underline select-none">
        <Image src="/images/logo.png" alt="eBooking Nepal" width={120} height={38} className="h-[38px] w-auto object-contain" />
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex gap-8 items-center">
        <a href="#" className="text-sm font-normal text-stone tracking-wide no-underline hover:text-sky-accent transition-colors">Destinations</a>
        <a href="#" className="text-sm font-normal text-stone tracking-wide no-underline hover:text-sky-accent transition-colors">Trek Types</a>
        <a href="/about" className="text-sm font-normal text-stone tracking-wide no-underline hover:text-sky-accent transition-colors">About</a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sky-accent text-white px-5 py-2 rounded-full text-sm font-medium no-underline hover:bg-sky-dark transition-all hover:-translate-y-px"
        >
          Plan My Trip
        </a>
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
          <a href="#" className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">Destinations</a>
          <a href="#" className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">Trek Types</a>
          <a href="#" className="text-sm font-normal text-stone tracking-wide hover:text-sky-accent transition-colors">About</a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sky-accent text-white px-5 py-2 rounded-full text-sm font-medium text-center hover:bg-sky-dark transition-all"
          >
            Plan My Trip
          </a>
        </div>
      )}
    </header>
  );
}