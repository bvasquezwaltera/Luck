import "server-only";
import { cookies } from "next/headers";
import { API_URL, AUTH_TOKEN_COOKIE } from "@/lib/api/config";

// Para usar solo desde Server Components: adjunta el access token (guardado
// en una cookie propia del frontend, no la de Supabase) como Authorization header.
export async function apiFetchServer(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  return fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}
