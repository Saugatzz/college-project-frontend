'use client';
import FilterSidebar from '@/components/tours/FilterSidebar';
import TourCard from '@/components/tours/TourCard';
import NoResults from '@/components/tours/NoResults';
import type { FilterState } from '@/hooks/useFilters';
import type { Category, Tour } from '@/types/tour';

type CategoryOption = Category | 'all';

const CATEGORIES: { label: string; value: CategoryOption }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Trekking',  value: 'trek'      },
  { label: 'Culture',   value: 'culture'   },
  { label: 'Adventure', value: 'adventure' },
];

interface Props {
  filters:           FilterState;
  tours:             Tour[];        // ← was: filtered
  loading:           boolean;       // ← new
  error:             string | null; // ← new
  activeFilterCount: number;
  onUpdate:          (patch: Partial<FilterState>) => void;
  onClear:           () => void;
}

export default function ToursSection({
  filters,
  tours,
  loading,
  error,
  activeFilterCount,
  onUpdate,
  onClear,
}: Props) {
  return (
    <section className="px-4 md:px-8 lg:px-12 pt-12 pb-24 bg-snow" id="tours-section" aria-label="Tour listings">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 gap-4">
        <div>
          <div className="text-xs font-medium tracking-[0.14em] uppercase text-gold mb-2.5">✦ Handpicked Experiences</div>
          <h2 className="font-serif text-[clamp(2rem,3.5vw,2.8rem)] font-normal text-ink leading-[1.2]">Our Signature Tours</h2>
        </div>
        <div className="flex gap-2.5 flex-wrap" role="group" aria-label="Filter tours by category">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => onUpdate({ category: cat.value })}
              aria-pressed={filters.category === cat.value}
              className={`px-[18px] py-2 rounded-full border font-sans text-[0.82rem] font-normal cursor-pointer transition-all
                ${filters.category === cat.value
                  ? 'bg-sky-accent border-sky-accent text-white'
                  : 'border-sky-mid bg-transparent text-stone hover:bg-sky-accent hover:border-sky-accent hover:text-white'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-9 items-start">
        <FilterSidebar
          filters={filters}
          activeFilterCount={activeFilterCount}
          onUpdate={onUpdate}
          onClear={onClear}
        />

        <div>
          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-sky-mid/30 animate-pulse" />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-stone text-sm">Something went wrong loading tours.</p>
              <button
                onClick={onClear}
                className="mt-4 text-sky-accent text-sm underline underline-offset-2"
              >
                Reset filters and try again
              </button>
            </div>
          )}

          {/* No results */}
          {!loading && !error && tours.length === 0 && (
            <NoResults onClear={onClear} />
          )}

          {/* Results */}
          {!loading && !error && tours.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" aria-live="polite">
              {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}