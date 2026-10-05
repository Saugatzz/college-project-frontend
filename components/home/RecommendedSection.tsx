'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconSparkles, IconLogin, IconUserPlus } from '@tabler/icons-react';
import TourCard from '@/components/tours/TourCard';
import api from '@/lib/api/api';
import { getToken } from '@/lib/auth/tokenStore';
import { packageToTour } from '@/lib/adapters/packageToTour';
import type { Package } from '@/components/dashboard/TourTable';
import type { Tour } from '@/types/tour';

// Home-page strip of personalised tours.
//   - logged in  -> "Recommended for you" (top 3 from the engine)
//   - logged out -> a small, friendly nudge to log in / sign up
// Renders nothing until it knows which of the two applies, so there is
// no flash of the wrong state.
export default function RecommendedSection() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    const hasToken = !!getToken();
    setLoggedIn(hasToken);
    setReady(true);
    if (!hasToken) return;

    api.get<Package[]>('/packages/recommendations/me?limit=3')
      .then(({ data }) => setTours(data.map(packageToTour)))
      .catch(() => setTours([]));
  }, []);

  if (!ready) return null;

  if (!loggedIn) {
    return (
      <section className="px-4 md:px-12 pb-8">
        <div className="max-w-[1100px] mx-auto bg-white border border-sky-mid/15 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_24px_rgba(30,80,120,0.07)]">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <IconSparkles size={22} className="text-sky-accent shrink-0 hidden sm:block" />
            <div>
              <p className="font-serif text-[1.1rem] font-semibold text-ink">Want tours picked just for you?</p>
              <p className="text-[0.82rem] text-pebble">
                Create a free account and tell us what you enjoy — we&apos;ll tailor suggestions as you browse.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/user/signup"
              className="flex items-center gap-1.5 bg-sky-accent text-white px-5 py-2 rounded-full text-sm font-medium no-underline hover:bg-sky-dark transition-colors"
            >
              <IconUserPlus size={15} /> Sign up
            </Link>
            <Link
              href="/user/login"
              className="flex items-center gap-1.5 border border-sky-mid/30 text-ink px-5 py-2 rounded-full text-sm font-medium no-underline hover:bg-sky-light transition-colors"
            >
              <IconLogin size={15} /> Log in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (tours.length === 0) return null;

  return (
    <section className="px-4 md:px-12 pb-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="font-serif text-[1.5rem] font-semibold text-ink flex items-center gap-2">
              <IconSparkles size={20} className="text-sky-accent" />
              Recommended for you
            </h2>
            <p className="text-[0.82rem] text-pebble">Based on what you&apos;ve viewed, booked and told us you like.</p>
          </div>
          <Link href="/account" className="text-[0.82rem] text-sky-accent no-underline hover:underline shrink-0">
            See more
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
}
