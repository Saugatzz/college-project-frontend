'use client';
import { useState, useMemo } from 'react';
import type { Category, Tour } from '@/types/tour';
import { TOURS } from '@/data/tours';

export interface FilterState {
  keyword: string;
  category: Category | 'all';
  rating: string;
  budgets: number[][];
  durations: number[][];
  familyOnly: boolean;
  freeCancellation?: boolean;
  deals?: boolean;
  newOnly?: boolean;
  startTimes?: string[];
}

const defaultFilters: FilterState = {
  keyword: '',
  category: 'all',
  rating: 'any',
  budgets: [],
  durations: [],
  familyOnly: false,
  freeCancellation: false,
  deals: false,
  newOnly: false,
  startTimes: [],
};

function fuzzyMatch(tour: Tour, keyword: string): boolean {
  if (!keyword) return true;
  const haystack = [tour.name, tour.tagline, tour.category, tour.difficulty, tour.duration, ...tour.tags]
    .join(' ')
    .toLowerCase();
  return keyword.trim().split(/\s+/).every(word => haystack.includes(word));
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filtered = useMemo(() => {
    return TOURS.filter(t => {
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (!fuzzyMatch(t, filters.keyword.toLowerCase())) return false;
      if (filters.budgets.length && !filters.budgets.some(([mn, mx]) => t.price >= mn && t.price <= mx)) return false;
      if (filters.durations.length && !filters.durations.some(([mn, mx]) => t.days >= mn && t.days <= mx)) return false;
      if (filters.familyOnly && t.difficulty !== 'easy') return false;
      return true;
    });
  }, [filters]);

  const activeFilterCount = [
    filters.keyword,
    filters.rating !== 'any' ? filters.rating : '',
    ...filters.budgets,
    ...filters.durations,
    filters.familyOnly ? 'family' : '',
  ].filter(Boolean).length;

  const clear = () => setFilters(defaultFilters);
  const update = (patch: Partial<FilterState>) => setFilters(prev => ({ ...prev, ...patch }));

  return { filters, filtered, activeFilterCount, update, clear };
}
