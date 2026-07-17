import Link from 'next/link';
import type { Tour } from '@/types/tour';

export default function SimilarTours({ tours }: { tours: Tour[] }) {
  return (
    <section className="px-4 md:px-12 pb-16 md:pb-22 max-w-[1320px] mx-auto" aria-labelledby="sec-similar">
      <h2
        id="sec-similar"
        className="font-serif text-[1.55rem] font-semibold text-ink mb-6 flex items-center gap-3
          after:content-[''] after:flex-1 after:h-px after:bg-gradient-to-r after:from-sky-mid/35 after:to-transparent"
      >
        You Might Also Like
      </h2>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${tours.length >= 3 ? 'lg:grid-cols-3' : ''} gap-5`}>
        {tours.map(tour => (
          <Link
            key={tour.id}
            href={`/tour/${tour.slug}`}
            aria-label={`${tour.name}, ${tour.duration}, from $${tour.price}`}
            className="bg-white rounded-[10px] border border-sky-mid/15 overflow-hidden no-underline text-inherit transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(30,80,120,0.13)] shadow-[0_2px_12px_rgba(30,80,120,0.08)] block"
          >
            <div className="h-[120px] overflow-hidden bg-sky-light">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tour.heroImage}
                alt={`${tour.name} tour thumbnail`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.07]"
              />
            </div>
            <div className="px-4 pt-3.5 pb-4">
              <h3 className="font-serif text-[1.05rem] font-semibold text-ink mb-1 leading-[1.2]">{tour.name}</h3>
              <p className="text-[0.78rem] text-pebble">{tour.duration} &nbsp;·&nbsp; From ${tour.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}