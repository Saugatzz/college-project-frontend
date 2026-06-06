'use client';
import { useState, useMemo } from 'react';
import type { Tour } from '@/types/tour';

export type FilterState = {
  keyword:         string;
  category:        string;
  rating:          string;
  freeCancellation:boolean;
  deals:           boolean;
  familyOnly:      boolean;
  newOnly:         boolean;
  budgets:         number[][];
  startTimes:      string[];
  durations:       number[][];
};

const DEFAULTS: FilterState = {
  keyword:         '',
  category:        'all',
  rating:          'any',
  freeCancellation:false,
  deals:           false,
  familyOnly:      false,
  newOnly:         false,
  budgets:         [],
  startTimes:      [],
  durations:       [],
};

export function useFilters(tours: Tour[]) {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULTS });

  const filtered = useMemo(() => {
    return tours.filter(tour => {
      // Keyword
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const match =
          tour.name.toLowerCase().includes(kw)        ||
          tour.tagline.toLowerCase().includes(kw)     ||
          tour.description.toLowerCase().includes(kw);
        if (!match) return false;
      }

      // Category
      if (filters.category !== 'all' && tour.category !== filters.category)
        return false;

      // Rating
      if (filters.rating !== 'any') {
        const min = Number(filters.rating);
        if (tour.rating < min) return false;
      }

      // Budget ranges — tour must fall in at least one checked range
      if (filters.budgets.length > 0) {
        const inRange = filters.budgets.some(
          ([min, max]) => tour.price >= min && tour.price <= max
        );
        if (!inRange) return false;
      }

      // Duration ranges — tour must fall in at least one checked range
      if (filters.durations.length > 0) {
        const days = Number(tour.duration); // works if duration is stored as number
        const inRange = filters.durations.some(
          ([min, max]) => days >= min && days <= max
        );
        if (!inRange) return false;
      }

      return true;
    });
  }, [tours, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.keyword)              count++;
    if (filters.category !== 'all')   count++;
    if (filters.rating   !== 'any')   count++;
    if (filters.freeCancellation)     count++;
    if (filters.deals)                count++;
    if (filters.familyOnly)           count++;
    if (filters.newOnly)              count++;
    if (filters.budgets.length   > 0) count++;
    if (filters.durations.length > 0) count++;
    if (filters.startTimes.length > 0) count++;
    return count;
  }, [filters]);

  const update = (patch: Partial<FilterState>) =>
    setFilters(f => ({ ...f, ...patch }));

  const clear = () => setFilters({ ...DEFAULTS });

  return { filters, filtered, activeFilterCount, update, clear };
}