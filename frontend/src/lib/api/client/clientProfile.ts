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
    return { error: "No se pudieron guardar los cambios." };
  }
  return {};
}
