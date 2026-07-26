import "server-only";
import { redirect } from "next/navigation";
import { createClient as createAuthServerClient } from "@/server/supabase/authServerClient";
import { supabase as adminClient } from "@/server/supabase/client";

export async function requireRole(role: "freelancer" | "client") {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await adminClient
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.rol !== role) {
    redirect(profile.rol === "freelancer" ? "/panel/freelancer" : "/panel/cliente");
  }

  return profile as { id: string; rol: "freelancer" | "client"; nombre_completo: string };
}
