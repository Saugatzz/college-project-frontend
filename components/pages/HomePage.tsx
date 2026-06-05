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
      {/*
        Mobile:  search card sits BELOW the hero, flows in normal document flow.
                 No overlap trick — hero is fully visible, card appears underneath.
        sm+:     search card is absolutely positioned at hero bottom, peeking 50% out.
                 bg-snow section gets top padding to catch the overflowing half.
      */}

      {/* ── Hero + search card wrapper ── */}
      <div className="relative">
        <HeroSection onExplore={scrollToTours} />

        {/* 
          sm+: absolute, anchored to hero bottom, translate down by half its height.
          mobile: relative, hidden from absolute flow — rendered below instead.
        */}
        <div
          className="
            hidden sm:block
            absolute bottom-0 inset-x-0 z-20
            translate-y-1/2
            px-4 sm:px-8 md:px-12
          "
        >
          <div className="max-w-[860px] mx-auto">
            <SearchSection onSearch={handleHeroSearch} />
          </div>
        </div>
      </div>

      {/* Mobile-only search card — flows naturally below the hero */}
      <div className="sm:hidden bg-snow px-4 pt-4 pb-2">
        <SearchSection onSearch={handleHeroSearch} />
      </div>

      {/* Tours section — sm+ needs top padding to clear the peeking card */}
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