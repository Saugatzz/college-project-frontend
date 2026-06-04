'use client';
import type { Tour } from '@/types/tour';

interface Props {
  tour: Tour;
  total: number;
  selectedAddons: Record<number, number>;
  onToggleAddon: (index: number, price: number, checked: boolean) => void;
}

export default function BookingSidebar({ tour, total, selectedAddons, onToggleAddon }: Props) {
  return (
    <aside aria-label="Booking and pricing">
      <div className="bg-white border border-sky-mid/20 rounded-[18px] p-5 md:p-7 shadow-[0_4px_24px_rgba(30,80,120,0.13)] lg:sticky lg:top-[88px]">
        <div className="flex items-end gap-1.5 mb-1">
          <span className="font-serif text-[2.4rem] font-semibold text-sky-dark leading-none">
            ${tour.price.toLocaleString()}
          </span>
          <span className="text-[0.82rem] text-pebble mb-1">/ person</span>
        </div>
        <p className="text-[0.78rem] text-pebble mb-6 leading-[1.5]">
          Base price per person. Customize your experience with add-ons below.
        </p>

        <span className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-pebble mb-3.5 block">Optional Add-ons</span>

        <div role="group" aria-label="Optional Add-ons">
          {tour.addons.map((addon, i) => {
            const checked = i in selectedAddons;
            return (
              <label key={i} className="flex items-start gap-3 py-3 border-b border-sky-mid/12 last:border-none cursor-pointer hover:opacity-80 transition-opacity">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={e => onToggleAddon(i, addon.price, e.target.checked)}
                  aria-label={`${addon.name} — add $${addon.price}`}
                />
                <span className={`w-[22px] h-[22px] flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${checked ? 'bg-sky-accent border-sky-accent' : 'border-sky-mid'}`}>
                  {checked && <span className="text-white text-[0.72rem] font-bold">✓</span>}
                </span>
                <span className="flex-1">
                  <span className="block text-[0.88rem] font-medium text-ink mb-0.5">{addon.name}</span>
                  <span className="block text-[0.78rem] text-pebble leading-[1.5]">{addon.desc}</span>
                </span>
                <span className="text-[0.88rem] font-medium text-sky-accent flex-shrink-0 whitespace-nowrap pt-0.5">
                  +${addon.price}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-between items-center py-4 border-t-2 border-sky-mid/22 mt-1">
          <span className="text-[0.88rem] text-stone font-normal">Total estimate</span>
          <span className="font-serif text-[1.7rem] font-semibold text-sky-dark" aria-live="polite" aria-label="Total price">
            ${total.toLocaleString()}
          </span>
        </div>

        <button
          type="button"
          aria-label={`Book ${tour.name}`}
          className="w-full bg-gradient-to-br from-sky-accent to-sky-dark text-white border-none py-4 rounded-full font-sans text-[0.95rem] font-medium cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-[0_6px_24px_rgba(46,134,193,0.35)] tracking-wide"
        >
          Book This Tour
        </button>

        <span className="text-center text-[0.76rem] text-pebble mt-3 leading-[1.5] block">
          ✓ Free cancellation up to 14 days before departure
        </span>
      </div>
    </aside>
  );
}
