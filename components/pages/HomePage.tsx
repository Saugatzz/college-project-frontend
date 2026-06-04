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
      {/* Hero + floating search wrapper */}
      <div className="relative overflow-visible">
        <HeroSection onExplore={scrollToTours} />
        {/* Search bar floats over the bottom of the hero */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-20 px-4 md:px-12">
          <div className="max-w-[1300px] mx-auto">
            <SearchSection onSearch={handleHeroSearch} />
          </div>
        </div>
      </div>

      {/* Spacer compensates for the search bar overlap */}
      <div className="h-16 md:h-20 bg-snow" />

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