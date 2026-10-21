"use client";

import { useState } from "react";
import { CalendarDays, ClipboardList, CreditCard, Clock, FileText, Hash, Hourglass, Paperclip, ShieldCheck, Sparkles, User, X } from "lucide-react";
import { SolicitudAttachmentList } from "@/modules/panel/SolicitudAttachmentList";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { ClientSolicitud, ClientSolicitudStatus } from "@/types/clientSolicitud";

export const CLIENT_STATUS_CONFIG: Record<ClientSolicitudStatus, { label: string; className: string }> = {
  enviada: { label: "Enviada", className: "!bg-indigo-50 !text-indigo-600" },
  aceptada: { label: "Aceptada", className: "!bg-emerald-50 !text-emerald-600" },
  rechazada: { label: "Rechazada", className: "!bg-red-50 !text-red-600" },
  cancelada: { label: "Cancelada", className: "!bg-slate-100 !text-slate-500" },
  expirada: { label: "Expirada", className: "!bg-amber-50 !text-amber-600" },
};

const STATUS_NOTE: Record<ClientSolicitudStatus, { title: string; text: string; box: string; iconBox: string; icon: string }> = {
  enviada: {
    title: "Esperando respuesta",
    text: "El freelancer revisará tu solicitud. Verás aquí su respuesta apenas la envíe.",
    box: "bg-blue-50",
    iconBox: "bg-blue-100",
    icon: "text-blue-600",
  },
  aceptada: {
    title: "Solicitud aceptada",
    text: "El freelancer aceptó tu solicitud. Falta tu pago para activar el contrato.",
    box: "bg-emerald-50",
    iconBox: "bg-emerald-100",
    icon: "text-emerald-600",
  },
  rechazada: {
    title: "Solicitud rechazada",
    text: "El freelancer no pudo aceptar esta solicitud. Puedes elegir otro plan o a otro freelancer.",
    box: "bg-red-50",
    iconBox: "bg-red-100",
    icon: "text-red-600",
  },
  cancelada: {
    title: "Solicitud cancelada",
    text: "Esta solicitud fue cancelada.",
    box: "bg-slate-100",
    iconBox: "bg-slate-200",
    icon: "text-slate-600",
  },
  expirada: {
    title: "Solicitud expirada",
    text: "Esta solicitud venció sin respuesta.",
    box: "bg-amber-50",
    iconBox: "bg-amber-100",
    icon: "text-amber-600",
  },
};

// El botón de pagar solo se habilita con la solicitud aceptada; en los demás estados explica por qué no.
export function payHint(status: ClientSolicitudStatus): string {
  if (status === "enviada") return "Disponible cuando el freelancer acepte tu solicitud";
  if (status === "aceptada") return "Pagar para activar el contrato";
  return "Esta solicitud no se puede pagar";
}

export function ClientSolicitudDetailsModal({
  open,
  onClose,
  solicitud,
}: {
  open: boolean;
  onClose: () => void;
  solicitud: ClientSolicitud;
}) {
  const [payNotice, setPayNotice] = useState(false);
  const status = CLIENT_STATUS_CONFIG[solicitud.status];
  const note = STATUS_NOTE[solicitud.status];
  const revisions = Number.parseInt(solicitud.plan.revisions, 10) || 0;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
        <div className="min-w-0 pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{solicitud.title}</h2>
            <Badge className={`${status.className} whitespace-nowrap text-[11px] font-medium`}>{status.label}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {solicitud.id.slice(0, 8)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Enviada el {formatSolicitudDate(solicitud.createdAt)}
            </span>
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

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Plan solicitado</p>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <p className="text-lg font-bold text-slate-900">Plan {solicitud.plan.name}</p>
              <p className="text-sm font-bold text-slate-900">
                ${solicitud.plan.price}
                <span className="text-xs font-normal text-slate-500"> /mes</span>
              </p>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {solicitud.plan.activeProjects ? `Proyectos activos: ${solicitud.plan.activeProjects}. ` : ""}
              {revisions > 0 ? `${revisions} ${revisions === 1 ? "revisión incluida" : "revisiones incluidas"}.` : ""}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Freelancer</p>
            </div>
            <div className="mt-2 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {solicitud.freelancer.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{solicitud.freelancer.name}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {solicitud.freelancer.specialty || "Freelancer"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Título</h3>
            </div>
            <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-800">
              {solicitud.title}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Descripción</h3>
            </div>
            <p className="whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {solicitud.description}
            </p>
          </div>

          {solicitud.characteristics.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">Características</h3>
              </div>
              <ul className="list-disc space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-4 pl-9 text-sm leading-6 text-slate-700">
                {solicitud.characteristics.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {solicitud.attachments.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Anexos e inspiración</h3>
            </div>
            <SolicitudAttachmentList solicitudId={solicitud.id} attachments={solicitud.attachments} layout="rows" />
          </section>
        )}

        <div className="space-y-3 border-t border-slate-200 pt-5">
          <div className={`flex items-start gap-3 rounded-xl p-4 ${note.box}`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${note.iconBox}`}>
              <Hourglass className={`h-4 w-4 ${note.icon}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{note.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600">{note.text}</p>
              {solicitud.status === "rechazada" && solicitud.rejectionReason && (
                <p className="mt-2 text-xs font-medium text-red-700">Motivo: {solicitud.rejectionReason}</p>
              )}
            </div>
          </div>

          {solicitud.desiredDate && (
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <CalendarDays className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Fecha deseada</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-600">{formatSolicitudDate(solicitud.desiredDate)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
        {payNotice && <p className="mb-3 text-xs text-amber-600">El pago se activará pronto.</p>}
        <div className="flex gap-3">
          <Button variant="outline-neutral" onClick={onClose} className="flex-1">
            Cerrar
          </Button>
          <Button
            onClick={() => setPayNotice(true)}
            disabled={solicitud.status !== "aceptada"}
            title={payHint(solicitud.status)}
            className="flex-1 gap-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Pagar ${solicitud.plan.price}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
