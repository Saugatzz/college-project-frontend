'use client';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Tour } from '@/types/tour';

export type FilterState = {
  keyword:          string;
  category:         string;
  rating:           string;
  freeCancellation: boolean;
  deals:            boolean;
  familyOnly:       boolean;
  newOnly:          boolean;
  budgets:          number[][];
  durations:        number[][];
  startTimes:       string[];
};

const DEFAULTS: FilterState = {
  keyword:          '',
  category:         'all',
  rating:           'any',
  freeCancellation: false,
  deals:            false,
  familyOnly:       false,
  newOnly:          false,
  budgets:          [],
  durations:        [],
  startTimes:       [],
};

// ─── Backend → Frontend mapper ────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToTour(pkg: any): Tour {
  return {
    ...pkg,
    duration:  `${pkg.days ?? 1} days`,
    itinerary: (pkg.itineraries ?? []).map((i: any) => ({ title: i.title, desc: i.description })),
    includes:  (pkg.inclusions  ?? []).filter((i: any) =>  i.included).map((i: any) => i.text),
    excludes:  (pkg.inclusions  ?? []).filter((i: any) => !i.included).map((i: any) => i.text),
    gallery:   (pkg.images      ?? []).map((i: any) => ({ src: i.src, alt: i.alt })),
    tags:      [],
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function serializeRanges(ranges: number[][]): string {
  return ranges.map(([min, max]) => `${min}-${max}`).join(',');
}
function deserializeRanges(raw: string | null): number[][] {
  if (!raw) return [];
  return raw.split(',').map(r => {
    const [min, max] = r.split('-').map(Number);
    return [min, max];
  });
}

// ─── URL params → FilterState ─────────────────────────────────────────────────
function paramsToFilters(params: URLSearchParams): FilterState {
  return {
    keyword:          params.get('keyword')          ?? DEFAULTS.keyword,
    category:         params.get('category')         ?? DEFAULTS.category,
    rating:           params.get('rating')           ?? DEFAULTS.rating,
    freeCancellation: params.get('freeCancellation') === 'true',
    deals:            params.get('deals')            === 'true',
    familyOnly:       params.get('familyOnly')       === 'true',
    newOnly:          params.get('newOnly')           === 'true',
    budgets:          deserializeRanges(params.get('budgets')),
    durations:        deserializeRanges(params.get('durations')),
    startTimes:       params.get('startTimes')?.split(',').filter(Boolean) ?? [],
  };
}

// ─── FilterState → URL params ─────────────────────────────────────────────────
function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.keyword)              params.set('keyword',          filters.keyword);
  if (filters.category !== 'all')   params.set('category',         filters.category);
  if (filters.rating   !== 'any')   params.set('rating',           filters.rating);
  if (filters.freeCancellation)     params.set('freeCancellation', 'true');
  if (filters.deals)                params.set('deals',            'true');
  if (filters.familyOnly)           params.set('familyOnly',       'true');
  if (filters.newOnly)              params.set('newOnly',          'true');
  if (filters.budgets.length)       params.set('budgets',          serializeRanges(filters.budgets));
  if (filters.durations.length)     params.set('durations',        serializeRanges(filters.durations));
  if (filters.startTimes?.length)   params.set('startTimes',       filters.startTimes.join(','));
  return params;
}

// ─── FilterState → Backend query params ──────────────────────────────────────
function filtersToBEParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.keyword)            params.set('keyword',          filters.keyword);
  if (filters.category !== 'all') params.set('category',         filters.category);
  if (filters.rating   !== 'any') params.set('minRating',        filters.rating);
  if (filters.freeCancellation)   params.set('freeCancellation', 'true');
  if (filters.deals)              params.set('hasDeal',          'true');
  if (filters.familyOnly)         params.set('familyFriendly',   'true');
  if (filters.newOnly)            params.set('isNew',            'true');
  if (filters.budgets.length) {
    const mins = filters.budgets.map(([min]) => min);
    const maxs = filters.budgets.map(([, max]) => max);
    params.set('minPrice', String(Math.min(...mins)));
    params.set('maxPrice', String(Math.max(...maxs)));
  }
  if (filters.durations.length) {
    const mins = filters.durations.map(([min]) => min);
    const maxs = filters.durations.map(([, max]) => max);
    params.set('minDuration', String(Math.min(...mins)));
    params.set('maxDuration', String(Math.max(...maxs)));
  }
  return params;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);

  const [tours,   setTours]   = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const beParams = filtersToBEParams(filters);
    setLoading(true);
    setError(null);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages?${beParams.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setTours(data.map(mapToTour))) // ← mapping applied here
      .catch(err => {
        console.error('useFilters fetch error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      const next = { ...filters, ...patch };
      const params = filtersToParams(next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, pathname, router],
  );

  const clear = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.keyword)                count++;
    if (filters.category !== 'all')     count++;
    if (filters.rating   !== 'any')     count++;
    if (filters.freeCancellation)       count++;
    if (filters.deals)                  count++;
    if (filters.familyOnly)             count++;
    if (filters.newOnly)                count++;
    if (filters.budgets.length   > 0)   count++;
    if (filters.durations.length > 0)   count++;
    if (filters.startTimes?.length > 0) count++;
    return count;
  }, [filters]);

  return { filters, tours, loading, error, activeFilterCount, update, clear };
}