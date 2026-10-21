"use client";

import { useState } from "react";
import { Eye, MoreVertical, Paperclip } from "lucide-react";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { ReceivedSolicitud } from "@/types/receivedSolicitud";
import { solicitudCategoryConfig } from "@/modules/panel/solicitudCategoryConfig";
import type { Solicitud } from "@/types/solicitud";
import { SolicitudDetailsModal } from "@/modules/panel/freelancer/solicitudes/SolicitudDetailsModal";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";

const statusConfig = {
  nueva: { label: "Nueva", className: "!bg-emerald-50 !text-emerald-600" },
  sin_responder: { label: "Sin responder", className: "!bg-amber-50 !text-amber-600" },
  respondida: { label: "Aceptada", className: "!bg-indigo-50 !text-indigo-600" },
  archivada: { label: "Archivada", className: "!bg-slate-100 !text-slate-500" },
} satisfies Record<Solicitud["status"], { label: string; className: string }>;

export function SolicitudCard({
  solicitud,
  onDecision,
}: {
  solicitud: Solicitud;
  onDecision: (updated: ReceivedSolicitud) => void;
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const category = solicitudCategoryConfig[solicitud.category];
  const status = statusConfig[solicitud.status];
  const CategoryIcon = category.icon;

  return (
    <>
      <article className="group border-b border-slate-100 px-4 py-5 transition last:border-b-0 hover:bg-slate-50/60 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${category.className}`}>
            <CategoryIcon className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{solicitud.titulo}</h3>
                  <Badge className={`${status.className} whitespace-nowrap text-[11px] font-medium`}>
                    {status.label}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {solicitud.clienteName} <span className="mx-1 text-slate-300">•</span> {solicitud.planName}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Más opciones para ${solicitud.titulo}`}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">{solicitud.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {solicitud.desiredDate && (
                <Badge className="!bg-rose-50 !text-rose-600">
                  Fecha solicitada: {formatSolicitudDate(solicitud.desiredDate)}
                </Badge>
              )}
              {solicitud.planProjects && (
                <Badge className="!bg-indigo-50 !text-indigo-600">Proyectos activos: {solicitud.planProjects}</Badge>
              )}
              {solicitud.revisiones > 0 && (
                <Badge className="!bg-emerald-50 !text-emerald-600">
                  {solicitud.revisiones} {solicitud.revisiones === 1 ? "revisión" : "revisiones"}
                </Badge>
              )}
              <Badge className={category.className}>{solicitud.categoryLabel ?? category.label}</Badge>
              {solicitud.attachments.length > 0 && (
                <Badge className="!bg-slate-100 flex items-center gap-1 !text-slate-500">
                  <Paperclip className="h-3 w-3" />
                  {solicitud.attachments.length} {solicitud.attachments.length === 1 ? "anexo" : "anexos"}
                </Badge>
              )}
            </div>

            <p className="mt-4 text-[11px] text-slate-400">Enviado: {solicitud.enviado}</p>
          </div>

          <div className="flex shrink-0 flex-row items-center gap-4 border-t border-slate-100 pt-4 lg:w-44 lg:flex-col lg:items-stretch lg:border-t-0 lg:pt-0">
            <div className="flex-1 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 lg:flex-none">
              <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-500">Plan contratado</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{solicitud.planName}</p>
              {solicitud.desiredDate ? (
                <p className="mt-1 text-[11px] text-slate-500">Fecha solicitada: {formatSolicitudDate(solicitud.desiredDate)}</p>
              ) : (
                solicitud.planProjects && (
                  <p className="mt-1 text-[11px] text-slate-500">Proyectos activos: {solicitud.planProjects}</p>
                )
              )}
            </div>
            <div className="flex flex-row gap-2">
              <Button
                variant="outline-neutral"
                aria-label="Ver detalles"
                title="Ver detalles"
                className="!min-w-0 h-8 w-8 !px-0"
                onClick={() => setShowDetailsModal(true)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </article>

      <SolicitudDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        solicitud={solicitud}
        onDecision={onDecision}
      />
    </>
  );
}
