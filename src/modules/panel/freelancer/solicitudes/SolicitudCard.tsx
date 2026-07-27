"use client";

import { useState } from "react";
import type { Solicitud } from "@/types/solicitud";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { SolicitudDetailsModal } from "@/modules/panel/freelancer/solicitudes/SolicitudDetailsModal";
import { RespondSolicitudModal } from "@/modules/panel/freelancer/solicitudes/RespondSolicitudModal";

function getStatusColor(status: Solicitud["status"]) {
  switch (status) {
    case "nueva":
      return "bg-emerald-100 text-emerald-700";
    case "sin_responder":
      return "bg-orange-100 text-orange-700";
    case "respondida":
      return "bg-purple-100 text-purple-700";
    case "archivada":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusLabel(status: Solicitud["status"]) {
  switch (status) {
    case "nueva":
      return "Nueva";
    case "sin_responder":
      return "Sin responder";
    case "respondida":
      return "Respondida";
    case "archivada":
      return "Archivada";
    default:
      return status;
  }
}

export function SolicitudCard({ solicitud }: { solicitud: Solicitud }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);

  return (
    <>
      <div className="border-b border-slate-200 px-6 py-5 last:border-b-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-semibold text-slate-900">{solicitud.titulo}</h3>
              <Badge className={`${getStatusColor(solicitud.status)} whitespace-nowrap text-xs font-medium`}>
                {getStatusLabel(solicitud.status)}
              </Badge>
            </div>

            <div className="mb-3 text-sm text-slate-600">
              <div className="font-medium">{solicitud.clienteName} • {solicitud.planName}</div>
            </div>

            <p className="mb-3 text-sm text-slate-600 line-clamp-2">{solicitud.description}</p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
              <span>{solicitud.propuestas} propuestas</span>
              <span className="text-slate-300">•</span>
              <span>{solicitud.revisiones} revisiones</span>
              <span className="text-slate-300">•</span>
              <span>{solicitud.entregatimeString}</span>
            </div>

            <div className="text-xs text-slate-500 mb-4">Enviado: {solicitud.enviado}</div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">Presupuesto</div>
              <div className="text-lg font-semibold text-slate-900">S/ {solicitud.presupuesto.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">Tiempo de entrega</div>
              <div className="text-base font-medium text-slate-900">{solicitud.tiempoEntrega} días</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100 justify-end">
          <Button 
            variant="outline-neutral" 
            className="text-xs"
            onClick={() => setShowDetailsModal(true)}
          >
            Ver detalles
          </Button>
          <Button 
            className="text-xs"
            onClick={() => setShowRespondModal(true)}
          >
            Responder
          </Button>
        </div>
      </div>

      {/* Modales */}
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
