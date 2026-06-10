import Link from 'next/link';
import type { Tour } from '@/types/tour';

const diffMap: Record<string, { cls: string; label: string }> = {
  easy:        { cls: 'bg-green-100 text-[#1a8a59]', label: 'Easy'        },
  moderate:    { cls: 'bg-amber-100 text-[#c47a00]', label: 'Moderate'    },
  challenging: { cls: 'bg-red-100   text-[#b03030]', label: 'Challenging' },
  hard:        { cls: 'bg-red-100   text-[#b03030]', label: 'Challenging' }, // legacy alias
  extreme:     { cls: 'bg-red-200   text-[#7a1a1a]', label: 'Extreme'     },
};

const FALLBACK = { cls: 'bg-gray-100 text-gray-600', label: 'Unknown' };

export default function TourCard({ tour }: { tour: Tour }) {
  const { cls, label } = diffMap[tour.difficulty?.toLowerCase()] ?? FALLBACK;

  return (
    <article className="flex flex-col">
      <Link
        href={`/tour/${tour.slug}`}
        className="bg-white rounded-[18px] border border-sky-mid/15 overflow-hidden flex flex-col flex-1 shadow-[0_4px_24px_rgba(30,80,120,0.13)] no-underline text-inherit transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(30,80,120,0.20)]"
      >
        <div className="h-[224px] relative overflow-hidden bg-sky-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tour.image}
            alt={`${tour.name} — ${tour.tagline}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[650ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none z-[1]" />
          <span className="absolute top-3.5 right-3.5 z-[3] bg-[rgba(10,20,36,0.42)] backdrop-blur-lg text-white text-[0.70rem] font-medium tracking-[0.09em] uppercase px-3 py-1 rounded-full border border-white/20">
            {tour.badge}
          </span>
        </div>
        <div className="px-6 pt-6 pb-6 flex flex-col flex-1">
          <div className="flex items-center gap-3.5 mb-3">
            <span className="text-[0.78rem] text-pebble flex items-center gap-1">{tour.duration}</span>
            <span className={`text-[0.72rem] font-medium px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
          </div>
          <h3 className="font-serif text-[1.5rem] font-semibold text-ink mb-2 leading-[1.25]">{tour.name}</h3>
          <p className="text-[0.88rem] text-stone leading-[1.6] font-light mb-5 flex-1">{tour.tagline}</p>
          <div className="flex items-center justify-between pt-4 border-t border-sky-mid/15">
            <div>
              <span className="block text-[0.72rem] text-pebble">From</span>
              <span className="font-serif text-[1.45rem] font-semibold text-sky-dark">${tour.price.toLocaleString()}</span>
              <span className="text-[0.72rem] text-pebble"> /person</span>
            </div>
            <span className="bg-mist text-sky-accent border border-sky-mid px-5 py-2 rounded-full font-sans text-[0.82rem] font-medium transition-all">
              View Tour →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}