'use client';

interface Props {
  onExplore: () => void;
}

export default function HeroSection({ onExplore }: Props) {
  return (
    <section
      className="
        h-screen min-h-[600px]
        bg-[url('/images/hero-bg.jpg')] bg-center bg-cover
        flex items-center
        px-6 md:px-12
        pt-[68px]
        /* Mobile: no extra bottom padding — search card flows below, not inside */
        /* sm+: bottom padding reserves space so hero image shows behind the peek area */
        pb-10 sm:pb-[60px]
        relative overflow-visible
      "
      aria-label="Hero banner"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[rgba(4,12,24,0.85)] via-[rgba(4,12,24,0.54)] to-[rgba(4,12,24,0.18)]" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 z-[1] bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Hero copy */}
      <div className="relative z-[2] max-w-2xl py-12 md:py-20">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white/90 text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-7 backdrop-blur-sm w-fit">
          ✦ eBooking Nepal&#39;s Premier Tour Curator
        </div>
        <h1 className="font-serif text-[clamp(2.4rem,5vw,4.4rem)] font-light leading-[1.12] text-white mb-5 tracking-tight">
          Discover the<br />
          <em className="italic text-gold">Soul of Nepal</em>
        </h1>
        <p className="text-[1.05rem] text-white/80 leading-[1.7] max-w-[460px] mb-10 font-light">
          From the world&#39;s highest peaks to ancient temple valleys — curated journeys for every adventurer, designed with care.
        </p>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={onExplore}
            className="bg-sky-accent text-white px-8 py-3.5 rounded-full border-none font-sans text-[0.95rem] font-medium cursor-pointer transition-all hover:bg-sky-dark hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(46,134,193,0.30)]"
          >
            Explore Tours
          </button>
          <button className="bg-white/10 text-white px-7 py-3.5 rounded-full border border-white/40 font-sans text-[0.95rem] font-light cursor-pointer transition-all hover:border-white/70 hover:bg-white/20 backdrop-blur-sm">
            Watch Stories
          </button>
        </div>
        <div className="flex gap-8 md:gap-10 mt-10 md:mt-13 pt-7 md:pt-9 border-t border-white/20 flex-wrap">
          <div>
            <div className="font-serif text-[2.1rem] font-semibold text-white leading-none">48+</div>
            <div className="text-xs text-white/60 font-normal mt-1 tracking-widest uppercase">Curated Tours</div>
          </div>
          <div>
            <div className="font-serif text-[2.1rem] font-semibold text-white leading-none">12k</div>
            <div className="text-xs text-white/60 font-normal mt-1 tracking-widest uppercase">Happy Trekkers</div>
          </div>
        </div>
      </div>
    </section>
  );
}