// Admin and user sessions are kept in completely separate storage
// namespaces (different localStorage keys, different cookies). Logging
// into /dashboard as an admin must never make the public site think a
// user is logged in, and vice versa — these two session stores never
// share state.

const USER_TOKEN_KEY  = 'nepal_treks_user_token';
const USER_DATA_KEY    = 'nepal_treks_user_data';
const ADMIN_TOKEN_KEY = 'nepal_treks_admin_token';
const ADMIN_DATA_KEY   = 'nepal_treks_admin_data';
const TTL = 7 * 24 * 60 * 60 * 1000;

export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

function save(tokenKey: string, dataKey: string, cookieName: string, token: string, user: AuthUser) {
  const payload = { token, expiresAt: Date.now() + TTL };
  localStorage.setItem(tokenKey, JSON.stringify(payload));
  localStorage.setItem(dataKey, JSON.stringify(user));
  document.cookie = `${cookieName}=${token}; max-age=${7 * 24 * 60 * 60}; path=/; SameSite=Strict`;
}

function read(tokenKey: string, clearFn: () => void): string | null {
  try {
    const raw = localStorage.getItem(tokenKey);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { clearFn(); return null; }
    return token;
  } catch { return null; }
}

function readUser(dataKey: string): AuthUser | null {
  try {
    const raw = localStorage.getItem(dataKey);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch { return null; }
}

// ── Regular (public-site) user session ──────────────────────────────
export function saveAuth(token: string, user: AuthUser) {
  save(USER_TOKEN_KEY, USER_DATA_KEY, 'auth_token', token, user);
}
export function getToken(): string | null {
  return read(USER_TOKEN_KEY, clearAuth);
}
export function getUser(): AuthUser | null {
  return readUser(USER_DATA_KEY);
}
export function clearAuth() {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  document.cookie = 'auth_token=; max-age=0; path=/';
}

// ── Admin (dashboard) session — entirely separate storage ───────────
export function saveAdminAuth(token: string, user: AuthUser) {
  save(ADMIN_TOKEN_KEY, ADMIN_DATA_KEY, 'admin_auth_token', token, user);
}
export function getAdminToken(): string | null {
  return read(ADMIN_TOKEN_KEY, clearAdminAuth);
}
export function getAdminUser(): AuthUser | null {
  return readUser(ADMIN_DATA_KEY);
}
export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_DATA_KEY);
  document.cookie = 'admin_auth_token=; max-age=0; path=/';
}