import { API_URL } from "@/lib/api/config";
import { getAuthTokenFromDocument } from "@/lib/api/token";

// Para usar solo desde Client Components ("use client"): adjunta el access
// token guardado en la cookie propia del frontend como Authorization header.
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAuthTokenFromDocument();

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}
