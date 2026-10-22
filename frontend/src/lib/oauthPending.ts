import { getSafeNext } from "@/lib/safeNext";

// Lo que la persona había elegido antes de salir a Google (el rol del registro y a dónde volver): la página
// de retorno es otra carga de página, así que se guarda en la pestaña.
const KEY = "luck:oauth";

export interface OAuthPending {
  role?: "freelancer" | "client";
  next?: string | null;
}

export function savePending(pending: OAuthPending) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(pending));
  } catch {
    // Sin almacenamiento (modo privado estricto) se sigue sin recordarlo: se vuelve a preguntar el rol.
  }
}

export function readPending(): OAuthPending {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as { role?: unknown; next?: unknown };
    return {
      role: raw.role === "freelancer" || raw.role === "client" ? raw.role : undefined,
      next: getSafeNext(typeof raw.next === "string" ? raw.next : null),
    };
  } catch {
    return {};
  }
}

export function clearPending() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nada que limpiar
  }
}
