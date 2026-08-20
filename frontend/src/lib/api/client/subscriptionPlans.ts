import { apiFetch } from "@/lib/api/httpClient";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";

export async function getSubscriptionPlans(freelancerId: string): Promise<SubscriptionPlan[]> {
  const response = await apiFetch(`/api/subscription-plans/${freelancerId}`);
  const { plans } = await response.json();
  return plans;
}

export async function saveSubscriptionPlans(
  freelancerId: string,
  plans: SubscriptionPlan[],
): Promise<{ error?: string }> {
  const response = await apiFetch(`/api/subscription-plans/${freelancerId}`, {
    method: "POST",
    body: JSON.stringify(plans),
  });
  return response.json();
}
