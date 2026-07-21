import type { SubscriptionPlan } from "@/types/subscriptionPlan";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";

const TIER_NAME_CLASSES: Record<SubscriptionPlan["tier"], string> = {
  basico: "text-emerald-600",
  estandar: "text-indigo-600",
  premium: "text-orange-600",
};

const TIER_BUTTON_CLASSES: Record<SubscriptionPlan["tier"], string> = {
  basico: "!border-emerald-600 !text-emerald-600 hover:!bg-emerald-50",
  estandar: "",
  premium: "!bg-orange-500 hover:!bg-orange-600",
};

export function SubscriptionPlanCard({ plan }: { plan: SubscriptionPlan }) {
  const features = [
    plan.activeProjects,
    plan.revisions,
    plan.support,
    plan.deliveryTime,
  ];

  return (
    <Card className="flex h-full flex-col gap-4">
      <div>
        <p className={`text-base font-bold ${TIER_NAME_CLASSES[plan.tier]}`}>{plan.name}</p>
        <p className="mt-1 text-xs text-gray-500">{plan.description}</p>
      </div>

      <p className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
        <span className="text-xs text-gray-500">/mes</span>
      </p>

      <ul className="flex flex-1 flex-col">
        {features.map((feature) => (
          <li
            key={feature}
            className="border-t border-gray-100 py-2.5 text-xs text-gray-600 first:border-t-0"
          >
            {feature}
          </li>
        ))}
      </ul>

      <Button
        href="/login"
        variant={plan.tier === "basico" ? "outline" : "primary"}
        className={`w-full min-w-0 ${TIER_BUTTON_CLASSES[plan.tier]}`}
      >
        Elegir {plan.name}
      </Button>
    </Card>
  );
}
