import { AUTH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/api/config";

// Solo para usar desde Client Components: lee/escribe la cookie donde vive el
// access token que devuelve el backend al iniciar sesión.
export function setAuthTokenCookie(token: string) {
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

export function clearAuthTokenCookie() {
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
}

export function getAuthTokenFromDocument(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Con el token de renovación se pide un token de acceso nuevo cuando el actual vence (dura una hora).
export function setRefreshTokenCookie(token: string) {
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

export function clearRefreshTokenCookie() {
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
}

export function getRefreshTokenFromDocument(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFRESH_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Guarda la sesión completa que devuelve el backend (acceso y, si viene, renovación).
export function storeSession(tokens: { accessToken: string; refreshToken?: string | null }) {
  setAuthTokenCookie(tokens.accessToken);
  if (tokens.refreshToken) setRefreshTokenCookie(tokens.refreshToken);
}

export function clearSession() {
  clearAuthTokenCookie();
  clearRefreshTokenCookie();
}
