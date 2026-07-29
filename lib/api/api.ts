import axios from 'axios';
import { getToken, getAdminToken, clearAuth, clearAdminAuth } from '@/lib/auth/tokenStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Admin and user sessions are stored (and sent) completely
    // separately. Which one applies is decided by which section of the
    // app is making the call, not by "whichever token happens to
    // exist" — otherwise an admin session could leak into a public-site
    // request (or vice versa) just because both happened to be logged
    // in at once.
    const isAdminSection = window.location.pathname.startsWith('/dashboard');
    const token = isAdminSection ? getAdminToken() : getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      const isAdminSection = window.location.pathname.startsWith('/dashboard');
      if (isAdminSection) {
        clearAdminAuth();
        window.location.href = '/auth/login';
      } else {
        // Regular user pages (e.g. /account) clear their own logged-in
        // state and show a sign-in prompt instead of a hard redirect.
        clearAuth();
      }
    }
    return Promise.reject(err);
  }
);

export default api;