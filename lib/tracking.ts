// lib/tracking.ts
//
// Tour-view tracking that works for guests too.
//
// - Logged-in visitor: the view is sent straight to the backend.
// - Guest: the tour id is remembered in localStorage. As soon as the
//   person logs in or signs up, flushGuestViews() replays those views
//   to the backend so their browsing before the account still shapes
//   their recommendations.
//
// Everything here is fire-and-forget: tracking must never show an error
// or slow anything down for the visitor.
import api from '@/lib/api/api';
import { getToken } from '@/lib/auth/tokenStore';

const GUEST_VIEWS_KEY = 'nepal_treks_guest_views';
const MAX_GUEST_VIEWS = 15;

function readGuestViews(): number[] {
  try {
    const raw = localStorage.getItem(GUEST_VIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

export function trackTourView(tourId: number | undefined | null) {
  if (typeof window === 'undefined' || !tourId) return;

  if (getToken()) {
    api.post(`/packages/${tourId}/interact`, { type: 'view' }).catch(() => {});
    return;
  }

  try {
    // Most recent last, no duplicates, capped so it can't grow forever.
    const next = readGuestViews().filter((id) => id !== tourId);
    next.push(tourId);
    localStorage.setItem(GUEST_VIEWS_KEY, JSON.stringify(next.slice(-MAX_GUEST_VIEWS)));
  } catch {
    /* storage unavailable (private mode etc.) — nothing to do */
  }
}

// Call right after saveAuth() on login / signup.
export function flushGuestViews() {
  if (typeof window === 'undefined') return;
  const ids = readGuestViews();
  if (ids.length === 0) return;

  try {
    localStorage.removeItem(GUEST_VIEWS_KEY);
  } catch {
    /* ignore */
  }

  // Oldest first, so the most recent view ends up with the newest timestamp.
  ids.forEach((id) => {
    api.post(`/packages/${id}/interact`, { type: 'view' }).catch(() => {});
  });
}

// Only allow redirecting to a path inside this site. Without this, a link
// like /user/login?redirect=https://evil.example would send a freshly
// logged-in person to another website.
export function safeRedirect(raw: string | null | undefined, fallback = '/account'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  return raw;
}
