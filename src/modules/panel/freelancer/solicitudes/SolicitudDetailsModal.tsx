"use client";

import { X, Clock, User, FileText } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import type { Solicitud } from "@/types/solicitud";

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
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{solicitud.titulo}</h2>
            <Badge className={`${getStatusColor(solicitud.status)} whitespace-nowrap text-xs font-medium`}>
              {getStatusLabel(solicitud.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">ID: {solicitud.id}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 transition hover:text-slate-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        {/* Cliente y Plan */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">
                {solicitud.clienteInitials}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Cliente</p>
                <p className="text-base font-semibold text-slate-900">{solicitud.clienteName}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500">Plan del Cliente</p>
                <p className="text-base font-semibold text-slate-900">{solicitud.planName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Descripción del Proyecto</h3>
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
            {solicitud.description}
          </p>
        </div>

        {/* Información Financiera y de Tiempo */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-medium text-emerald-700">Presupuesto Ofrecido</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              S/ {solicitud.presupuesto.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-700">Tiempo de Entrega</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{solicitud.tiempoEntrega} días</p>
          </div>
        </div>

        {/* Detalles Adicionales */}
        <div className="grid gap-3 sm:grid-cols-3 border-t border-slate-200 pt-6">
          <div>
            <p className="text-xs font-medium text-slate-500">Propuestas Recibidas</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{solicitud.propuestas}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Revisiones Permitidas</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{solicitud.revisiones}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Enviado Hace</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{solicitud.enviado}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <p className="font-semibold text-indigo-900">Entrega Estimada</p>
          </div>
          <p className="text-sm text-indigo-700">{solicitud.entregatimeString}</p>
        </div>

        {/* Información de Contacto */}
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500">Puedes contactar al cliente</p>
              <p className="mt-1 text-sm text-slate-700">
                Una vez que respondas a esta solicitud, podrás comunicarte directamente con <strong>{solicitud.clienteName}</strong> a través del sistema de mensajería.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-6">
        <Button
          variant="outline-neutral"
          onClick={onClose}
          className="flex-1"
        >
          Cerrar
        </Button>
        <Button
          onClick={() => {
            onRespond();
            onClose();
          }}
          className="flex-1"
        >
          Responder a esta Solicitud
        </Button>
      </div>
    </Modal>
  );
}
