import { ShieldCheck, CheckCircle2 } from "lucide-react";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";
import { SubscriptionPlanCard } from "@/modules/perfil/SubscriptionPlanCard";

export function SubscriptionsTab({ plans }: { plans: SubscriptionPlan[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Suscripciones y paquetes</h2>
        <p className="text-xs text-gray-500">
          Elige el paquete que mejor se adapte a tu proyecto
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <SubscriptionPlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs font-bold text-gray-900">Pago seguro con escrow</p>
            <p className="text-xs text-gray-500">
              Tu pago está protegido hasta que apruebes el trabajo.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs font-bold text-gray-900">100% satisfacción garantizada</p>
            <p className="text-xs text-gray-500">Si no estás satisfecho, te reembolsamos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
