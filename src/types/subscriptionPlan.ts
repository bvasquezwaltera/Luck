export type PlanTier = "basico" | "estandar" | "premium";

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: PlanTier;
  description: string;
  price: number;
  activeProjects: string;
  revisions: string;
  support: string;
  deliveryTime: string;
}
