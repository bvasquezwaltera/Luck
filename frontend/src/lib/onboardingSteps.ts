import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";

export type OnboardingState = "pendiente" | "bienvenida_vista" | "completado";
export type OnboardingTab = "perfil" | "suscripcion";

export interface OnboardingStep {
  id: "info" | "skills" | "plan";
  label: string;
  description: string;
  done: boolean;
  tab: OnboardingTab; // a qué pestaña de Configuración lleva
}

export const MIN_BIO_LENGTH = 20;
export const MIN_SKILLS = 3;

// Los pasos para que un freelancer pueda recibir solicitudes. Se calculan con lo ya guardado (no con lo que está a
// medio escribir): un paso se marca cuando se guarda. `plans` es null mientras se cargan.
export function freelancerSteps(
  profile: Pick<FreelancerProfile, "specialty" | "category" | "bio" | "skills">,
  plans: SubscriptionPlan[] | null,
): OnboardingStep[] {
  const skills = profile.skills.filter((skill) => skill.trim()).length;
  const hasPlan = (plans ?? []).some((plan) => plan.active && plan.price > 0);

  return [
    {
      id: "info",
      label: "Completa tu información",
      description: "Tu especialidad, tu categoría y una breve presentación en «Sobre mí».",
      done: Boolean(profile.specialty.trim() && profile.category.trim() && profile.bio.trim().length >= MIN_BIO_LENGTH),
      tab: "perfil",
    },
    {
      id: "skills",
      label: "Agrega tus habilidades",
      description: `Al menos ${MIN_SKILLS}, para que los clientes sepan qué haces.`,
      done: skills >= MIN_SKILLS,
      tab: "perfil",
    },
    {
      id: "plan",
      label: "Activa un plan",
      description: "Con un precio, para que los clientes puedan contratarte.",
      done: hasPlan,
      tab: "suscripcion",
    },
  ];
}
