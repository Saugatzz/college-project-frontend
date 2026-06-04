import Link from 'next/link';
import type { Tour } from '@/types/tour';

const diffMap = {
  easy:     { cls: 'bg-green-100 text-[#1a8a59]', label: 'Easy'        },
  moderate: { cls: 'bg-amber-100 text-[#c47a00]', label: 'Moderate'    },
  hard:     { cls: 'bg-red-100   text-[#b03030]', label: 'Challenging' },
};

function stars(rating: number) {
  const full = Math.floor(rating / 2);
  const half = rating % 2 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

export default function DetailHero({ tour }: { tour: Tour }) {
  const { cls, label } = diffMap[tour.difficulty];

  return (
    <section
      className="h-[320px] md:h-[480px] relative flex items-end px-4 md:px-12 pb-8 md:pb-11 overflow-hidden"
      aria-label={`${tour.name} hero image`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tour.heroImage}
        alt={`${tour.name} — scenic landscape view`}
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[rgba(13,43,62,0.88)] via-[rgba(13,43,62,0.20)] to-transparent" />

      <div className="relative z-[2] max-w-[800px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 text-[0.85rem] font-normal mb-4 md:mb-5 no-underline hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to all tours
        </Link>

        <h1 className="font-serif text-[clamp(1.6rem,4vw,3.4rem)] text-white mb-3 md:mb-4 font-normal leading-[1.15] tracking-tight">
          {tour.name}
        </h1>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-lg border border-white/22 text-white/92 text-[0.80rem] px-3 py-1 rounded-full">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {tour.duration}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-lg border border-white/22 text-white/92 text-[0.80rem] px-3 py-1 rounded-full">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Nepal
          </span>
          <span className="inline-flex items-center bg-white/15 backdrop-blur-lg border border-white/22 px-3 py-1 rounded-full">
            <span className={`text-[0.75rem] font-medium px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-lg border border-white/22 text-white/92 text-[0.80rem] px-3 py-1 rounded-full">
            <span className="text-gold text-[0.75rem] tracking-wide">{stars(tour.rating)}</span>
            <strong>{tour.rating}</strong>
            <span className="opacity-70">({tour.reviewCount} reviews)</span>
          </span>
          <span className="inline-flex items-center bg-white/15 backdrop-blur-lg border border-white/22 text-white/92 text-[0.80rem] px-3 py-1 rounded-full">
            {tour.badge}
          </span>
        </div>
      </div>
    </section>
  );
}
