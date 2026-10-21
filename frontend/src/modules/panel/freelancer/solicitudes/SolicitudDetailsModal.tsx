"use client";

import { useState } from "react";
import { Check, Clock, ClipboardList, FileImage, FileText, Hash, Link, Paperclip, ShieldCheck, Sparkles, User, X } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { Textarea } from "@/ui/Textarea";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import { acceptSolicitud, openAttachment, rejectSolicitud } from "@/lib/api/client/solicitudes";
import type { ReceivedSolicitud } from "@/types/receivedSolicitud";
import type { Solicitud } from "@/types/solicitud";

const statusConfig = {
  nueva: { label: "Nueva", className: "!bg-emerald-50 !text-emerald-600" },
  sin_responder: { label: "Aceptada · sin responder", className: "!bg-amber-50 !text-amber-600" },
  respondida: { label: "Aceptada", className: "!bg-indigo-50 !text-indigo-600" },
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
  onDecision,
}: {
  open: boolean;
  onClose: () => void;
  solicitud: Solicitud;
  onDecision: (updated: ReceivedSolicitud) => void;
}) {
  const [openingAttachment, setOpeningAttachment] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const status = statusConfig[solicitud.status];
  const isNew = solicitud.status === "nueva";

  async function handleOpenAttachment(attachmentId: string) {
    setOpeningAttachment(attachmentId);
    setError("");
    const result = await openAttachment(solicitud.id, attachmentId);
    setOpeningAttachment(null);
    if (result.error) setError(result.error);
  }

  async function handleDecision(action: "accept" | "reject") {
    setIsBusy(true);
    setError("");
    const result =
      action === "accept" ? await acceptSolicitud(solicitud.id) : await rejectSolicitud(solicitud.id, reason);
    setIsBusy(false);

    if (!result.solicitud) {
      setError(result.error ?? "No se pudo completar la acción.");
      return;
    }
    onDecision(result.solicitud);
    setRejecting(false);
    setReason("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
        <div className="min-w-0 pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{solicitud.titulo}</h2>
            <Badge className={`${status.className} whitespace-nowrap text-[11px] font-medium`}>
              {solicitud.rejected ? "Rechazada" : solicitud.contracted ? "Contratada" : status.label}
            </Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {solicitud.id.slice(0, 8)}
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
        {solicitud.rejected && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Rechazaste esta solicitud</p>
            {solicitud.rejectionReason && <p className="mt-1">Motivo: {solicitud.rejectionReason}</p>}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Plan que respalda la solicitud</p>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900">{solicitud.planName}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {solicitud.planProjects
                ? `Proyectos activos: ${solicitud.planProjects}. `
                : ""}
              El alcance se coordina dentro de los beneficios de este plan.
            </p>
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
            <div className="space-y-2">
              {solicitud.attachments.map((attachment) => {
                const isOpening = openingAttachment === attachment.id;
                return (
                  <button
                    type="button"
                    key={attachment.id}
                    onClick={() => handleOpenAttachment(attachment.id)}
                    disabled={isOpening}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 disabled:opacity-60"
                  >
                    <AttachmentIcon type={attachment.type} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-700">{attachment.name}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">{attachment.size}</span>
                    </span>
                    <Badge className="!bg-slate-100 !text-slate-600">{isOpening ? "Abriendo..." : "Ver"}</Badge>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="space-y-3 border-t border-slate-200 pt-5">
          {solicitud.status === "respondida" && (
            <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                <Check className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  {solicitud.contracted ? "Contrato activo" : "Aceptaste esta solicitud"}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-indigo-700">
                  {solicitud.contracted && solicitud.payment
                    ? `El cliente pagó $${solicitud.payment.amount} el ${formatSolicitudDate(solicitud.payment.paidAt)} (ref. ${solicitud.payment.reference}). Próximo cobro: ${formatSolicitudDate(solicitud.payment.nextChargeAt)}.`
                    : "El cliente debe pagar para activar el contrato."}
                </p>
              </div>
            </div>
          )}
          {solicitud.revisiones > 0 && (
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">{solicitud.revisiones} {solicitud.revisiones === 1 ? "revisión incluida" : "revisiones incluidas"}</p>
                <p className="mt-0.5 text-xs leading-5 text-emerald-700">Considera este límite al organizar tus entregables.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
        {isNew && rejecting && (
          <div className="mb-4">
            <Textarea
              label="Motivo del rechazo (opcional)"
              rows={3}
              maxLength={500}
              placeholder="Cuéntale al cliente por qué no puedes aceptarla."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        )}

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        {isNew && rejecting ? (
          <div className="flex gap-3">
            <Button
              variant="outline-neutral"
              onClick={() => {
                setRejecting(false);
                setError("");
              }}
              disabled={isBusy}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDecision("reject")}
              disabled={isBusy}
              className="flex-1 !bg-red-600 hover:!bg-red-700"
            >
              {isBusy ? "Rechazando..." : "Confirmar rechazo"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline-neutral" onClick={onClose} disabled={isBusy} className="flex-1">
              Cerrar
            </Button>
            {isNew && (
              <>
                <Button
                  variant="outline-neutral"
                  onClick={() => setRejecting(true)}
                  disabled={isBusy}
                  className="flex-1 hover:!border-red-300 hover:!text-red-600"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Rechazar
                </Button>
                <Button onClick={() => handleDecision("accept")} disabled={isBusy} className="flex-1">
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  {isBusy ? "Aceptando..." : "Aceptar"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
