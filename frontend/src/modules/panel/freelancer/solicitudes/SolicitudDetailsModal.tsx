"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  FileText,
  Hourglass,
  Layers,
  Paperclip,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import {
  DetailsBanner,
  DetailsSection,
  InfoRows,
  SideCard,
  SolicitudDetailsLayout,
} from "@/modules/panel/SolicitudDetailsLayout";
import { SolicitudAttachmentList } from "@/modules/panel/SolicitudAttachmentList";
import { statusFor } from "@/modules/panel/freelancer/solicitudes/solicitudStatus";
import { acceptSolicitud, rejectSolicitud } from "@/lib/api/client/solicitudes";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { ReceivedSolicitud } from "@/types/receivedSolicitud";
import type { Solicitud } from "@/types/solicitud";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";
import { Textarea } from "@/ui/Textarea";

export function SolicitudDetailsModal({
  open,
  onClose,
  solicitud,
  onDecision,
  onGoToDeliveries,
}: {
  open: boolean;
  onClose: () => void;
  solicitud: Solicitud;
  onDecision: (updated: ReceivedSolicitud) => void;
  onGoToDeliveries?: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const status = statusFor(solicitud);
  const isNew = solicitud.status === "nueva";
  const payment = solicitud.payment;
  const attachments = solicitud.attachments
    .filter((attachment) => attachment.type !== "link")
    .map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      type: attachment.type === "pdf" ? ("pdf" as const) : ("image" as const),
      size: attachment.size ?? "",
    }));

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

  // Lo primero que ve: en qué está la solicitud y qué sigue.
  const banner = solicitud.contracted ? (
    <DetailsBanner tone="emerald" icon={CheckCircle2} title="Contrato activo">
      {payment
        ? `El cliente pagó ${formatMoney(payment.amount)} el ${formatSolicitudDate(payment.paidAt)}. Próximo cobro: ${formatSolicitudDate(payment.nextChargeAt)}.`
        : "El cliente ya pagó esta solicitud."}{" "}
      Planifica las entregas desde la sección Entregas.
    </DetailsBanner>
  ) : solicitud.rejected ? (
    <DetailsBanner tone="red" icon={XCircle} title="Rechazaste esta solicitud">
      {solicitud.rejectionReason ? `Motivo: ${solicitud.rejectionReason}` : "No indicaste un motivo."}
    </DetailsBanner>
  ) : isNew ? (
    <DetailsBanner tone="amber" icon={AlertCircle} title="Esta solicitud espera tu respuesta">
      Revisa el alcance y los anexos, y acepta o rechaza. Si aceptas, el cliente pasa al pago.
    </DetailsBanner>
  ) : status.tone === "indigo" ? (
    <DetailsBanner tone="indigo" icon={Hourglass} title="Aceptaste esta solicitud">
      El cliente debe pagar para activar el contrato.
    </DetailsBanner>
  ) : null;

  const main = (
    <>
      <DetailsSection icon={FileText} title="Lo que necesita">
        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{solicitud.description}</p>
      </DetailsSection>

      {solicitud.characteristics.length > 0 && (
        <DetailsSection icon={Sparkles} title="Características">
          <ul className="space-y-2">
            {solicitud.characteristics.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700">
                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </DetailsSection>
      )}

      {attachments.length > 0 && (
        <DetailsSection icon={Paperclip} title="Anexos e inspiración">
          <SolicitudAttachmentList solicitudId={solicitud.id} attachments={attachments} layout="rows" />
        </DetailsSection>
      )}
    </>
  );

  const aside = (
    <>
      <SideCard label="Cliente">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {solicitud.clienteInitials}
          </div>
          <p className="min-w-0 text-sm font-semibold text-slate-900">{solicitud.clienteName}</p>
        </div>
      </SideCard>

      <SideCard label="Plan solicitado">
        <p className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {solicitud.planPrice !== undefined ? formatMoney(solicitud.planPrice) : "—"}
          </span>
          <span className="text-xs text-slate-500">/mes</span>
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">{solicitud.planName}</p>
        <ul className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600">
          {solicitud.planProjects && (
            <li className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              {solicitud.planProjects} proyectos activos
            </li>
          )}
          {solicitud.revisiones > 0 && (
            <li className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              {solicitud.revisiones} {solicitud.revisiones === 1 ? "revisión incluida" : "revisiones incluidas"}
            </li>
          )}
          {solicitud.desiredDate && (
            <li className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              Para el {formatSolicitudDate(solicitud.desiredDate)}
            </li>
          )}
        </ul>
      </SideCard>

      {solicitud.contracted && payment && (
        <SideCard label="Cobro">
          <InfoRows
            rows={[
              { label: "Pagado por el cliente", value: formatMoney(payment.amount) },
              ...(payment.net != null
                ? [
                    { label: "Comisión", value: `- ${formatMoney(payment.amount - payment.net)}` },
                    { label: "Neto a recibir", value: formatMoney(payment.net), strong: true },
                  ]
                : []),
              { label: "Próximo cobro", value: formatSolicitudDate(payment.nextChargeAt) },
              { label: "Referencia", value: payment.reference },
            ]}
          />
        </SideCard>
      )}
    </>
  );

  const footer =
    isNew && rejecting ? (
      <div className="space-y-3">
        <Textarea
          label="Motivo del rechazo (opcional)"
          rows={3}
          maxLength={500}
          placeholder="Cuéntale al cliente por qué no puedes aceptarla."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
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
      </div>
    ) : (
      <div className="space-y-2">
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline-neutral" onClick={onClose} disabled={isBusy} className="sm:min-w-28">
            Cerrar
          </Button>
          {isNew && (
            <>
              <Button
                variant="outline-neutral"
                onClick={() => setRejecting(true)}
                disabled={isBusy}
                className="gap-1.5 hover:!border-red-300 hover:!text-red-600 sm:min-w-32"
              >
                <X className="h-3.5 w-3.5" />
                Rechazar
              </Button>
              <Button onClick={() => handleDecision("accept")} disabled={isBusy} className="gap-1.5 sm:min-w-32">
                <Check className="h-3.5 w-3.5" />
                {isBusy ? "Aceptando..." : "Aceptar"}
              </Button>
            </>
          )}
          {solicitud.contracted && onGoToDeliveries && (
            <Button
              onClick={() => {
                onClose();
                onGoToDeliveries();
              }}
              className="gap-1.5 sm:min-w-36"
            >
              Ir a entregas
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    );

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <SolicitudDetailsLayout
        title={solicitud.titulo}
        tone={status.tone}
        statusLabel={status.label}
        subtitle={`${solicitud.categoryLabel ?? "Solicitud"} · Enviada el ${solicitud.enviado}`}
        onClose={onClose}
        banner={banner}
        main={main}
        aside={aside}
        footer={footer}
      />
    </Modal>
  );
}
