import { apiFetch } from "@/lib/api/httpClient";
import { clearAuthTokenCookie, setAuthTokenCookie } from "@/lib/api/token";

export interface AuthActionResult {
  error?: string;
  role?: "freelancer" | "client";
  accessToken?: string;
  refreshToken?: string;
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
