"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Layers, Paperclip, RotateCcw } from "lucide-react";
import { SolicitudRowCard, type RowDetail, type RowFact } from "@/modules/panel/SolicitudRowCard";
import { statusFor } from "@/modules/panel/freelancer/solicitudes/solicitudStatus";
import { SolicitudDetailsModal } from "@/modules/panel/freelancer/solicitudes/SolicitudDetailsModal";
import { solicitudCategoryConfig } from "@/modules/panel/solicitudCategoryConfig";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { ReceivedSolicitud } from "@/types/receivedSolicitud";
import type { Solicitud } from "@/types/solicitud";
import { Button } from "@/ui/Button";

export function SolicitudCard({
  solicitud,
  onDecision,
  onGoToDeliveries,
}: {
  solicitud: Solicitud;
  onDecision: (updated: ReceivedSolicitud) => void;
  onGoToDeliveries?: () => void;
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const category = solicitudCategoryConfig[solicitud.category];
  const status = statusFor(solicitud);

  const facts: RowFact[] = [];
  if (solicitud.desiredDate) {
    facts.push({ icon: CalendarDays, label: `Para el ${formatSolicitudDate(solicitud.desiredDate)}` });
  }
  if (solicitud.planProjects) facts.push({ icon: Layers, label: `${solicitud.planProjects} proyectos activos` });
  if (solicitud.revisiones > 0) {
    facts.push({
      icon: RotateCcw,
      label: `${solicitud.revisiones} ${solicitud.revisiones === 1 ? "revisión" : "revisiones"}`,
    });
  }
  if (solicitud.attachments.length > 0) {
    facts.push({
      icon: Paperclip,
      label: `${solicitud.attachments.length} ${solicitud.attachments.length === 1 ? "anexo" : "anexos"}`,
    });
  }

  const details: RowDetail[] = [];
  if (solicitud.contracted && solicitud.payment) {
    if (solicitud.payment.net != null) {
      details.push({ label: "Neto a recibir", value: formatMoney(solicitud.payment.net) });
    }
    details.push({ label: "Próximo cobro", value: formatSolicitudDate(solicitud.payment.nextChargeAt) });
  } else if (status.tone === "indigo") {
    details.push({ label: "Pago", value: "Esperando al cliente" });
  }

  const actions = solicitud.contracted ? (
    <>
      <Button className="w-full min-w-0 gap-1.5" onClick={onGoToDeliveries} disabled={!onGoToDeliveries}>
        Ir a entregas
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline-neutral" className="w-full min-w-0" onClick={() => setShowDetailsModal(true)}>
        Ver detalles
      </Button>
    </>
  ) : solicitud.status === "nueva" ? (
    <Button className="w-full min-w-0" onClick={() => setShowDetailsModal(true)}>
      Revisar solicitud
    </Button>
  ) : (
    <Button variant="outline-neutral" className="w-full min-w-0" onClick={() => setShowDetailsModal(true)}>
      Ver detalles
    </Button>
  );

  return (
    <>
      <SolicitudRowCard
        tone={status.tone}
        statusLabel={status.label}
        title={solicitud.titulo}
        categoryIcon={category.icon}
        categoryClassName={category.className}
        person={{ name: solicitud.clienteName, initials: solicitud.clienteInitials }}
        planLine={solicitud.planName}
        description={solicitud.description}
        facts={facts}
        footer={`${solicitud.categoryLabel ?? category.label} · Enviada el ${solicitud.enviado}`}
        price={{
          amount: solicitud.planPrice !== undefined ? formatMoney(solicitud.planPrice) : "—",
          period: solicitud.planPrice !== undefined ? "/mes" : undefined,
        }}
        details={details}
        actions={actions}
      />

      <SolicitudDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        solicitud={solicitud}
        onDecision={onDecision}
        onGoToDeliveries={onGoToDeliveries}
      />
    </>
  );
}
