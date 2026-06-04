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
      <HeroSection onExplore={scrollToTours} />
      <SearchSection onSearch={handleHeroSearch} />
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
