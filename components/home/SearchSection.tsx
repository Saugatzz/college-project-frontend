'use client';
import { useState, useEffect, useRef } from 'react';

interface Props {
  onSearch: (destination: string) => void;
}

export default function SearchSection({ onSearch }: Props) {
  const [destination, setDestination] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const dateWrapRef = useRef<HTMLDivElement>(null);

  const dateDisplay = (() => {
    const fmt = (d: string) =>
      new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
    if (startDate) return `${fmt(startDate)} – ?`;
    return 'Select dates';
  })();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateWrapRef.current && !dateWrapRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    /* No outer padding/margin — positioning is handled by the parent wrapper in HomePage */
    <div role="search" aria-label="Search tours">
      <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-[24px] sm:rounded-[60px] shadow-[0_8px_48px_rgba(30,80,120,0.22),0_2px_10px_rgba(30,80,120,0.10)] border border-sky-mid/25 w-full transition-all focus-within:shadow-[0_12px_56px_rgba(46,134,193,0.28)] focus-within:border-sky-mid/50 relative">

        {/* Destination */}
        <div className="flex items-center gap-3.5 px-5 md:px-7 flex-1 min-w-0">
          <div className="text-sky-accent flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0 py-4 sm:py-5">
            <label className="block text-[0.7rem] font-semibold text-pebble tracking-[0.08em] uppercase mb-1" htmlFor="heroDestInput">
              Going to
            </label>
            <input
              className="border-none outline-none bg-transparent font-sans text-base font-normal text-ink w-full placeholder:text-pebble placeholder:font-light"
              type="text"
              placeholder="Destination in Nepal"
              id="heroDestInput"
              autoComplete="off"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearch(destination.trim())}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px sm:h-auto sm:w-px bg-sky-mid/20 mx-4 sm:mx-0 sm:my-3.5 flex-shrink-0" />

        {/* Date picker */}
        <div className="relative flex flex-1 min-w-0" ref={dateWrapRef}>
          <button
            className="flex items-center gap-3.5 px-5 md:px-7 flex-1 min-w-0 bg-transparent border-none cursor-pointer text-left"
            onClick={() => setDatePickerOpen(prev => !prev)}
            aria-label="Select travel dates"
            aria-haspopup="true"
            aria-expanded={datePickerOpen}
            type="button"
          >
            <div className="text-sky-accent flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0 py-4 sm:py-5">
              <span className="block text-[0.7rem] font-semibold text-pebble tracking-[0.08em] uppercase mb-1">Dates</span>
              <span className="block text-base font-normal text-ink whitespace-nowrap overflow-hidden text-ellipsis">{dateDisplay}</span>
            </div>
          </button>

          {datePickerOpen && (
            <div className="absolute top-[calc(100%+10px)] left-0 z-50 bg-white border border-sky-mid/25 rounded-[18px] shadow-[0_16px_48px_rgba(30,80,120,0.20)] p-6 min-w-[280px] sm:min-w-[320px]">
              <div className="flex flex-col sm:flex-row gap-3.5 mb-4">
                <div className="flex-1">
                  <label className="block text-[0.72rem] text-pebble tracking-[0.07em] uppercase mb-1.5" htmlFor="startDate">Start date</label>
                  <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-sky-mid rounded-lg px-3 py-2 font-sans text-sm text-ink outline-none bg-mist focus:border-sky-accent" />
                </div>
                <div className="flex-1">
                  <label className="block text-[0.72rem] text-pebble tracking-[0.07em] uppercase mb-1.5" htmlFor="endDate">End date</label>
                  <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full border border-sky-mid rounded-lg px-3 py-2 font-sans text-sm text-ink outline-none bg-mist focus:border-sky-accent" />
                </div>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setDatePickerOpen(false); }}
                className="w-full bg-sky-accent text-white border-none py-2.5 rounded-full font-sans text-sm font-medium cursor-pointer hover:bg-sky-dark transition-colors">
                Done
              </button>
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          className="flex-shrink-0 w-full sm:w-[62px] sm:h-[62px] sm:m-2 sm:ml-1.5 bg-sky-accent border-none sm:rounded-full rounded-b-[24px] py-4 sm:py-0 flex items-center justify-center cursor-pointer transition-all hover:bg-sky-dark sm:hover:scale-105 shadow-[0_4px_18px_rgba(46,134,193,0.38)]"
          onClick={() => onSearch(destination.trim())}
          aria-label="Search tours"
          type="button"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </div>
  );
}