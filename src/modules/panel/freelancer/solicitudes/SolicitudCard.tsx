"use client";

import { useState } from "react";
import {
  Building2,
  Code2,
  Megaphone,
  MoreVertical,
  Palette,
  Paperclip,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Solicitud, SolicitudCategory } from "@/types/solicitud";
import { SolicitudDetailsModal } from "@/modules/panel/freelancer/solicitudes/SolicitudDetailsModal";
import { RespondSolicitudModal } from "@/modules/panel/freelancer/solicitudes/RespondSolicitudModal";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";

const categoryConfig: Record<
  SolicitudCategory,
  { icon: LucideIcon; label: string; className: string }
> = {
  desarrollo: { icon: Code2, label: "Desarrollo", className: "bg-indigo-100 text-indigo-600" },
  movil: { icon: Smartphone, label: "Móvil", className: "bg-emerald-100 text-emerald-600" },
  diseno: { icon: Palette, label: "Diseño", className: "bg-violet-100 text-violet-600" },
  marketing: { icon: Megaphone, label: "Marketing", className: "bg-amber-100 text-amber-600" },
  arquitectura: { icon: Building2, label: "Arquitectura", className: "bg-sky-100 text-sky-600" },
  hogar: { icon: Building2, label: "Hogar", className: "bg-slate-100 text-slate-700" },
  restaurantes: { icon: Building2, label: "Restaurantes", className: "bg-rose-100 text-rose-600" },
  moda: { icon: Palette, label: "Moda", className: "bg-pink-100 text-pink-600" },
  reposteria: { icon: Palette, label: "Repostería", className: "bg-amber-50 text-amber-600" },
  servicios_generales: { icon: Building2, label: "Servicios", className: "bg-slate-50 text-slate-600" },
};

const statusConfig = {
  nueva: { label: "Nueva", className: "bg-emerald-50 text-emerald-600" },
  sin_responder: { label: "Sin responder", className: "bg-amber-50 text-amber-600" },
  respondida: { label: "Respondida", className: "bg-indigo-50 text-indigo-600" },
  archivada: { label: "Archivada", className: "bg-slate-100 text-slate-500" },
} satisfies Record<Solicitud["status"], { label: string; className: string }>;

export function SolicitudCard({ solicitud }: { solicitud: Solicitud }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const category = categoryConfig[solicitud.category];
  const status = statusConfig[solicitud.status];
  const CategoryIcon = category.icon;
  const canRespond = solicitud.status !== "respondida" && solicitud.status !== "archivada";

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
              {solicitud.desiredDate ? (
                <span className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                  Fecha solicitada: {new Date(solicitud.desiredDate).toLocaleDateString()}
                </span>
              ) : (
                <span className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                  {solicitud.requestedDeliveries} {solicitud.requestedDeliveries === 1 ? "entrega" : "entregas"}
                </span>
              )}
              <span className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                {solicitud.revisiones} {solicitud.revisiones === 1 ? "revisión" : "revisiones"}
              </span>
              <span className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                {category.label}
              </span>
              {solicitud.attachments.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                  <Paperclip className="h-3 w-3" />
                  {solicitud.attachments.length} {solicitud.attachments.length === 1 ? "anexo" : "anexos"}
                </span>
              )}
            </div>
 
            <p className="mt-4 text-[11px] text-slate-400">Enviado: {solicitud.enviado}</p>
          </div>

          <div className="flex shrink-0 flex-row items-center gap-4 border-t border-slate-100 pt-4 lg:w-44 lg:flex-col lg:items-stretch lg:border-t-0 lg:pt-0">
            <div className="flex-1 lg:flex-none">
              <p className="text-[11px] text-slate-400">Plan contratado</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{solicitud.planName}</p>
              {solicitud.desiredDate ? (
                <p className="mt-1 text-[11px] text-slate-500">Fecha solicitada: {new Date(solicitud.desiredDate).toLocaleDateString()}</p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500">{solicitud.requestedDeliveries} entregas solicitadas</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button
                variant="outline-neutral"
                className="h-8 px-3 text-[11px] lg:w-full"
                onClick={() => setShowDetailsModal(true)}
              >
                Ver detalles
              </Button>
              {canRespond ? (
                <Button className="h-8 px-3 text-[11px] lg:w-full" onClick={() => setShowRespondModal(true)}>
                  Responder
                </Button>
              ) : (
                <Button variant="outline-neutral" className="h-8 px-3 text-[11px] lg:w-full">
                  Ver conversación
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>

      <SolicitudDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        solicitud={solicitud}
        onRespond={() => setShowRespondModal(true)}
      />
      <RespondSolicitudModal
        open={showRespondModal}
        onClose={() => setShowRespondModal(false)}
        solicitud={solicitud}
      />
    </>
  );
}
