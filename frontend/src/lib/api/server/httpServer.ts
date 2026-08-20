import "server-only";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api/config";

// Para usar solo desde Server Components: el fetch corre servidor-a-servidor,
// así que hay que reenviar manualmente la cookie de sesión del navegador.
export async function apiFetchServer(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader, ...init?.headers },
  });
}
