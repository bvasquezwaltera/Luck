"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  Link as LinkIcon,
  Lock,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { DeliveryClientFeedback } from "@/modules/panel/client/deliveries/DeliveryClientFeedback";
import { statusConfig } from "@/modules/panel/client/deliveries/deliveryStatusConfig";
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
                  {module.requestTitle} <span className="mx-1 text-slate-300">·</span> {module.freelancerName}
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

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-900">Avances del freelancer</h4>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  <Lock className="h-3 w-3" />
                  Solo lectura
                </span>
              </div>

              {module.advanceHistory && module.advanceHistory.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {module.advanceHistory.map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <span className="text-[11px] text-slate-400">{entry.timestamp}</span>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{entry.note}</p>
                      {entry.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {entry.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                {attachment.url ? <LinkIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                              </div>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-medium text-slate-700">{attachment.name}</span>
                                {attachment.size && (
                                  <span className="mt-0.5 block text-[11px] text-slate-400">{attachment.size}</span>
                                )}
                              </span>
                              <a
                                href={attachment.url ?? "#"}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Descargar ${attachment.name}`}
                                className="shrink-0 rounded-lg border border-indigo-200 p-1.5 text-indigo-600 transition hover:bg-indigo-50"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  El freelancer aún no registró un avance para esta entrega.
                </p>
              )}
            </div>

            <DeliveryClientFeedback moduleTitle={module.title} />

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
