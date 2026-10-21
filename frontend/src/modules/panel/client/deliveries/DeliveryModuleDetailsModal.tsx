"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { DeliveryThread } from "@/modules/panel/DeliveryThread";
import { DeliveryClientFeedback } from "@/modules/panel/client/deliveries/DeliveryClientFeedback";
import { statusConfig } from "@/modules/panel/client/deliveries/deliveryStatusConfig";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";

// Estado fino del servidor, visto desde el cliente.
const DETAIL_LABEL = {
  pendiente: "Nueva",
  en_revision: "Esperando tu revisión",
  cambios_solicitados: "Cambios solicitados",
  aprobada: "Culminado",
} as const;

export function DeliveryModuleDetailsModal({
  module,
  revisionsLimit,
  revisionsUsed,
  onClose,
  onChanged,
}: {
  module: DeliveryModule | null;
  revisionsLimit: number | null;
  revisionsUsed: number;
  onClose: () => void;
  onChanged: (contracts: ContractDeliveries[]) => void;
}) {
  const status = module ? statusConfig[module.status] : null;
  const StatusIcon = status?.icon;

  return (
    <Modal open={Boolean(module)} onClose={onClose}>
      {module && status && StatusIcon ? (
        <>
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex min-w-0 items-start gap-3 pr-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${status.iconClassName}`}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Entrega</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{module.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {module.requestTitle} <span className="mx-1 text-slate-300">·</span> {module.freelancerName}
                </p>
                <Badge className={`${status.badgeClassName} mt-2 inline-flex items-center gap-1.5`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {module.apiStatus ? DETAIL_LABEL[module.apiStatus] : module.status}
                </Badge>
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar detalles"
              onClick={onClose}
              className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-900">Título</h4>
              </div>
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-800">
                {module.title}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-900">Descripción</h4>
              </div>
              <p className="whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {module.description}
              </p>
            </div>

            {module.objectives.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-sm font-semibold text-slate-900">Objetivos</h4>
                </div>
                <ul className="list-disc space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-4 pl-9 text-sm leading-6 text-slate-700">
                  {module.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

            <DeliveryClientFeedback
              key={`${module.id}-${module.apiStatus}`}
              module={module}
              revisionsLimit={revisionsLimit}
              revisionsUsed={revisionsUsed}
              onChanged={onChanged}
            />

            <DeliveryThread module={module} viewer="client" />

            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-500">Fecha límite</p>
                <p className="text-sm font-bold text-blue-700">{module.dueDate}</p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
            <Button variant="primary" onClick={onClose} className="flex-1">Cerrar</Button>
          </div>
        </>
      ) : null}
    </Modal>
  );
}
