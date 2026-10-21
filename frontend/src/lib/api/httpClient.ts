import { API_URL } from "@/lib/api/config";
import { getAuthTokenFromDocument } from "@/lib/api/token";

// Para usar solo desde Client Components ("use client"): adjunta el access
// token guardado en la cookie propia del frontend como Authorization header.
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAuthTokenFromDocument();

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
