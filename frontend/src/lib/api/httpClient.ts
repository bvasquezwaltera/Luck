import { API_URL } from "@/lib/api/config";
import { createRefresher, loginUrlAfterExpiry } from "@/lib/api/sessionRefresh";
import { getAuthTokenFromDocument, getRefreshTokenFromDocument, clearSession, storeSession } from "@/lib/api/token";

// Renovación de la sesión con el token de renovación (una sola a la vez, aunque fallen varias peticiones juntas).
export const refreshSession = createRefresher({
  readRefreshToken: getRefreshTokenFromDocument,
  callRefresh: async (refreshToken) => {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { accessToken?: string; refreshToken?: string; error?: string };
    return body.accessToken && body.refreshToken ? { accessToken: body.accessToken, refreshToken: body.refreshToken } : null;
  },
  store: storeSession,
});

let leavingForLogin = false;

// La sesión ya no sirve y no se pudo renovar: se limpia y se lleva a iniciar sesión, con el aviso y de vuelta al panel.
export function expireSession() {
  if (leavingForLogin || typeof window === "undefined") return;
  leavingForLogin = true;
  clearSession();
  window.location.assign(loginUrlAfterExpiry(window.location.pathname, window.location.search));
}

function send(path: string, init: RequestInit | undefined, token: string | null): Promise<Response> {
  // Con FormData el navegador pone solo el Content-Type (con el boundary); forzar JSON rompería la subida.
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}

// Para usar solo desde Client Components ("use client"): adjunta el access token guardado en la cookie propia del
// frontend como Authorization header. Si el servidor responde que la sesión venció (401), primero intenta renovarla y
// repite la petición una vez; si no se puede, lleva a iniciar sesión.
export async function apiFetch(
  path: string,
  init?: RequestInit,
  options: { onUnauthorized?: "renew" | "ignore" } = {},
): Promise<Response> {
  const token = getAuthTokenFromDocument();
  const response = await send(path, init, token);

  // Sin token no hay sesión que renovar (una petición pública), y "ignore" es para quien maneja el 401 por su cuenta.
  if (response.status !== 401 || !token || options.onUnauthorized === "ignore") return response;

  if (await refreshSession()) return send(path, init, getAuthTokenFromDocument());

  expireSession();
  return response;
}
