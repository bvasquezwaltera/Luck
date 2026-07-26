"use server";

import { supabase as adminClient } from "@/server/supabase/client";
import { getInitials } from "@/lib/getInitials";
import { isRecentlyActive } from "@/lib/isRecentlyActive";
import { parsePeriod, formatPeriod, PRESENT } from "@/lib/periodFormat";
import type { FreelancerProfile } from "@/types/freelancerProfile";

function yearsToPeriod(yearFrom: number, yearTo: number | null): string {
  return formatPeriod(String(yearFrom), yearTo === null ? PRESENT : String(yearTo));
}

function periodToYears(period: string): { from: number; to: number | null } {
  const { from, to } = parsePeriod(period);
  return {
    from: Number(from) || 0,
    to: !to || to === PRESENT ? null : Number(to),
  };
}

export async function getFreelancerProfile(freelancerId: string): Promise<FreelancerProfile | null> {
  const [
    { data: perfil },
    { data: perfilFreelancer },
    { data: diferenciadores },
    { data: habilidades },
    { data: herramientas },
    { data: idiomas },
    { data: categorias },
    { data: experiencia },
    { data: educacion },
    { data: authUser },
  ] = await Promise.all([
    adminClient.from("perfiles").select("*").eq("id", freelancerId).single(),
    adminClient.from("perfiles_freelancer").select("*").eq("perfil_id", freelancerId).single(),
    adminClient
      .from("diferenciadores_freelancer")
      .select("*")
      .eq("freelancer_id", freelancerId)
      .order("posicion"),
    adminClient.from("habilidades_freelancer").select("*").eq("freelancer_id", freelancerId).order("posicion"),
    adminClient.from("herramientas_freelancer").select("*").eq("freelancer_id", freelancerId).order("posicion"),
    adminClient.from("idiomas_freelancer").select("*").eq("freelancer_id", freelancerId).order("posicion"),
    adminClient
      .from("categorias_metodos_trabajo")
      .select("*")
      .eq("freelancer_id", freelancerId)
      .order("posicion"),
    adminClient.from("experiencia").select("*").eq("freelancer_id", freelancerId).order("anio_desde"),
    adminClient.from("educacion").select("*").eq("freelancer_id", freelancerId).order("anio_desde"),
    adminClient.auth.admin.getUserById(freelancerId),
  ]);

  if (!perfil || perfil.rol !== "freelancer") return null;

  const categoriaIds = (categorias ?? []).map((categoria) => categoria.id);
  const { data: items } =
    categoriaIds.length > 0
      ? await adminClient
          .from("items_metodos_trabajo")
          .select("*")
          .in("categoria_id", categoriaIds)
          .order("posicion")
      : { data: [] as { categoria_id: string; valor: string }[] };

  return {
    id: perfil.id,
    name: perfil.nombre_completo,
    email: authUser?.user?.email ?? "",
    initials: getInitials(perfil.nombre_completo),
    rating: perfilFreelancer?.calificacion ?? 0,
    reviewCount: perfilFreelancer?.cantidad_resenas ?? 0,
    specialty: perfilFreelancer?.especialidad ?? "",
    category: perfilFreelancer?.categoria ?? "",
    country: perfil.pais ?? "",
    countryCode: perfil.pais_codigo ?? "",
    timezone: perfil.zona_horaria ?? "",
    online: isRecentlyActive(perfil.last_active_at),
    languages: (idiomas ?? []).map((idioma) => ({ name: idioma.nombre, level: idioma.nivel })),
    skills: (habilidades ?? []).map((habilidad) => habilidad.nombre),
    // Badges y stats dependen de proyectos/reseñas reales que todavía no existen.
    badges: { successRate: 0, topRated: false, avgResponseTime: "" },
    stats: { completedProjects: 0, hoursWorked: 0, repeatClients: 0, memberSince: "", lastDelivery: "" },
    bio: perfilFreelancer?.biografia ?? "",
    differentiators: (diferenciadores ?? []).map((diferenciador) => diferenciador.contenido),
    experience: (experiencia ?? []).map((entry) => ({
      period: yearsToPeriod(entry.anio_desde, entry.anio_hasta),
      role: entry.rol,
      company: entry.empresa,
      description: entry.descripcion,
    })),
    education: (educacion ?? []).map((entry) => ({
      period: yearsToPeriod(entry.anio_desde, entry.anio_hasta),
      degree: entry.titulo,
      institution: entry.institucion,
    })),
    tools: (herramientas ?? []).map((herramienta) => herramienta.nombre),
    availabilityStatus: perfilFreelancer?.estado_disponibilidad ?? "",
    workMethods: (categorias ?? []).map((categoria) => ({
      label: categoria.etiqueta,
      items: (items ?? [])
        .filter((item) => item.categoria_id === categoria.id)
        .map((item) => item.valor),
    })),
  };
}

export async function saveFreelancerProfile(
  freelancerId: string,
  profile: FreelancerProfile,
): Promise<{ error?: string }> {
  const { error: perfilError } = await adminClient
    .from("perfiles")
    .update({
      nombre_completo: profile.name,
      pais: profile.country,
      pais_codigo: profile.countryCode,
      zona_horaria: profile.timezone,
    })
    .eq("id", freelancerId);

  if (perfilError) return { error: perfilError.message };

  const { error: perfilFreelancerError } = await adminClient.from("perfiles_freelancer").upsert({
    perfil_id: freelancerId,
    especialidad: profile.specialty,
    categoria: profile.category,
    biografia: profile.bio,
    estado_disponibilidad: profile.availabilityStatus,
  });

  if (perfilFreelancerError) return { error: perfilFreelancerError.message };

  await adminClient.from("diferenciadores_freelancer").delete().eq("freelancer_id", freelancerId);
  if (profile.differentiators.length > 0) {
    const { error } = await adminClient.from("diferenciadores_freelancer").insert(
      profile.differentiators.map((contenido, index) => ({
        freelancer_id: freelancerId,
        contenido,
        posicion: index,
      })),
    );
    if (error) return { error: error.message };
  }

  await adminClient.from("habilidades_freelancer").delete().eq("freelancer_id", freelancerId);
  if (profile.skills.length > 0) {
    const { error } = await adminClient.from("habilidades_freelancer").insert(
      profile.skills.map((nombre, index) => ({ freelancer_id: freelancerId, nombre, posicion: index })),
    );
    if (error) return { error: error.message };
  }

  await adminClient.from("herramientas_freelancer").delete().eq("freelancer_id", freelancerId);
  if (profile.tools.length > 0) {
    const { error } = await adminClient.from("herramientas_freelancer").insert(
      profile.tools.map((nombre, index) => ({ freelancer_id: freelancerId, nombre, posicion: index })),
    );
    if (error) return { error: error.message };
  }

  await adminClient.from("idiomas_freelancer").delete().eq("freelancer_id", freelancerId);
  if (profile.languages.length > 0) {
    const { error } = await adminClient.from("idiomas_freelancer").insert(
      profile.languages.map((language, index) => ({
        freelancer_id: freelancerId,
        nombre: language.name,
        nivel: language.level,
        posicion: index,
      })),
    );
    if (error) return { error: error.message };
  }

  await adminClient.from("experiencia").delete().eq("freelancer_id", freelancerId);
  if (profile.experience.length > 0) {
    const { error } = await adminClient.from("experiencia").insert(
      profile.experience.map((entry) => {
        const { from, to } = periodToYears(entry.period);
        return {
          freelancer_id: freelancerId,
          anio_desde: from,
          anio_hasta: to,
          rol: entry.role,
          empresa: entry.company,
          descripcion: entry.description,
        };
      }),
    );
    if (error) return { error: error.message };
  }

  await adminClient.from("educacion").delete().eq("freelancer_id", freelancerId);
  if (profile.education.length > 0) {
    const { error } = await adminClient.from("educacion").insert(
      profile.education.map((entry) => {
        const { from, to } = periodToYears(entry.period);
        return {
          freelancer_id: freelancerId,
          anio_desde: from,
          anio_hasta: to ?? from,
          titulo: entry.degree,
          institucion: entry.institution,
        };
      }),
    );
    if (error) return { error: error.message };
  }

  // categorias_metodos_trabajo se borra en cascada junto con sus items.
  await adminClient.from("categorias_metodos_trabajo").delete().eq("freelancer_id", freelancerId);
  for (const [index, category] of profile.workMethods.entries()) {
    const { data: insertedCategory, error: categoryError } = await adminClient
      .from("categorias_metodos_trabajo")
      .insert({ freelancer_id: freelancerId, etiqueta: category.label, posicion: index })
      .select()
      .single();

    if (categoryError) return { error: categoryError.message };
    if (category.items.length === 0) continue;

    const { error: itemsError } = await adminClient.from("items_metodos_trabajo").insert(
      category.items.map((valor, itemIndex) => ({
        categoria_id: insertedCategory.id,
        valor,
        posicion: itemIndex,
      })),
    );
    if (itemsError) return { error: itemsError.message };
  }

  return {};
}
