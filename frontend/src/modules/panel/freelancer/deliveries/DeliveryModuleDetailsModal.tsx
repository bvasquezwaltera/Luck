"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Hourglass, RotateCcw, Trash2, UploadCloud } from "lucide-react";
import { DeliveryDetailsSide } from "@/modules/panel/DeliveryDetailsSide";
import { DeliveryThread } from "@/modules/panel/DeliveryThread";
import { DeliveryFreelancerAdvance } from "@/modules/panel/freelancer/deliveries/DeliveryFreelancerAdvance";
import { deliveryStatusFor } from "@/modules/panel/deliveryStatus";
import { DetailsBanner, DetailsSection, SolicitudDetailsLayout } from "@/modules/panel/SolicitudDetailsLayout";
import { deleteDelivery } from "@/lib/api/client/deliveries";
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(current: DeliveryModule) {
    setIsDeleting(true);
    setDeleteError("");
    const result = await deleteDelivery(current.id);
    setIsDeleting(false);

    if (!result.contracts) {
      setDeleteError(result.error ?? "No se pudo eliminar la entrega.");
      return;
    }
    onClose();
    onChanged(result.contracts);
  }

  if (!module || !module.apiStatus) return <Modal open={false} onClose={onClose}>{null}</Modal>;

  const status = deliveryStatusFor(module.apiStatus, "freelancer");

  // Lo primero que ve: en qué está la entrega y qué le toca hacer.
  const banner =
    module.apiStatus === "pendiente" ? (
      <DetailsBanner tone="amber" icon={UploadCloud} title="Aún no subiste un avance">
        Describe lo que hiciste y adjunta archivos o enlaces. El cliente lo revisará.
      </DetailsBanner>
    ) : module.apiStatus === "en_revision" ? (
      <DetailsBanner tone="indigo" icon={Hourglass} title="Esperando la respuesta del cliente">
        Ya enviaste este avance. Podrás subir otro si el cliente pide cambios.
      </DetailsBanner>
    ) : module.apiStatus === "cambios_solicitados" ? (
      <DetailsBanner tone="amber" icon={RotateCcw} title="El cliente pidió cambios">
        Revisa su respuesta en la conversación y sube un nuevo avance con los ajustes.
      </DetailsBanner>
    ) : (
      <DetailsBanner tone="emerald" icon={CheckCircle2} title="Entrega aprobada">
        El cliente aprobó esta entrega. ¡Buen trabajo!
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

      <DeliveryFreelancerAdvance key={`${module.id}-${module.apiStatus}`} module={module} onChanged={onChanged} />

      <DeliveryThread module={module} viewer="freelancer" />
    </>
  );

  const aside = (
    <DeliveryDetailsSide
      module={module}
      viewer="freelancer"
      revisionsLimit={revisionsLimit}
      revisionsUsed={revisionsUsed}
    />
  );

  // Eliminar solo existe mientras la entrega no tiene avances.
  const footer = (
    <div className="space-y-2">
      {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {module.apiStatus === "pendiente" &&
            (confirmingDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-red-600">¿Eliminar esta entrega?</span>
                <Button
                  variant="outline-neutral"
                  className="!min-w-0 !px-3 !border-red-300 !text-red-600 hover:!bg-red-50"
                  onClick={() => handleDelete(module)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                </Button>
                <Button
                  variant="outline-neutral"
                  className="!min-w-0 !px-3"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline-neutral"
                className="!min-w-0 gap-1.5 !px-3 hover:!border-red-300 hover:!text-red-600"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar entrega
              </Button>
            ))}
        </div>
        <Button onClick={onClose} className="sm:min-w-28">
          Cerrar
        </Button>
      </div>
    </div>
  );

  return (
    <Modal open onClose={onClose} size="xl">
      <SolicitudDetailsLayout
        title={module.title}
        tone={status.tone}
        statusLabel={status.label}
        subtitle={`${module.requestTitle} · ${module.clientName}`}
        onClose={onClose}
        banner={banner}
        main={main}
        aside={aside}
        footer={footer}
      />
    </Modal>
  );
}
