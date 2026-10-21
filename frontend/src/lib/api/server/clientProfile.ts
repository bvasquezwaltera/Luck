import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { ClientProfile } from "@/types/clientProfile";

export async function getClientProfile(): Promise<ClientProfile | null> {
  const response = await apiFetchServer("/api/client-profile/me");
  if (!response.ok) return null;
  return (await response.json()) as ClientProfile;
}
