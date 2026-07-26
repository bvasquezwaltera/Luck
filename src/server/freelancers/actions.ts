"use server";

import { supabase as adminClient } from "@/server/supabase/client";
import { getInitials } from "@/lib/getInitials";
import type { Freelancer } from "@/types/freelancer";

export async function getFreelancerList(): Promise<Freelancer[]> {
  const { data: perfiles } = await adminClient.from("perfiles").select("*").eq("rol", "freelancer");

  const freelancerIds = (perfiles ?? []).map((perfil) => perfil.id);
  if (freelancerIds.length === 0) return [];

  const [{ data: perfilesFreelancer }, { data: habilidades }, { data: planes }] = await Promise.all([
    adminClient.from("perfiles_freelancer").select("*").in("perfil_id", freelancerIds),
    adminClient.from("habilidades_freelancer").select("*").in("freelancer_id", freelancerIds).order("posicion"),
    adminClient
      .from("planes_suscripcion")
      .select("*")
      .in("freelancer_id", freelancerIds)
      .eq("activo", true),
  ]);

  return (perfiles ?? [])
    .map((perfil) => {
      const perfilFreelancer = (perfilesFreelancer ?? []).find((value) => value.perfil_id === perfil.id);
      if (!perfilFreelancer) return null;

      const skills = (habilidades ?? [])
        .filter((habilidad) => habilidad.freelancer_id === perfil.id)
        .map((habilidad) => habilidad.nombre);

      const planPrices = (planes ?? [])
        .filter((plan) => plan.freelancer_id === perfil.id)
        .map((plan) => Number(plan.precio));

      const freelancer: Freelancer = {
        id: perfil.id,
        name: perfil.nombre_completo,
        initials: getInitials(perfil.nombre_completo),
        rating: perfilFreelancer.calificacion ?? 0,
        reviewCount: perfilFreelancer.cantidad_resenas ?? 0,
        specialty: perfilFreelancer.especialidad ?? "",
        category: perfilFreelancer.categoria ?? "",
        country: perfil.pais ?? "",
        countryCode: perfil.pais_codigo ?? "",
        skills,
        // El conteo real de proyectos depende de datos que todavía no existen.
        projectCount: 0,
        monthlyPriceFrom: planPrices.length > 0 ? Math.min(...planPrices) : 0,
      };

      return freelancer;
    })
    .filter((freelancer): freelancer is Freelancer => freelancer !== null);
}
