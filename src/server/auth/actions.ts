"use server";

import { redirect } from "next/navigation";
import { createClient as createAuthServerClient } from "@/server/supabase/authServerClient";
import { supabase as adminClient } from "@/server/supabase/client";

export interface AuthActionResult {
  error?: string;
}

const PANEL_PATH_BY_ROLE: Record<string, string> = {
  freelancer: "/panel/freelancer",
  client: "/panel/cliente",
};

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (role !== "freelancer" && role !== "client") {
    return { error: "Rol inválido." };
  }

  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }
  if (!data.user) {
    return { error: "No se pudo crear la cuenta." };
  }

  const { error: profileError } = await adminClient.from("perfiles").insert({
    id: data.user.id,
    rol: role,
    nombre_completo: fullName,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  redirect(PANEL_PATH_BY_ROLE[role]);
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createAuthServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("perfiles")
    .select("rol")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return { error: "No se encontró el perfil de esta cuenta." };
  }

  redirect(PANEL_PATH_BY_ROLE[profile.rol] ?? "/");
}

export async function signOut() {
  const supabase = await createAuthServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
