import { AUTH_TOKEN_COOKIE } from "@/lib/api/config";

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
