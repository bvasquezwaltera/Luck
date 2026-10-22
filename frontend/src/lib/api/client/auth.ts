import { apiFetch } from "@/lib/api/httpClient";
import { savePending } from "@/lib/oauthPending";
import { clearAuthTokenCookie, setAuthTokenCookie } from "@/lib/api/token";

export interface AuthActionResult {
  error?: string;
  role?: "freelancer" | "client";
  accessToken?: string;
  refreshToken?: string;
  // Entró con Google, es nueva y falta elegir el rol para crear su perfil.
  needsRole?: boolean;
}

export async function signUp(params: {
  fullName: string;
  email: string;
  password: string;
  role: string;
}): Promise<AuthActionResult> {
  const response = await apiFetch("/api/auth/sign-up", {
    method: "POST",
    body: JSON.stringify(params),
  });
  const result: AuthActionResult = await response.json();
  if (result.accessToken) setAuthTokenCookie(result.accessToken);
  return result;
}

export async function signIn(params: { email: string; password: string }): Promise<AuthActionResult> {
  const response = await apiFetch("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(params),
  });
  const result: AuthActionResult = await response.json();
  if (result.accessToken) setAuthTokenCookie(result.accessToken);
  return result;
}

export async function signOut(): Promise<void> {
  clearAuthTokenCookie();
}

export async function changePassword(params: { newPassword: string }): Promise<{ error?: string }> {
  const response = await apiFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const response = await apiFetch("/api/auth/account", { method: "DELETE" });
  const result = await response.json();
  if (!result.error) clearAuthTokenCookie();
  return result;
}

// Lleva a Google. Antes se guarda lo elegido (rol y a dónde volver), porque al regresar es otra carga de página.
export async function startGoogleSignIn(options: { role?: "freelancer" | "client"; next?: string | null } = {}): Promise<{ error?: string }> {
  const response = await apiFetch("/api/auth/google-url").catch(() => null);
  if (!response?.ok) return { error: "No se pudo conectar con Google. Inténtalo de nuevo." };

  const { url } = (await response.json()) as { url: string };
  savePending({ role: options.role, next: options.next });
  window.location.href = url;
  return {};
}

// Al volver de Google (el token ya está guardado): crea el perfil si es una cuenta nueva.
export async function completeGoogleSignIn(role?: "freelancer" | "client"): Promise<AuthActionResult> {
  const response = await apiFetch("/api/auth/oauth/complete", {
    method: "POST",
    body: JSON.stringify({ role: role ?? null }),
  }).catch(() => null);
  if (!response) return { error: "No se pudo conectar. Revisa tu conexión." };
  if (response.status === 401) return { error: "Tu sesión de Google no es válida. Inténtalo de nuevo." };
  if (!response.ok) return { error: "No se pudo completar el inicio de sesión." };
  return (await response.json()) as AuthActionResult;
}
