import { apiFetch } from "@/lib/api/httpClient";
import { API_URL } from "@/lib/api/config";
import { savePending } from "@/lib/oauthPending";
import { clearSession, storeSession } from "@/lib/api/token";

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
  if (result.accessToken) storeSession({ accessToken: result.accessToken, refreshToken: result.refreshToken });
  return result;
}

export async function signIn(params: { email: string; password: string }): Promise<AuthActionResult> {
  const response = await apiFetch("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(params),
  });
  const result: AuthActionResult = await response.json();
  if (result.accessToken) storeSession({ accessToken: result.accessToken, refreshToken: result.refreshToken });
  return result;
}

export async function signOut(): Promise<void> {
  clearSession();
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
  if (!result.error) clearSession();
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
  }, { onUnauthorized: "ignore" }).catch(() => null);
  if (!response) return { error: "No se pudo conectar. Revisa tu conexión." };
  if (response.status === 401) return { error: "Tu sesión de Google no es válida. Inténtalo de nuevo." };
  if (!response.ok) return { error: "No se pudo completar el inicio de sesión." };
  return (await response.json()) as AuthActionResult;
}

// Pide el correo con el enlace para elegir una contraseña nueva.
export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  const response = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  }).catch(() => null);
  if (!response?.ok) return { error: "No se pudo enviar el correo. Revisa tu conexión e inténtalo de nuevo." };
  const result = (await response.json()) as { error?: string | null };
  return result.error ? { error: result.error } : {};
}

// Guarda la contraseña nueva con la sesión temporal del enlace del correo. Esa sesión no se guarda como inicio de
// sesión (no se escribe la cookie): solo sirve para este cambio, y después la persona entra con su contraseña nueva.
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ error?: string }> {
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ newPassword }),
  }).catch(() => null);
  if (!response) return { error: "No se pudo conectar. Revisa tu conexión e inténtalo de nuevo." };
  if (response.status === 401) return { error: "El enlace venció. Pide uno nuevo para continuar." };
  const result = (await response.json().catch(() => ({}))) as { error?: string | null };
  return result.error ? { error: result.error } : {};
}
