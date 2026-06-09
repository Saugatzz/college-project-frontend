const TOKEN_KEY = 'nepal_treks_token';
const USER_KEY  = 'nepal_treks_user';
const TTL       = 7 * 24 * 60 * 60 * 1000;

export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

export function saveAuth(token: string, user: AuthUser) {
  const payload = { token, expiresAt: Date.now() + TTL };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(payload));
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `auth_token=${token}; max-age=${7 * 24 * 60 * 60}; path=/; SameSite=Strict`;
}

export function getToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { clearAuth(); return null; }
    return token;
  } catch { return null; }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'auth_token=; max-age=0; path=/';
}