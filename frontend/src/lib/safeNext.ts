// Ruta interna a la que volver después de iniciar sesión (?next=...). Solo se
// aceptan rutas del propio sitio: cualquier otra cosa (URLs absolutas,
// "//otro.sitio", "/\otro.sitio") se descarta para evitar redirecciones abiertas.
export function getSafeNext(value: string | string[] | undefined | null): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

export function withNext(path: string, next: string | null): string {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}
