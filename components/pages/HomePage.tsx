'use client';
import type { Tour } from '@/types/tour';
import { useFilters } from '@/hooks/useFilters';
import HeroSection    from '@/components/home/HeroSection';
import SearchSection  from '@/components/home/SearchSection';
import ToursSection   from '@/components/home/ToursSection';

interface Props {
  tours: Tour[];
}

export default function HomePageClient({ tours }: Props) {
  const { filters, filtered, activeFilterCount, update, clear } = useFilters(tours);

  const scrollToTours = () =>
    document.getElementById('tours-section')?.scrollIntoView({ behavior: 'smooth' });

  const handleHeroSearch = (destination: string) => {
    update({ keyword: destination });
    scrollToTours();
  };

  return (
    <main id="main-content">
      {/* ── Hero + search card wrapper ── */}
      <div className="relative">
        <HeroSection onExplore={scrollToTours} />

        {/* sm+: overlaps hero bottom */}
        <div className="hidden sm:block absolute bottom-0 inset-x-0 z-20 translate-y-1/2 px-4 sm:px-8 md:px-12">
          <div className="max-w-[860px] mx-auto">
            <SearchSection onSearch={handleHeroSearch} />
          </div>
        </div>
      </div>

      {/* Mobile-only search — flows below hero */}
      <div className="sm:hidden bg-snow px-4 pt-4 pb-2">
        <SearchSection onSearch={handleHeroSearch} />
      </div>

      {/* Tours section */}
      <div className="bg-snow pt-4 sm:pt-12 md:pt-10">
        <ToursSection
          filters={filters}
          filtered={filtered}
          activeFilterCount={activeFilterCount}
          onUpdate={update}
          onClear={clear}
        />
      </div>
    </main>
  );
}