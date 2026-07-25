'use client';
import { useState } from 'react';
import type { FilterState } from '@/hooks/useFilters';

interface Props {
  filters:           FilterState;
  activeFilterCount: number;
  onUpdate:          (patch: Partial<FilterState>) => void;
  onClear:           () => void;
}

const BUDGET_RANGES = [
  { id: 'b1', label: 'Less than $500',     range: [0,    499]   },
  { id: 'b2', label: '$500 to $900',        range: [500,  899]   },
  { id: 'b3', label: '$900 to $1,300',      range: [900,  1299]  },
  { id: 'b4', label: 'Greater than $1,300', range: [1300, 99999] },
];

const DURATION_RANGES = [
  { id: 'd1', label: 'Less than 5 days',  range: [0,  4]  },
  { id: 'd2', label: '5 to 10 days',      range: [5,  9]  },
  { id: 'd3', label: '10 to 18 days',     range: [10, 17] },
  { id: 'd4', label: 'More than 18 days', range: [18, 99] },
];

const START_TIMES = [
  { id: 't1', label: '6:00am – 12:00pm (morning)'   },
  { id: 't2', label: '12:00pm – 5:00pm (afternoon)'  },
  { id: 't3', label: '5:00pm – 12:00am (evening)'    },
  { id: 't4', label: 'Any time'                       },
];

function isRangeActive(activeRanges: number[][] | undefined, range: number[]) {
  return (activeRanges ?? []).some(r => r[0] === range[0] && r[1] === range[1]);
}

function toggleRange(activeRanges: number[][] | undefined, range: number[], checked: boolean) {
  const current = activeRanges ?? [];
  if (checked) return [...current, range];
  return current.filter(r => !(r[0] === range[0] && r[1] === range[1]));
}

function RadioItem({ name, value, label, checked, onChange }: {
  name: string; value: string; label: string;
  checked: boolean; onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer hover:opacity-80 transition-opacity">
      <input
        type="radio" name={name} value={value} checked={checked}
        onChange={() => onChange(value)} className="sr-only"
      />
      <span className={`w-[18px] h-[18px] flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors
        ${checked ? 'border-sky-accent' : 'border-sky-mid'}`}>
        {checked && <span className="w-2 h-2 bg-sky-accent rounded-full block" />}
      </span>
      <span className="text-[0.85rem] text-stone font-light select-none">{label}</span>
    </label>
  );
}

function CheckItem({ id, label, checked, disabled, onChange }: {
  id: string; label: string; checked: boolean;
  disabled?: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-2.5 py-1 cursor-pointer hover:opacity-80 transition-opacity
      ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <input
        type="checkbox" id={id} checked={checked}
        disabled={disabled} onChange={e => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className={`w-[18px] h-[18px] flex-shrink-0 rounded border-2 flex items-center justify-center transition-all
        ${checked ? 'bg-sky-accent border-sky-accent' : 'border-sky-mid'}`}>
        {checked && <span className="text-white text-[0.68rem] font-bold leading-none">✓</span>}
      </span>
      <span className="text-[0.85rem] text-stone font-light select-none">{label}</span>
    </label>
  );
}

function Divider() {
  return <div className="h-px bg-sky-mid/20 my-4" />;
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.82rem] font-semibold text-ink tracking-[0.03em] mb-3">
      {children}
    </p>
  );
}

export default function FilterSidebar({
  filters, activeFilterCount, onUpdate, onClear,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <>
      {/* Search */}
      <div className="mb-5">
        <span className="font-serif text-[1.15rem] font-semibold text-ink mb-2.5 block">
          Search for a tour
        </span>
        <div className="flex items-center gap-2 border border-sky-mid rounded-[10px] px-3.5 py-2 bg-mist focus-within:border-sky-accent transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pebble flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Enter a keyword"
            value={filters.keyword}
            onChange={e => onUpdate({ keyword: e.target.value })}
            autoComplete="off"
            className="border-none bg-transparent font-sans text-[0.85rem] text-ink w-full outline-none placeholder:text-pebble placeholder:font-light"
          />
        </div>
      </div>

      <Divider />

      {/* Filter header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-serif text-[1.25rem] font-semibold text-ink">Filter by</span>
        {activeFilterCount > 0 && (
          <span className="bg-sky-accent text-white text-[0.72rem] font-medium px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* Rating */}
      <fieldset className="border-none p-0 mb-5">
        <legend className="w-full"><GroupTitle>Traveler rating</GroupTitle></legend>
        {[
          { value: 'any', label: 'Any'           },
          { value: '9',   label: 'Wonderful 9+'  },
          { value: '8',   label: 'Very good 8+'  },
          { value: '7',   label: 'Good 7+'        },
        ].map(opt => (
          <RadioItem
            key={opt.value} name="rating" value={opt.value} label={opt.label}
            checked={filters.rating === opt.value}
            onChange={val => onUpdate({ rating: val })}
          />
        ))}
      </fieldset>

      <Divider />

      {/* Recommendations */}
      <fieldset className="border-none p-0 mb-5">
        <legend className="w-full"><GroupTitle>Recommendations</GroupTitle></legend>
        <CheckItem id="chk-cancel" label="Free cancellation"
          checked={filters.freeCancellation ?? false}
          onChange={v => onUpdate({ freeCancellation: v })} />
        <CheckItem id="chk-deals" label="Deals"
          checked={filters.deals ?? false}
          onChange={v => onUpdate({ deals: v })} />
        <CheckItem id="chk-today" label="Available today"
          checked={false} disabled onChange={() => {}} />
        <CheckItem id="chk-family" label="Family friendly"
          checked={filters.familyOnly ?? false}
          onChange={v => onUpdate({ familyOnly: v })} />
        <CheckItem id="chk-new" label="New on Sajilo Yatra"
          checked={filters.newOnly ?? false}
          onChange={v => onUpdate({ newOnly: v })} />
      </fieldset>

      <Divider />

      {/* Budget */}
      <fieldset className="border-none p-0 mb-5">
        <legend className="w-full"><GroupTitle>Your budget</GroupTitle></legend>
        {BUDGET_RANGES.map(({ id, label, range }) => (
          <CheckItem key={id} id={`chk-${id}`} label={label}
            checked={isRangeActive(filters.budgets, range)}
            onChange={checked =>
              onUpdate({ budgets: toggleRange(filters.budgets, range, checked) })
            }
          />
        ))}
      </fieldset>

      <Divider />

      {/* Start time */}
      <fieldset className="border-none p-0 mb-5">
        <legend className="w-full"><GroupTitle>Start time</GroupTitle></legend>
        {START_TIMES.map(({ id, label }) => (
          <CheckItem key={id} id={`chk-${id}`} label={label}
            checked={(filters.startTimes ?? []).includes(id)}
            onChange={checked => {
              const current = filters.startTimes ?? [];
              onUpdate({
                startTimes: checked
                  ? [...current, id]
                  : current.filter(t => t !== id),
              });
            }}
          />
        ))}
      </fieldset>

      <Divider />

      {/* Duration */}
      <fieldset className="border-none p-0 mb-5">
        <legend className="w-full"><GroupTitle>Duration</GroupTitle></legend>
        {DURATION_RANGES.map(({ id, label, range }) => (
          <CheckItem key={id} id={`chk-${id}`} label={label}
            checked={isRangeActive(filters.durations, range)}
            onChange={checked =>
              onUpdate({ durations: toggleRange(filters.durations, range, checked) })
            }
          />
        ))}
      </fieldset>

      {/* Clear */}
      <button
        onClick={onClear}
        className="w-full bg-transparent border border-sky-mid/35 text-sky-accent px-0 py-2.5 rounded-[10px] font-sans text-[0.82rem] font-medium cursor-pointer transition-all hover:bg-sky-accent hover:text-white hover:border-sky-accent mt-1"
      >
        ✕ Clear all filters
      </button>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(p => !p)}
          className="flex items-center gap-2 bg-white border border-sky-mid/25 text-sky-accent px-4 py-2.5 rounded-[10px] font-sans text-[0.85rem] font-medium shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          Filters{' '}
          {activeFilterCount > 0 && (
            <span className="bg-sky-accent text-white text-[0.7rem] px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        {mobileOpen && (
          <div className="mt-3 bg-white border border-sky-mid/20 rounded-[18px] shadow-[0_4px_24px_rgba(30,80,120,0.13)] p-6">
            {content}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block bg-white border border-sky-mid/20 rounded-[18px] shadow-[0_4px_24px_rgba(30,80,120,0.13)] p-6 sticky top-[88px]"
        aria-label="Tour filters"
      >
        {content}
      </aside>
    </>
  );
}