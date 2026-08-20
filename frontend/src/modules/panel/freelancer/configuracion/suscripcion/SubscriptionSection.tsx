"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { getSubscriptionPlans, saveSubscriptionPlans } from "@/lib/api/client/subscriptionPlans";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";

const TIER_NAME_CLASSES: Record<SubscriptionPlan["tier"], string> = {
  basico: "text-emerald-600",
  estandar: "text-indigo-600",
  premium: "text-orange-600",
};

export function SubscriptionSection({ freelancerId }: { freelancerId: string }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getSubscriptionPlans(freelancerId).then((data) => {
      setPlans(data);
      setIsLoading(false);
    });
  }, [freelancerId]);

  function updatePlan(planId: string, changes: Partial<SubscriptionPlan>) {
    setPlans((current) => current.map((plan) => (plan.id === planId ? { ...plan, ...changes } : plan)));
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);

    const result = await saveSubscriptionPlans(freelancerId, plans);

    setIsSaving(false);
    setSaveMessage(
      result.error
        ? { type: "error", text: result.error }
        : { type: "success", text: "Cambios guardados." },
    );

    if (!result.error) {
      const data = await getSubscriptionPlans(freelancerId);
      setPlans(data);
    }
  }

  if (isLoading) {
    return <p className="text-xs text-gray-500">Cargando planes...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`space-y-3 ${!plan.active ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-semibold ${TIER_NAME_CLASSES[plan.tier]}`}>{plan.name}</h4>

              <button
                type="button"
                role="switch"
                aria-checked={plan.active}
                aria-label={plan.active ? "Desactivar plan" : "Activar plan"}
                onClick={() => updatePlan(plan.id, { active: !plan.active })}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  plan.active ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    plan.active ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-gray-500">
              {plan.active ? "Visible en tu perfil público" : "Oculto — no aparece en tu perfil público"}
            </p>

            <Textarea
              label="Descripción"
              value={plan.description}
              onChange={(event) => updatePlan(plan.id, { description: event.target.value })}
              rows={2}
              disabled={!plan.active}
              className="disabled:cursor-not-allowed disabled:bg-gray-50"
            />
            <Input
              label="Precio (USD/mes)"
              type="number"
              min={0}
              value={plan.price}
              onChange={(event) => updatePlan(plan.id, { price: Number(event.target.value) })}
              disabled={!plan.active}
            />
            <Input
              label="Proyectos activos"
              value={plan.activeProjects}
              onChange={(event) => updatePlan(plan.id, { activeProjects: event.target.value })}
              disabled={!plan.active}
            />
            <Input
              label="Revisiones"
              value={plan.revisions}
              onChange={(event) => updatePlan(plan.id, { revisions: event.target.value })}
              disabled={!plan.active}
            />

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-900">Características</p>

              {plan.features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2">
                  <Input
                    id={`${feature.id}-label`}
                    label=""
                    hideLabel
                    className="flex-1"
                    placeholder="Etiqueta"
                    value={feature.label}
                    disabled={!plan.active}
                    onChange={(event) =>
                      updatePlan(plan.id, {
                        features: plan.features.map((value) =>
                          value.id === feature.id ? { ...value, label: event.target.value } : value,
                        ),
                      })
                    }
                  />
                  <Input
                    id={`${feature.id}-value`}
                    label=""
                    hideLabel
                    className="flex-1"
                    placeholder="Valor"
                    value={feature.value}
                    disabled={!plan.active}
                    onChange={(event) =>
                      updatePlan(plan.id, {
                        features: plan.features.map((value) =>
                          value.id === feature.id ? { ...value, value: event.target.value } : value,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    aria-label="Quitar característica"
                    disabled={!plan.active}
                    onClick={() =>
                      updatePlan(plan.id, {
                        features: plan.features.filter((value) => value.id !== feature.id),
                      })
                    }
                    className="shrink-0 rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <Button
                variant="outline-neutral"
                className="!min-w-0 !px-3 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!plan.active}
                onClick={() =>
                  updatePlan(plan.id, {
                    features: [...plan.features, { id: `nuevo-${crypto.randomUUID()}`, label: "", value: "" }],
                  })
                }
              >
                + Agregar característica
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        {saveMessage && (
          <p className={`text-xs ${saveMessage.type === "error" ? "text-red-500" : "text-emerald-600"}`}>
            {saveMessage.text}
          </p>
        )}
        <Button
          variant="primary"
          className="!min-w-0 !px-6 bg-indigo-600 hover:bg-indigo-700"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
