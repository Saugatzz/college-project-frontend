import axios from 'axios';
import { getToken, clearAuth } from '@/lib/auth/tokenStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? getToken() : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      clearAuth();
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;