import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_TOKEN_COOKIE } from "@/lib/api/config";
import { apiFetchServer } from "@/lib/api/server/httpServer";

export interface AuthProfile {
  id: string;
  rol: "freelancer" | "client";
  nombre_completo: string;
  onboarding: "pendiente" | "bienvenida_vista" | "completado";
}

export async function requireRole(role: "freelancer" | "client"): Promise<AuthProfile> {
  const response = await apiFetchServer("/api/auth/me");

  if (!response.ok) {
    // Con una cookie de sesión pero sin que el servidor la acepte, la sesión venció: se intenta renovar antes de pedir
    // que inicie sesión (las páginas del servidor no pueden escribir cookies; esa pantalla sí).
    const hadSession = Boolean((await cookies()).get(AUTH_TOKEN_COOKIE)?.value);
    redirect(response.status === 401 && hadSession ? `/auth/renovar?next=${encodeURIComponent(`/panel/${role === "client" ? "cliente" : "freelancer"}`)}` : "/login");
  }

  // El backend devuelve el perfil directo (no envuelto en { profile }).
  const profile = (await response.json()) as AuthProfile;

  if (profile.rol !== role) {
    redirect(profile.rol === "freelancer" ? "/panel/freelancer" : "/panel/cliente");
  }

  return profile;
}
