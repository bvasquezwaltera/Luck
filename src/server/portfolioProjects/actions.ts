"use server";

import { supabase as adminClient } from "@/server/supabase/client";
import type { PortfolioProject } from "@/types/portfolioProject";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export async function getPortfolioProjects(freelancerId: string): Promise<PortfolioProject[]> {
  const { data } = await adminClient
    .from("proyectos_portafolio")
    .select("*")
    .eq("freelancer_id", freelancerId)
    .order("posicion");

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.nombre,
    category: row.categoria,
    description: row.descripcion,
    techStack: row.tech_stack ?? [],
    date: row.mes && row.anio ? `${MONTH_LABELS[row.mes - 1]} ${row.anio}` : "",
    dateValue: row.mes && row.anio ? `${row.anio}-${String(row.mes).padStart(2, "0")}` : "",
    duration: row.duracion,
    url: row.url,
    bannerClassName: row.banner_class,
    imageUrl: row.imagen_url ?? undefined,
  }));
}

export async function addPortfolioProject(
  freelancerId: string,
  project: PortfolioProject,
): Promise<{ error?: string }> {
  const [anio, mes] = project.dateValue ? project.dateValue.split("-").map(Number) : [null, null];

  const { error } = await adminClient.from("proyectos_portafolio").insert({
    freelancer_id: freelancerId,
    nombre: project.name,
    categoria: project.category,
    descripcion: project.description,
    tech_stack: project.techStack,
    mes,
    anio,
    duracion: project.duration,
    url: project.url,
    banner_class: project.bannerClassName,
    imagen_url: project.imageUrl ?? null,
  });

  return error ? { error: error.message } : {};
}

export async function deletePortfolioProject(
  freelancerId: string,
  projectId: string,
): Promise<{ error?: string }> {
  const { error } = await adminClient
    .from("proyectos_portafolio")
    .delete()
    .eq("id", projectId)
    .eq("freelancer_id", freelancerId);

  return error ? { error: error.message } : {};
}
