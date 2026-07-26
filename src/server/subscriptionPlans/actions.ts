"use server";

import { supabase as adminClient } from "@/server/supabase/client";
import type { PlanTier, SubscriptionPlan } from "@/types/subscriptionPlan";

const DEFAULT_PLAN_NAMES: Record<PlanTier, string> = {
  basico: "Básico",
  estandar: "Estándar",
  premium: "Premium",
};

const TIER_ORDER: PlanTier[] = ["basico", "estandar", "premium"];

export async function getSubscriptionPlans(freelancerId: string): Promise<SubscriptionPlan[]> {
  const { data: planes } = await adminClient
    .from("planes_suscripcion")
    .select("*")
    .eq("freelancer_id", freelancerId);

  const planIds = (planes ?? []).map((plan) => plan.id);
  const { data: caracteristicas } =
    planIds.length > 0
      ? await adminClient.from("caracteristicas_plan").select("*").in("plan_id", planIds).order("posicion")
      : { data: [] as { plan_id: string; id: string; etiqueta: string; valor: string }[] };

  return TIER_ORDER.map((tier) => {
    const plan = (planes ?? []).find((value) => value.nivel === tier);

    if (!plan) {
      return {
        id: `nuevo-${tier}`,
        name: DEFAULT_PLAN_NAMES[tier],
        tier,
        description: "",
        price: 0,
        activeProjects: "",
        revisions: "",
        features: [],
        active: true,
      };
    }

    return {
      id: plan.id,
      name: plan.nombre,
      tier: plan.nivel,
      description: plan.descripcion,
      price: Number(plan.precio),
      activeProjects: plan.proyectos_activos,
      revisions: plan.revisiones,
      active: plan.activo,
      features: (caracteristicas ?? [])
        .filter((feature) => feature.plan_id === plan.id)
        .map((feature) => ({ id: feature.id, label: feature.etiqueta, value: feature.valor })),
    };
  });
}

export async function saveSubscriptionPlans(
  freelancerId: string,
  plans: SubscriptionPlan[],
): Promise<{ error?: string }> {
  for (const plan of plans) {
    const { data: savedPlan, error: planError } = await adminClient
      .from("planes_suscripcion")
      .upsert(
        {
          freelancer_id: freelancerId,
          nivel: plan.tier,
          nombre: plan.name,
          descripcion: plan.description,
          precio: plan.price,
          proyectos_activos: plan.activeProjects,
          revisiones: plan.revisions,
          activo: plan.active,
        },
        { onConflict: "freelancer_id,nivel" },
      )
      .select()
      .single();

    if (planError) return { error: planError.message };

    await adminClient.from("caracteristicas_plan").delete().eq("plan_id", savedPlan.id);
    if (plan.features.length > 0) {
      const { error: featuresError } = await adminClient.from("caracteristicas_plan").insert(
        plan.features.map((feature, index) => ({
          plan_id: savedPlan.id,
          etiqueta: feature.label,
          valor: feature.value,
          posicion: index,
        })),
      );
      if (featuresError) return { error: featuresError.message };
    }
  }

  return {};
}
