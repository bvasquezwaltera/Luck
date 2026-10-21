import { CalendarDays } from "lucide-react";
import { dueDateHint, type DeliveryViewer } from "@/modules/panel/deliveryStatus";
import { SideCard } from "@/modules/panel/SolicitudDetailsLayout";
import { getInitials } from "@/lib/getInitials";
import type { DeliveryModule } from "@/types/deliveryModule";

// Columna derecha del detalle de una entrega: con quién es, el plazo, el progreso y las revisiones del plan.
export function DeliveryDetailsSide({
  module,
  viewer,
  revisionsLimit,
  revisionsUsed,
}: {
  module: DeliveryModule;
  viewer: DeliveryViewer;
  revisionsLimit: number | null;
  revisionsUsed: number;
}) {
  const counterpart = viewer === "freelancer" ? module.clientName : module.freelancerName;
  const done = module.apiStatus === "aprobada";
  const hint = dueDateHint(module.dueDateValue);
  const revisionsLeft = revisionsLimit === null ? null : Math.max(0, revisionsLimit - revisionsUsed);

  return (
    <>
      <SideCard label={viewer === "freelancer" ? "Cliente" : "Freelancer"}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {getInitials(counterpart)}
          </div>
          <p className="min-w-0 text-sm font-semibold text-slate-900">{counterpart}</p>
        </div>
      </SideCard>

      <SideCard label="Fecha límite">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-500 ring-1 ring-inset ring-slate-200">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{module.dueDate}</p>
            {!done && (
              <p className={`text-xs font-medium ${hint.overdue ? "text-red-600" : "text-slate-500"}`}>{hint.text}</p>
            )}
          </div>
        </div>
      </SideCard>

      <SideCard label="Progreso">
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold tracking-tight text-slate-900">{module.progress}%</p>
          <p className="text-xs text-slate-500">{done ? "Completada" : "Del último avance"}</p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div
            className={`h-2 rounded-full ${done ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-600 to-violet-500"}`}
            style={{ width: `${module.progress}%` }}
          />
        </div>
      </SideCard>

      <SideCard label="Revisiones del plan">
        {revisionsLimit === null ? (
          <p className="text-sm font-medium text-slate-700">Sin límite</p>
        ) : viewer === "client" ? (
          <>
            <p className="text-sm font-semibold text-slate-900">
              Te {revisionsLeft === 1 ? "queda" : "quedan"} {revisionsLeft} de {revisionsLimit}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Cada pedido de cambios usa una.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900">
              {revisionsUsed} de {revisionsLimit} usadas por el cliente
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Al agotarlas, el cliente solo puede aprobar.</p>
          </>
        )}
      </SideCard>
    </>
  );
}
