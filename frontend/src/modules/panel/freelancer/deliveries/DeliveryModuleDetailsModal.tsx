"use client";

import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { DeliveryThread } from "@/modules/panel/DeliveryThread";
import { DeliveryFreelancerAdvance } from "@/modules/panel/freelancer/deliveries/DeliveryFreelancerAdvance";
import { statusConfig } from "@/modules/panel/freelancer/deliveries/deliveryStatusConfig";
import { deleteDelivery } from "@/lib/api/client/deliveries";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";

// Estado fino del servidor, más claro que los tres del diseño.
const DETAIL_LABEL = {
  pendiente: "Nueva",
  en_revision: "En revisión del cliente",
  cambios_solicitados: "Cambios solicitados",
  aprobada: "Culminado",
} as const;

export function DeliveryModuleDetailsModal({
  module,
  onClose,
  onChanged,
}: {
  module: DeliveryModule | null;
  onClose: () => void;
  onChanged: (contracts: ContractDeliveries[]) => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const status = module ? statusConfig[module.status] : null;
  const StatusIcon = status?.icon;

  async function handleDelete(current: DeliveryModule) {
    setIsDeleting(true);
    setDeleteError("");
    const result = await deleteDelivery(current.id);
    setIsDeleting(false);

    if (!result.contracts) {
      setDeleteError(result.error ?? "No se pudo eliminar la entrega.");
      return;
    }
    onClose();
    onChanged(result.contracts);
  }

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
                  {module.requestTitle} <span className="mx-1 text-slate-300">·</span> {module.clientName}
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

            <DeliveryFreelancerAdvance key={`${module.id}-${module.apiStatus}`} module={module} onChanged={onChanged} />

            <DeliveryThread module={module} viewer="freelancer" />

            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-500">Fecha límite</p>
                <p className="text-sm font-bold text-blue-700">{module.dueDate}</p>
              </div>
            </div>

            {module.apiStatus === "pendiente" && (
              <div className="rounded-xl border border-slate-200 p-4">
                {confirmingDelete ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-medium text-red-600">¿Eliminar esta entrega?</p>
                    <Button
                      variant="outline-neutral"
                      className="!min-w-0 !px-4 !border-red-300 !text-red-600 hover:!bg-red-50"
                      onClick={() => handleDelete(module)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                    </Button>
                    <Button
                      variant="outline-neutral"
                      className="!min-w-0 !px-4"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={isDeleting}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline-neutral"
                    className="!min-w-0 gap-1.5 !px-4 hover:!border-red-300 hover:!text-red-600"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar entrega
                  </Button>
                )}
                {deleteError && <p className="mt-2 text-xs text-red-500">{deleteError}</p>}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
            <Button variant="primary" onClick={onClose} className="flex-1">Cerrar</Button>
          </div>
        </>
      ) : null}
    </Modal>
  );
}
