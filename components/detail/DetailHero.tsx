import Link from 'next/link';
import type { Tour } from '@/types/tour';

const diffMap = {
  easy:     { cls: 'bg-green-100 text-[#1a8a59]', label: 'Easy'        },
  moderate: { cls: 'bg-amber-100 text-[#c47a00]', label: 'Moderate'    },
  hard:     { cls: 'bg-red-100   text-[#b03030]', label: 'Challenging' },
};

export default function DetailHero({ tour }: { tour: Tour }) {
  const { cls, label } = diffMap[tour.difficulty];

  return (
    <section
      className="h-[360px] md:h-[520px] relative flex items-end px-4 md:px-12 pb-8 md:pb-12 overflow-hidden"
      aria-label={`${tour.name} hero image`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tour.heroImage}
        alt={`${tour.name} — scenic landscape view`}
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[rgba(13,43,62,0.92)] via-[rgba(13,43,62,0.30)] to-transparent" />

      <div className="relative z-[2] max-w-[860px] w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/70 text-[0.82rem] font-normal mb-4 md:mb-5 no-underline hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to all tours
        </Link>

        <h1 className="font-serif text-[clamp(1.6rem,4vw,3.4rem)] text-white mb-5 font-normal leading-[1.15] tracking-tight">
          {tour.name}
        </h1>

        {/* Enhanced stats row */}
        <div className="flex gap-2.5 flex-wrap items-stretch">

          {/* Duration */}
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 hover:bg-white/15 transition-colors">
            <span className="w-6 h-6 rounded-full bg-sky-accent flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </span>
            <div className="leading-none">
              <p className="text-[0.60rem] text-white/50 font-medium tracking-[0.12em] uppercase mb-[3px]">Duration</p>
              <p className="text-[0.85rem] text-white font-medium">{tour.duration}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 hover:bg-white/15 transition-colors">
            <span className="w-6 h-6 rounded-full bg-sky-accent flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            <div className="leading-none">
              <p className="text-[0.60rem] text-white/50 font-medium tracking-[0.12em] uppercase mb-[3px]">Location</p>
              <p className="text-[0.85rem] text-white font-medium">Nepal</p>
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 hover:bg-white/15 transition-colors">
            <span className="w-6 h-6 rounded-full bg-sky-accent flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </span>
            <div className="leading-none">
              <p className="text-[0.60rem] text-white/50 font-medium tracking-[0.12em] uppercase mb-[3px]">Difficulty</p>
              <span className={`text-[0.76rem] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 hover:bg-white/15 transition-colors">
            <span className="w-6 h-6 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </span>
            <div className="leading-none">
              <p className="text-[0.60rem] text-white/50 font-medium tracking-[0.12em] uppercase mb-[3px]">Rating</p>
              <p className="text-[0.85rem] text-white font-medium">
                <span className="text-gold font-semibold">{tour.rating}</span>
                <span className="text-white/50 text-[0.74rem] ml-1.5">· {tour.reviewCount.toLocaleString()} reviews</span>
              </p>
            </div>
          </div>

          {/* Badge pill */}
          <div className="flex items-center gap-1.5 bg-gold/15 border border-gold/35 rounded-2xl px-4 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
            <span className="text-[0.78rem] font-semibold text-gold tracking-wide">{tour.badge}</span>
          </div>

        </div>
      </div>
    </section>
  );
}