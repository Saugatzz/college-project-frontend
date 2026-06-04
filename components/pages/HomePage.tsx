'use client';
import { useFilters } from '@/hooks/useFilters';
import HeroSection from '@/components/home/HeroSection';
import SearchSection from '@/components/home/SearchSection';
import ToursSection from '@/components/home/ToursSection';

export default function HomePage() {
  const { filters, filtered, activeFilterCount, update, clear } = useFilters();

  const scrollToTours = () => {
    document.getElementById('tours-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroSearch = (destination: string) => {
    update({ keyword: destination });
    scrollToTours();
  };

  return (
    <main id="main-content">
      {/* Hero — pb makes room so the search card overlaps from inside */}
      <div className="relative">
        {/* Extra bottom padding creates the "shelf" the search card sits in */}
        <div className="pb-[100px] sm:pb-[52px]">
          <HeroSection onExplore={scrollToTours} />
        </div>

        {/* Search card: pulled up with negative margin so it straddles the hero bottom */}
        <div className="relative z-20 -mt-[100px] sm:-mt-[52px] px-4 sm:px-8 md:px-12">
          <div className="max-w-[860px] mx-auto">
            <SearchSection onSearch={handleHeroSearch} />
          </div>
        </div>
      </div>

      {/* Breathing room between search card and tours */}
      <div className="h-10 sm:h-12 bg-snow" />

      <ToursSection
        filters={filters}
        filtered={filtered}
        activeFilterCount={activeFilterCount}
        onUpdate={update}
        onClear={clear}
      />
    </main>
  );
}