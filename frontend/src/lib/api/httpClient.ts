import { API_URL } from "@/lib/api/config";

// Para usar solo desde Client Components ("use client"): el navegador maneja
// la cookie de sesión automáticamente gracias a credentials: "include".
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}
