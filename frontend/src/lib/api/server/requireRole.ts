import "server-only";
import { redirect } from "next/navigation";
import { apiFetchServer } from "@/lib/api/server/httpServer";

export interface AuthProfile {
  id: string;
  rol: "freelancer" | "client";
  nombre_completo: string;
}

export async function requireRole(role: "freelancer" | "client"): Promise<AuthProfile> {
  const response = await apiFetchServer("/api/auth/me");

  if (!response.ok) {
    redirect("/login");
  }

  const { profile } = (await response.json()) as { profile: AuthProfile | null };

  if (!profile) {
    redirect("/login");
  }

  if (profile.rol !== role) {
    redirect(profile.rol === "freelancer" ? "/panel/freelancer" : "/panel/cliente");
  }

  return profile;
}
