import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";

// Rol de quien mira la página, o null si no hay sesión. A diferencia de
// requireRole, no redirige: sirve para páginas públicas que cambian según el rol.
export async function getViewerRole(): Promise<"client" | "freelancer" | null> {
  const response = await apiFetchServer("/api/auth/me");
  if (!response.ok) return null;

  const { rol } = (await response.json()) as { rol: "client" | "freelancer" };
  return rol;
}
