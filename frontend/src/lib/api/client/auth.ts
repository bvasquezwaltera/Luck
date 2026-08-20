import { apiFetch } from "@/lib/api/httpClient";

export interface AuthActionResult {
  error?: string;
  role?: "freelancer" | "client";
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
  return response.json();
}

export async function signIn(params: { email: string; password: string }): Promise<AuthActionResult> {
  const response = await apiFetch("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function signOut(): Promise<void> {
  await apiFetch("/api/auth/sign-out", { method: "POST" });
}
