'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconBrandFacebook, IconBrandInstagram, IconBrandX, IconBrandYoutube } from '@tabler/icons-react';
import api from '@/lib/api/api';

interface Package {
  id: number;
  name: string;
  slug: string;
  location: string;
}

const company = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Our Team', href: '/about#team' },
  { label: 'Sustainability', href: '/about#sustainability' },
  { label: 'Press', href: '/about#press' },
];

const support = [
  { label: 'FAQs', href: '/contact' },
  { label: 'Booking Policy', href: '/contact' },
  { label: 'Cancellation Terms', href: '/contact' },
  { label: 'Travel Insurance', href: '/contact' },
  { label: 'Safety Guidelines', href: '/contact' },
];

const socials = [
  { icon: <IconBrandFacebook size={16} stroke={1.5} />, href: 'https://facebook.com', label: 'Facebook' },
  { icon: <IconBrandInstagram size={16} stroke={1.5} />, href: 'https://instagram.com', label: 'Instagram' },
  { icon: <IconBrandX size={16} stroke={1.5} />, href: 'https://twitter.com', label: 'Twitter/X' },
  { icon: <IconBrandYoutube size={16} stroke={1.5} />, href: 'https://youtube.com', label: 'YouTube' },
];

const MAX_DESTINATIONS = 6;

export default function Footer() {
  const [destinations, setDestinations] = useState<Package[]>([]);

  useEffect(() => {
    api.get<Package[]>('/packages')
      .then(({ data }) => setDestinations(data))
      .catch(() => {});
  }, []);

  const visibleDestinations = destinations.slice(0, MAX_DESTINATIONS);
  const hasMore = destinations.length > MAX_DESTINATIONS;

  return (
    <footer className="bg-[#0f4c81] text-white/80 pt-16 pb-8 mt-0">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" className="bg-white p-3 rounded-xl inline-block mb-5">
              <Image src="/images/logo.png" alt="eBooking Nepal" width={110} height={35} className="h-[35px] w-auto brightness-200" />
            </Link>
            <p className="text-[0.875rem] text-white/55 leading-[1.75] font-light mb-6 text-center md:text-left">
              Nepal's premier curated tour platform — connecting adventurers with the Himalayan soul since 2015.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-sky-accent hover:border-sky-accent/50 transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-5">Destinations</h4>
            <ul className="space-y-3 text-center md:text-left">
              {visibleDestinations.map(({ id, name, slug }) => (
                <li key={id}>
                  <Link
                    href={`/tour/${slug}`}
                    className="text-[0.875rem] text-white/55 hover:text-sky-accent transition-colors font-light no-underline"
                  >
                    {name}
                  </Link>
                </li>
              ))}
              {hasMore && (
                <li>
                  <Link
                    href="/tours"
                    className="text-[0.78rem] text-sky-accent/70 hover:text-sky-accent transition-colors font-medium no-underline"
                  >
                    View all {destinations.length} tours →
                  </Link>
                </li>
              )}
              {destinations.length === 0 &&
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                ))
              }
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-5">Company</h4>
            <ul className="space-y-3 text-center md:text-left">
              {company.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[0.875rem] text-white/55 hover:text-sky-accent transition-colors font-light no-underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + newsletter */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-5">Support</h4>
            <ul className="space-y-3 mb-8 text-center md:text-left">
              {support.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[0.875rem] text-white/55 hover:text-sky-accent transition-colors font-light no-underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-pebble mb-3">Newsletter</h4>
            <div className="flex gap-2 w-full">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-white/15 rounded-full px-4 py-2 text-[0.82rem] text-white placeholder-white/30 outline-none focus:border-sky-accent/50 transition-colors"
              />
              <button className="bg-sky-accent hover:bg-sky-dark text-white px-4 py-2 rounded-full text-[0.82rem] font-medium transition-colors whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-7">
          <p className="text-[0.78rem] text-white/35 font-light">
            © {new Date().getFullYear()} eBooking Nepal. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cookie Policy', href: '/cookies' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-[0.78rem] text-white/35 hover:text-white/60 transition-colors font-light no-underline">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}