export default function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-20 px-5">
      <span className="text-5xl block mb-4" aria-hidden="true">🔍</span>
      <p className="font-serif text-[1.7rem] font-normal text-ink mb-2.5">No tours found</p>
      <p className="text-[0.95rem] text-pebble leading-[1.6] mb-7 max-w-[360px] mx-auto">
        Try adjusting your search or filters to discover more journeys.
      </p>
      <button
        onClick={onClear}
        className="inline-block px-7 py-3 bg-sky-accent text-white border-none rounded-full font-sans text-[0.9rem] font-medium cursor-pointer transition-all hover:bg-sky-dark hover:-translate-y-0.5 shadow-[0_4px_18px_rgba(46,134,193,0.30)]"
      >
        Reset all filters
      </button>
    </div>
  );
}
