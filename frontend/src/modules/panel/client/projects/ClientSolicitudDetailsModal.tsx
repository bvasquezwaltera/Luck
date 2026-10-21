"use client";

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Hourglass,
  Layers,
  Paperclip,
  RotateCcw,
  Sparkles,
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
import { CLIENT_LABEL, CLIENT_TONE, payHint } from "@/modules/panel/client/projects/clientSolicitudStatus";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { ClientSolicitud } from "@/types/clientSolicitud";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";

export function ClientSolicitudDetailsModal({
  open,
  onClose,
  solicitud,
  onPay,
  onGoToDeliveries,
}: {
  open: boolean;
  onClose: () => void;
  solicitud: ClientSolicitud;
  onPay: () => void;
  onGoToDeliveries?: () => void;
}) {
  const revisions = Number.parseInt(solicitud.plan.revisions, 10) || 0;
  const payment = solicitud.payment;

  // Lo primero que ve: en qué está la solicitud y qué sigue.
  const banner =
    solicitud.status === "contratada" ? (
      <DetailsBanner tone="emerald" icon={CheckCircle2} title="Contrato activo">
        {payment
          ? `Pagaste ${formatMoney(payment.amount)} el ${formatSolicitudDate(payment.paidAt)}. Próximo cobro: ${formatSolicitudDate(payment.nextChargeAt)}.`
          : "Tu solicitud está pagada."}{" "}
        El freelancer planificará las entregas y las verás en la sección Entregas.
      </DetailsBanner>
    ) : solicitud.status === "aceptada" ? (
      <DetailsBanner tone="indigo" icon={CreditCard} title="El freelancer aceptó tu solicitud">
        Falta tu pago para activar el contrato. Pagas hoy el primer mes.
      </DetailsBanner>
    ) : solicitud.status === "enviada" ? (
      <DetailsBanner tone="amber" icon={Hourglass} title="Esperando respuesta">
        El freelancer revisará tu solicitud. Verás aquí su respuesta apenas la envíe.
      </DetailsBanner>
    ) : solicitud.status === "rechazada" ? (
      <DetailsBanner tone="red" icon={XCircle} title="El freelancer rechazó tu solicitud">
        {solicitud.rejectionReason
          ? `Motivo: ${solicitud.rejectionReason}`
          : "Puedes elegir otro plan o a otro freelancer."}
      </DetailsBanner>
    ) : (
      <DetailsBanner tone="slate" icon={AlertCircle} title={CLIENT_LABEL[solicitud.status]}>
        {solicitud.status === "cancelada" ? "Esta solicitud fue cancelada." : "Esta solicitud venció sin respuesta."}
      </DetailsBanner>
    );

  const main = (
    <>
      <DetailsSection icon={FileText} title="Lo que pediste">
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

      {solicitud.attachments.length > 0 && (
        <DetailsSection icon={Paperclip} title="Anexos e inspiración">
          <SolicitudAttachmentList solicitudId={solicitud.id} attachments={solicitud.attachments} layout="rows" />
        </DetailsSection>
      )}
    </>
  );

  const aside = (
    <>
      <SideCard label="Freelancer">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {solicitud.freelancer.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{solicitud.freelancer.name}</p>
            {solicitud.freelancer.specialty && (
              <p className="text-xs text-slate-500">{solicitud.freelancer.specialty}</p>
            )}
          </div>
        </div>
      </SideCard>

      <SideCard label="Plan solicitado">
        <p className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{formatMoney(solicitud.plan.price)}</span>
          <span className="text-xs text-slate-500">/mes</span>
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">Plan {solicitud.plan.name}</p>
        <ul className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600">
          {solicitud.plan.activeProjects && (
            <li className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              {solicitud.plan.activeProjects} proyectos activos
            </li>
          )}
          {revisions > 0 && (
            <li className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              {revisions} {revisions === 1 ? "revisión incluida" : "revisiones incluidas"}
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

      {solicitud.status === "contratada" && payment && (
        <SideCard label="Tu pago">
          <InfoRows
            rows={[
              { label: "Pagado", value: formatMoney(payment.amount), strong: true },
              { label: "Fecha", value: formatSolicitudDate(payment.paidAt) },
              { label: "Próximo cobro", value: formatSolicitudDate(payment.nextChargeAt) },
              { label: "Referencia", value: payment.reference },
            ]}
          />
        </SideCard>
      )}
    </>
  );

  // Pagar está siempre a la vista, pero solo se habilita con la solicitud aceptada; con el contrato ya activo,
  // el paso siguiente es ir a las entregas.
  const footer = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button variant="outline-neutral" onClick={onClose} className="sm:min-w-28">
        Cerrar
      </Button>
      {solicitud.status === "contratada" ? (
        onGoToDeliveries && (
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
        )
      ) : (
        <Button
          onClick={onPay}
          disabled={solicitud.status !== "aceptada"}
          title={payHint(solicitud.status)}
          className="gap-1.5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-36"
        >
          <CreditCard className="h-3.5 w-3.5" />
          Pagar {formatMoney(solicitud.plan.price)}
        </Button>
      )}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <SolicitudDetailsLayout
        title={solicitud.title}
        tone={CLIENT_TONE[solicitud.status]}
        statusLabel={CLIENT_LABEL[solicitud.status]}
        subtitle={`${solicitud.category || "Solicitud"} · Enviada el ${formatSolicitudDate(solicitud.createdAt)}`}
        onClose={onClose}
        banner={banner}
        main={main}
        aside={aside}
        footer={footer}
      />
    </Modal>
  );
}
