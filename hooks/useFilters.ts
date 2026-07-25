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

const PAGE_SIZE = 6;

// ─── Frontend category codes → backend category enum ─────────────────────────
const CATEGORY_TO_BACKEND: Record<string, string> = {
  trek:      'TREKKING',
  culture:   'CULTURAL',
  adventure: 'ADVENTURE',
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

// ─── URL params → page ─────────────────────────────────────────────────────────
function paramsToPage(params: URLSearchParams): number {
  const raw = parseInt(params.get('page') ?? '1', 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

// ─── FilterState → URL params ─────────────────────────────────────────────────
// `page` is handled separately from the rest of the filter params (see
// `update`/`goToPage` below) since it has different reset semantics: it
// should reset to 1 whenever a filter changes, but persist across re-renders
// that don't touch filters.
function filtersToParams(filters: FilterState, page: number): URLSearchParams {
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
  if (page > 1)                     params.set('page',             String(page));
  return params;
}

// ─── FilterState → Backend query params ──────────────────────────────────────
function filtersToBEParams(filters: FilterState, page: number): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.keyword)            params.set('keyword',          filters.keyword);
  if (filters.category !== 'all') {
    const backendCategory = CATEGORY_TO_BACKEND[filters.category] ?? filters.category;
    params.set('category', backendCategory);
  }
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
  params.set('page',  String(page));
  params.set('limit', String(PAGE_SIZE));
  return params;
}

interface PaginatedResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams]);
  const page    = useMemo(() => paramsToPage(searchParams),    [searchParams]);

  const [tours,      setTours]      = useState<Tour[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    const beParams = filtersToBEParams(filters, page);
    setLoading(true);
    setError(null);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages?${beParams.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: PaginatedResponse) => {
        setTours(json.data.map(mapToTour));
        setTotal(json.total);
        setTotalPages(Math.max(1, json.totalPages));
      })
      .catch(err => {
        console.error('useFilters fetch error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  // If a page becomes out of range (e.g. filters just narrowed the result
  // set), snap back to the last valid page rather than showing an empty grid.
  useEffect(() => {
    if (!loading && page > totalPages) {
      goToPage(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, totalPages]);

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      const next = { ...filters, ...patch };
      // Any filter change invalidates the current page — start over at 1.
      const params = filtersToParams(next, 1);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, pathname, router],
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      const clamped = Math.max(1, nextPage);
      const params = filtersToParams(filters, clamped);
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

  return {
    filters,
    tours,
    total,
    page,
    totalPages,
    loading,
    error,
    activeFilterCount,
    update,
    clear,
    goToPage,
  };
}