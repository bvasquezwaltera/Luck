import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";

export async function getSubscriptionPlans(freelancerId: string): Promise<SubscriptionPlan[]> {
  const response = await apiFetchServer(`/api/subscription-plans/${freelancerId}`);
  const { plans } = (await response.json()) as { plans: SubscriptionPlan[] };
  return plans;
}
