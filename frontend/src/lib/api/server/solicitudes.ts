import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { ClientSolicitud } from "@/types/clientSolicitud";
import type { ReceivedSolicitud } from "@/types/receivedSolicitud";

export async function getMySolicitudes(): Promise<ClientSolicitud[]> {
  const response = await apiFetchServer("/api/solicitudes/mine");
  if (!response.ok) return [];
  return (await response.json()) as ClientSolicitud[];
}

export async function getReceivedSolicitudes(): Promise<ReceivedSolicitud[]> {
  const response = await apiFetchServer("/api/solicitudes/received");
  if (!response.ok) return [];
  return (await response.json()) as ReceivedSolicitud[];
}
