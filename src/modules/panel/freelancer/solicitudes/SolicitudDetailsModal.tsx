"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardList, FileImage, FileText, Link, Paperclip, User, X } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import type { Solicitud } from "@/types/solicitud";

const statusConfig = {
  nueva: { label: "Nueva", className: "bg-emerald-50 text-emerald-600" },
  sin_responder: { label: "Sin responder", className: "bg-amber-50 text-amber-600" },
  respondida: { label: "Respondida", className: "bg-indigo-50 text-indigo-600" },
  archivada: { label: "Archivada", className: "bg-slate-100 text-slate-500" },
} satisfies Record<Solicitud["status"], { label: string; className: string }>;

function AttachmentIcon({ type }: { type: Solicitud["attachments"][number]["type"] }) {
  if (type === "image") return <FileImage className="h-4 w-4 text-violet-500" />;
  if (type === "link") return <Link className="h-4 w-4 text-sky-500" />;
  return <FileText className="h-4 w-4 text-rose-500" />;
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
      <div className="flex items-start justify-between border-b border-slate-200 p-5 sm:p-6">
        <div className="min-w-0 pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{solicitud.titulo}</h2>
            <Badge className={`${status.className} whitespace-nowrap text-[11px] font-medium`}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">Solicitud {solicitud.id} · {solicitud.enviado}</p>
        </div>
        <button type="button" aria-label="Cerrar detalles" onClick={onClose} className="text-slate-400 transition hover:text-slate-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-500">Plan que respalda la solicitud</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{solicitud.planName}</p>
            <p className="mt-1 text-xs text-slate-600">El alcance se coordina dentro de los beneficios de este plan.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {solicitud.clienteInitials}
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Cliente</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{solicitud.clienteName}</p>
                <p className="mt-1 text-xs text-slate-500">Puede contactarte después de tu respuesta.</p>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Guía del proyecto</h3>
          </div>
          <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{solicitud.description}</p>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Lo que solicita el cliente</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {solicitud.characteristics.map((characteristic) => (
              <li key={characteristic} className="flex items-start gap-2 rounded-lg border border-slate-100 p-3 text-xs text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{characteristic}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Entregables solicitados</h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600">
              {solicitud.requestedDeliveries} {solicitud.requestedDeliveries === 1 ? "entrega" : "entregas"}
            </span>
          </div>
          <div className="space-y-2">
            {solicitud.requestedMilestones.map((milestone, index) => (
              <div key={milestone.id} className="flex gap-3 rounded-lg border border-slate-100 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{milestone.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Anexos e inspiración</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {solicitud.attachments.map((attachment) => (
              <button
                type="button"
                key={attachment.id}
                onClick={() => setActiveAttachment(activeAttachment === attachment.id ? null : attachment.id)}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <AttachmentIcon type={attachment.type} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-slate-700">{attachment.name}</span>
                  <span className="mt-1 block text-[11px] text-slate-400">{attachment.size}</span>
                </span>
                <span className="text-[11px] text-indigo-600">{activeAttachment === attachment.id ? "Seleccionado" : "Ver"}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
            <CalendarDays className="h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-xs font-semibold text-blue-900">Plazo por definir</p>
              <p className="mt-1 text-xs leading-5 text-blue-700">Indica los días de cada entrega y la fecha final en tu respuesta.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
            <User className="h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800">{solicitud.revisiones} {solicitud.revisiones === 1 ? "revisión incluida" : "revisiones incluidas"}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Considera este límite al organizar tus entregables.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
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
