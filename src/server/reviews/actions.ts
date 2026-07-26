"use server";

import { supabase as adminClient } from "@/server/supabase/client";
import type { ReviewEntry } from "@/types/review";

function toRelativeDate(dateValue: string): string {
  const days = Math.floor((Date.now() - new Date(dateValue).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Hoy";
  if (days === 1) return "Hace 1 día";
  if (days < 30) return `Hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months === 1) return "Hace 1 mes";
  if (months < 12) return `Hace ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "Hace 1 año" : `Hace ${years} años`;
}

export async function getReviews(freelancerId: string): Promise<ReviewEntry[]> {
  const { data } = await adminClient
    .from("resenas")
    .select("*")
    .eq("freelancer_id", freelancerId)
    .order("creado_en", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    reviewerName: row.nombre_autor,
    reviewerInitials: row.iniciales_autor,
    country: row.pais ?? "",
    countryCode: row.pais_codigo ?? "",
    rating: row.calificacion,
    title: row.titulo,
    comment: row.comentario,
    tags: row.etiquetas ?? [],
    service: row.servicio,
    dateValue: row.creado_en,
    relativeDate: toRelativeDate(row.creado_en),
  }));
}
