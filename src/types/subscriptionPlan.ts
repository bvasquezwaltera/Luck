export type PlanTier = "basico" | "estandar" | "premium";

export interface SubscriptionPlanFeature {
  id: string;
  label: string;
  value: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: PlanTier;
  description: string;
  price: number;
  activeProjects: string;
  revisions: string;
  features: SubscriptionPlanFeature[];
  active: boolean;
}
