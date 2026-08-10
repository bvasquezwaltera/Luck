"use client";

import { useState } from "react";
import { CalendarDays, Clock, ClipboardList, FileImage, FileText, Hash, Link, Paperclip, ShieldCheck, Sparkles, User, X } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import type { Solicitud } from "@/types/solicitud";

const statusConfig = {
  nueva: { label: "Nueva", className: "!bg-emerald-50 !text-emerald-600" },
  sin_responder: { label: "Sin responder", className: "!bg-amber-50 !text-amber-600" },
  respondida: { label: "Respondida", className: "!bg-indigo-50 !text-indigo-600" },
  archivada: { label: "Archivada", className: "!bg-slate-100 !text-slate-500" },
} satisfies Record<Solicitud["status"], { label: string; className: string }>;

const attachmentTypeConfig = {
  pdf: { icon: FileText, className: "bg-rose-100 text-rose-600" },
  image: { icon: FileImage, className: "bg-violet-100 text-violet-600" },
  link: { icon: Link, className: "bg-sky-100 text-sky-600" },
} satisfies Record<Solicitud["attachments"][number]["type"], { icon: typeof FileText; className: string }>;

function AttachmentIcon({ type }: { type: Solicitud["attachments"][number]["type"] }) {
  const { icon: Icon, className } = attachmentTypeConfig[type];
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

export function SolicitudDetailsModal({
  open,
  onClose,
  solicitud,
  onRespond,
}: {
  open: boolean;
  onClose: () => void;
  solicitud: Solicitud;
  onRespond: () => void;
}) {
  const [activeAttachment, setActiveAttachment] = useState<string | null>(null);
  const status = statusConfig[solicitud.status];
  const canRespond = solicitud.status !== "respondida" && solicitud.status !== "archivada";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
        <div className="min-w-0 pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{solicitud.titulo}</h2>
            <Badge className={`${status.className} whitespace-nowrap text-[11px] font-medium`}>{status.label}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {solicitud.id}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {solicitud.enviado}
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
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Plan que respalda la solicitud</p>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">{solicitud.planName}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">El alcance se coordina dentro de los beneficios de este plan.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cliente</p>
            </div>
            <div className="mt-2 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {solicitud.clienteInitials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{solicitud.clienteName}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">Puede contactarte después de tu respuesta.</p>
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
              {solicitud.titulo}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Descripción</h3>
            </div>
            <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {solicitud.description}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Características</h3>
            </div>
            <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {solicitud.characteristics.join(". ")}.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Anexos e inspiración</h3>
          </div>
          <div className="space-y-2">
            {solicitud.attachments.map((attachment) => {
              const isActive = activeAttachment === attachment.id;
              return (
                <button
                  type="button"
                  key={attachment.id}
                  onClick={() => setActiveAttachment(isActive ? null : attachment.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    isActive
                      ? "border-indigo-300 bg-indigo-50/60"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                  }`}
                >
                  <AttachmentIcon type={attachment.type} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-700">{attachment.name}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{attachment.size}</span>
                  </span>
                  <Badge className={isActive ? "!bg-indigo-600 !text-white" : "!bg-slate-100 !text-slate-600"}>
                    {isActive ? "Seleccionado" : "Ver"}
                  </Badge>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-3 border-t border-slate-200 pt-5">
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Plazo por definir</p>
              <p className="mt-0.5 text-xs leading-5 text-blue-700">Indica los días de cada entrega y la fecha final en tu respuesta.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">{solicitud.revisiones} {solicitud.revisiones === 1 ? "revisión incluida" : "revisiones incluidas"}</p>
              <p className="mt-0.5 text-xs leading-5 text-emerald-700">Considera este límite al organizar tus entregables.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
        <Button variant="outline-neutral" onClick={onClose} className="flex-1">Cerrar</Button>
        {canRespond && (
          <Button onClick={() => { onClose(); onRespond(); }} className="flex-1">
            Responder solicitud
          </Button>
        )}
      </div>
    </Modal>
  );
}
