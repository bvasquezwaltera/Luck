import { apiFetch } from "@/lib/api/httpClient";
import type { ClientProfile } from "@/types/clientProfile";

export async function saveClientProfile(
  profile: Pick<ClientProfile, "name" | "country" | "countryCode" | "timezone">,
): Promise<{ error?: string }> {
  const response = await apiFetch("/api/client-profile/me", {
    method: "PUT",
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    // Si el servidor explica qué falló (p. ej. un nombre inválido), se muestra tal cual.
    const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
    return { error: typeof body?.detail === "string" ? body.detail : "No se pudieron guardar los cambios." };
  }
  return {};
}
