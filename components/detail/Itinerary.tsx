import type { ItineraryDay } from '@/types/tour';

export default function Itinerary({ itinerary }: { itinerary: ItineraryDay[] }) {
  return (
    <ol className="list-none">
      {itinerary.map((item, i) => (
        <li key={i} className="flex gap-4 md:gap-5 py-5 border-b border-sky-mid/12 last:border-none">
          <div
            aria-label={`Day ${i + 1}`}
            className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-sky-light to-sky-mid rounded-full flex items-center justify-center font-serif text-[0.88rem] font-semibold text-sky-dark"
          >
            D{i + 1}
          </div>
          <div>
            <h3 className="font-medium text-[0.95rem] text-ink mb-1">{item.title}</h3>
            <p className="text-[0.84rem] text-pebble leading-[1.65]">{item.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
