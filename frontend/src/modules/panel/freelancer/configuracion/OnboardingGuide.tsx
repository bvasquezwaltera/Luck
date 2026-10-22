"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, PartyPopper } from "lucide-react";
import { getSubscriptionPlans } from "@/lib/api/client/subscriptionPlans";
import { freelancerSteps, type OnboardingStep } from "@/lib/onboardingSteps";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";
import { Button } from "@/ui/Button";

// Los pasos para empezar a recibir solicitudes, en una barra delgada: muestra lo que falta y el siguiente paso, y los
// tres pasos completos se despliegan solo si la persona quiere verlos. Se marcan solos al guardar.
export function OnboardingGuide({
  freelancerId,
  savedProfile,
  refreshKey,
  onGo,
  onFinish,
}: {
  freelancerId: string;
  savedProfile: Pick<FreelancerProfile, "specialty" | "category" | "bio" | "skills">;
  refreshKey: string; // cambia al cambiar de pestaña: los planes se guardan en otra pantalla y hay que volver a mirarlos
  onGo: (step: OnboardingStep) => void;
  onFinish: () => void;
}) {
  const [plans, setPlans] = useState<SubscriptionPlan[] | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    getSubscriptionPlans(freelancerId)
      .then((result) => active && setPlans(Array.isArray(result) ? result : []))
      .catch(() => active && setPlans([]));
    return () => {
      active = false;
    };
  }, [freelancerId, refreshKey]);

  const steps = useMemo(() => freelancerSteps(savedProfile, plans), [savedProfile, plans]);
  const doneCount = steps.filter((step) => step.done).length;
  const next = steps.find((step) => !step.done);

  if (!next) {
    return (
      <section className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600">
          <PartyPopper className="h-4 w-4" />
        </span>
        <p className="min-w-0 flex-1 text-sm text-emerald-900">
          <span className="font-bold">¡Listo! Tu perfil está completo.</span>{" "}
          <span className="text-emerald-800">Los clientes ya pueden enviarte solicitudes.</span>
        </p>
        <Button variant="primary" className="!min-w-0 shrink-0 !px-4 !py-1.5" onClick={onFinish}>
          Finalizar
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/60 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 text-xs font-bold text-indigo-700">
            {doneCount} de {steps.length}
          </span>
          <div className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-white sm:block" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount}>
            <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
          </div>
          <p className="min-w-0 truncate text-sm text-slate-700">
            <span className="hidden text-slate-500 sm:inline">Para recibir solicitudes: </span>
            <span className="font-semibold text-slate-900">{next.label}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-800"
          >
            Ver pasos
            <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
          </button>
          <Button variant="primary" className="!min-w-0 gap-1 !px-3 !py-1.5" onClick={() => onGo(next)}>
            Ir <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-indigo-100 pt-3">
          <ol className="space-y-1.5">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    step.done ? "bg-emerald-500 text-white" : step.id === next.id ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step.done ? <Check className="h-3.5 w-3.5" aria-label="Hecho" /> : index + 1}
                </span>
                <p className="min-w-0 flex-1 text-sm">
                  <span className={step.done ? "font-medium text-slate-400 line-through" : "font-semibold text-slate-900"}>{step.label}</span>
                  {!step.done && <span className="text-slate-500"> · {step.description}</span>}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>Cada paso se marca cuando guardas los cambios.</span>
            <button type="button" onClick={onFinish} className="font-medium transition hover:text-slate-600">
              Omitir guía
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
