import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { ClientSolicitud } from "@/types/clientSolicitud";

export async function getMySolicitudes(): Promise<ClientSolicitud[]> {
  const response = await apiFetchServer("/api/solicitudes/mine");
  if (!response.ok) return [];
  return (await response.json()) as ClientSolicitud[];
}
