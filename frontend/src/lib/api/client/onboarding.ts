import { apiFetch } from "@/lib/api/httpClient";
import type { OnboardingState } from "@/lib/onboardingSteps";

// Guarda hasta dónde llegó la guía de bienvenida. Si falla no se molesta a nadie: en el peor caso la guía vuelve a salir.
export async function saveOnboardingState(state: OnboardingState): Promise<void> {
  await apiFetch("/api/auth/onboarding", { method: "POST", body: JSON.stringify({ state }) }).catch(() => null);
}
