"use client";

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { DeliveryFreelancerAdvance } from "@/modules/panel/freelancer/deliveries/DeliveryFreelancerAdvance";
import { statusConfig } from "@/modules/panel/freelancer/deliveries/deliveryStatusConfig";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";

export function DeliveryModuleDetailsModal({
  module,
  onClose,
}: {
  module: DeliveryModule | null;
  onClose: () => void;
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Entrega activa</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{module.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {module.requestTitle} <span className="mx-1 text-slate-300">·</span> {module.clientName}
                </p>
                <Badge className={`${status.badgeClassName} mt-2 inline-flex items-center gap-1.5`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {module.status}
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
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {module.description}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-900">Objetivos</h4>
              </div>
              <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {module.objectives.join(". ")}.
              </p>
            </div>

            <DeliveryFreelancerAdvance initialHistory={module.advanceHistory} />

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-900">Respuesta del cliente</h4>
              </div>

              {module.clientFeedback && module.clientFeedback.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {module.clientFeedback.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          className={
                            entry.type === "approved"
                              ? "!bg-emerald-50 !text-emerald-600 inline-flex items-center gap-1.5"
                              : "!bg-amber-50 !text-amber-600 inline-flex items-center gap-1.5"
                          }
                        >
                          {entry.type === "approved" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                          {entry.type === "approved" ? "Entrega aprobada" : "Cambios solicitados"}
                        </Badge>
                        <span className="text-[11px] text-slate-400">{entry.timestamp}</span>
                      </div>
                      {entry.comment && <p className="mt-2 text-sm leading-6 text-slate-700">{entry.comment}</p>}
                      {entry.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {entry.attachments.map((attachment) => (
                            <span
                              key={attachment.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
                            >
                              {attachment.url ? <LinkIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                              {attachment.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  El cliente aún no respondió a esta entrega.
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-900">Próximo avance</h4>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">{module.nextMilestone}</p>
                <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-blue-500">Fecha estimada</p>
                    <p className="text-sm font-bold text-blue-700">{module.dueDate}</p>
                  </div>
                </div>
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
