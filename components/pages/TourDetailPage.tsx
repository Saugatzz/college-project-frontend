'use client';
import { useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TOURS } from '@/data/tours';
import DetailHero from '@/components/detail/DetailHero';
import PhotoGallery from '@/components/detail/PhotoGallery';
import Itinerary from '@/components/detail/Itinerary';
import Highlights from '@/components/detail/Highlights';
import IncludesExcludes from '@/components/detail/IncludeExcludes';
import BookingSidebar from '@/components/detail/BookingSidebar';
import SimilarTours from '@/components/detail/SimilarTours';

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-serif text-[1.55rem] font-semibold text-ink mb-5 flex items-center gap-3
        after:content-[''] after:flex-1 after:h-px after:bg-gradient-to-r after:from-sky-mid/35 after:to-transparent"
    >
      {children}
    </h2>
  );
}

export default function TourDetailPage({ id }: { id: string }) {
  const tour = TOURS.find(t => t.id === Number(id));
  const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});

  if (!tour) {
    redirect('/');
  }

  const toggleAddon = (index: number, price: number, checked: boolean) => {
    setSelectedAddons(prev => {
      const next = { ...prev };
      if (checked) next[index] = price;
      else delete next[index];
      return next;
    });
  };

  const total = tour.price + Object.values(selectedAddons).reduce((a, b) => a + b, 0);
  const similar = TOURS.filter(t => t.id !== tour.id && t.category === tour.category).slice(0, 3);

  return (
    <div>
      <DetailHero tour={tour} />

      {/* Breadcrumb */}
      <nav className="px-4 md:px-12 py-3.5 bg-mist border-b border-sky-mid/15" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 list-none text-[0.8rem] text-pebble flex-wrap">
          <li><Link href="/" className="text-sky-accent no-underline hover:underline">Home</Link></li>
          <li className="text-pebble" aria-hidden="true">›</li>
          <li><Link href="/" className="text-sky-accent no-underline hover:underline">Tours</Link></li>
          <li className="text-pebble" aria-hidden="true">›</li>
          <li aria-current="page" className="text-pebble truncate max-w-[200px]">{tour.name}</li>
        </ol>
      </nav>

      <main id="main-content">
        {/* Body: main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 md:gap-11 px-4 md:px-12 pt-10 md:pt-13 pb-12 md:pb-22 max-w-[1320px] mx-auto">

          {/* Left column */}
          <div>
            <section className="mb-10 md:mb-13" aria-labelledby="sec-about">
              <SectionTitle id="sec-about">About this Tour</SectionTitle>
              <p className="text-[0.96rem] text-stone leading-[1.88]">{tour.description}</p>
            </section>

            <section className="mb-10 md:mb-13" aria-labelledby="sec-gallery">
              <SectionTitle id="sec-gallery">Photo Gallery</SectionTitle>
              <PhotoGallery gallery={tour.gallery} tourName={tour.name} />
            </section>

            <section className="mb-10 md:mb-13" aria-labelledby="sec-itin">
              <SectionTitle id="sec-itin">Day-by-Day Itinerary</SectionTitle>
              <Itinerary itinerary={tour.itinerary} />
            </section>

            <section className="mb-10 md:mb-13" aria-labelledby="sec-highlights">
              <SectionTitle id="sec-highlights">Tour Highlights</SectionTitle>
              <Highlights highlights={tour.highlights} />
            </section>

            <section aria-labelledby="sec-inc">
              <SectionTitle id="sec-inc">What&#39;s Included</SectionTitle>
              <IncludesExcludes includes={tour.includes} excludes={tour.excludes} />
            </section>
          </div>

          {/* Sidebar */}
          <BookingSidebar
            tour={tour}
            total={total}
            selectedAddons={selectedAddons}
            onToggleAddon={toggleAddon}
          />
        </div>

        {/* Similar tours */}
        {similar.length > 0 && <SimilarTours tours={similar} />}
      </main>
    </div>
  );
}
