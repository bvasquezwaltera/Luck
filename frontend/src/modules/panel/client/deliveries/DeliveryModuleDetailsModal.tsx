"use client";

import { CheckCircle2, Clock3, FileText, Hourglass, MessageCircleQuestion } from "lucide-react";
import { DeliveryDetailsSide } from "@/modules/panel/DeliveryDetailsSide";
import { DeliveryThread } from "@/modules/panel/DeliveryThread";
import { DeliveryClientFeedback } from "@/modules/panel/client/deliveries/DeliveryClientFeedback";
import { deliveryStatusFor } from "@/modules/panel/deliveryStatus";
import { DetailsBanner, DetailsSection, SolicitudDetailsLayout } from "@/modules/panel/SolicitudDetailsLayout";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";

export function DeliveryModuleDetailsModal({
  module,
  revisionsLimit,
  revisionsUsed,
  onClose,
  onChanged,
}: {
  module: DeliveryModule | null;
  revisionsLimit: number | null;
  revisionsUsed: number;
  onClose: () => void;
  onChanged: (contracts: ContractDeliveries[]) => void;
}) {
  if (!module || !module.apiStatus) return <Modal open={false} onClose={onClose}>{null}</Modal>;

  const status = deliveryStatusFor(module.apiStatus, "client");

  // Lo primero que ve: en qué está la entrega y qué le toca hacer.
  const banner =
    module.apiStatus === "pendiente" ? (
      <DetailsBanner tone="slate" icon={Clock3} title="El freelancer aún no subió un avance">
        Cuando lo haga podrás aprobarlo o pedir cambios desde aquí.
      </DetailsBanner>
    ) : module.apiStatus === "en_revision" ? (
      <DetailsBanner tone="amber" icon={MessageCircleQuestion} title="Esperando tu revisión">
        Mira el avance en la conversación y aprueba la entrega o pide cambios.
      </DetailsBanner>
    ) : module.apiStatus === "cambios_solicitados" ? (
      <DetailsBanner tone="indigo" icon={Hourglass} title="Pediste cambios">
        Estás esperando el nuevo avance del freelancer.
      </DetailsBanner>
    ) : (
      <DetailsBanner tone="emerald" icon={CheckCircle2} title="Aprobaste esta entrega">
        Esta entrega está terminada.
      </DetailsBanner>
    );

  const main = (
    <>
      <DetailsSection icon={FileText} title="Qué incluye esta entrega">
        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{module.description}</p>
        {module.objectives.length > 0 && (
          <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {module.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {objective}
              </li>
            ))}
          </ul>
        )}
      </DetailsSection>

      <DeliveryClientFeedback
        key={`${module.id}-${module.apiStatus}`}
        module={module}
        revisionsLimit={revisionsLimit}
        revisionsUsed={revisionsUsed}
        onChanged={onChanged}
      />

      <DeliveryThread module={module} viewer="client" />
    </>
  );

  const aside = (
    <DeliveryDetailsSide
      module={module}
      viewer="client"
      revisionsLimit={revisionsLimit}
      revisionsUsed={revisionsUsed}
    />
  );

  const footer = (
    <div className="flex justify-end">
      <Button onClick={onClose} className="sm:min-w-28">
        Cerrar
      </Button>
    </div>
  );

  return (
    <Modal open onClose={onClose} size="xl">
      <SolicitudDetailsLayout
        title={module.title}
        tone={status.tone}
        statusLabel={status.label}
        subtitle={`${module.requestTitle} · ${module.freelancerName}`}
        onClose={onClose}
        banner={banner}
        main={main}
        aside={aside}
        footer={footer}
      />
    </Modal>
  );
}
