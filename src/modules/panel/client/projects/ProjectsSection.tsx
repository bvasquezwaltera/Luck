"use client";

import { useEffect, useState } from "react";
import { FolderOpen } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { CreateSolicitudModal, type NewSolicitudData } from "@/modules/panel/client/projects/CreateSolicitudModal";
import { loadStoredSolicitudes, storeSolicitud } from "@/lib/solicitudStorage";
import type { Solicitud } from "@/types/solicitud";

export function SolicitudesSection() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    setSolicitudes(loadStoredSolicitudes());
  }, []);

  function handleCreateSolicitud(newSolicitud: NewSolicitudData) {
    storeSolicitud({
      titulo: newSolicitud.title,
      description: newSolicitud.description,
      category: newSolicitud.category,
      planName: newSolicitud.planName,
      requestedDeliveries: newSolicitud.requestedDeliveries,
      characteristics: newSolicitud.characteristics,
      attachmentNames: newSolicitud.attachmentNames,
      targetFreelancerName: (newSolicitud as any).freelancerName,
      targetFreelancerRole: (newSolicitud as any).freelancerRole,
    });
    setSolicitudes(loadStoredSolicitudes());
    setShowCreateModal(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <PanelSectionHeader
          subtitle="Bienvenido de nuevo"
          title="Solicitudes"
          actions={
            <Button
              variant="primary"
              className="!min-w-0 !px-4 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowCreateModal(true)}
            >
              Nueva solicitud
            </Button>
          }
        />
      </div>

      {solicitudes.length === 0 ? (
        <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8 text-center shadow-sm">
          <FolderOpen className="h-10 w-10 text-slate-400" />
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold text-slate-900">Aún no tienes solicitudes activas</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Desde aquí podrás crear tus solicitudes para exponer tus necesidades a los freelancers y gestionar el seguimiento de cada pedido.
            </p>
          </div>
          <Button variant="soft" className="!min-w-0 !px-5" onClick={() => setShowCreateModal(true)}>
            Crear primera solicitud
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {solicitudes.map((solicitud) => (
            <Card key={solicitud.id} className="border-indigo-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-indigo-500">Solicitud nueva</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{solicitud.titulo}</h3>
                  <p className="mt-1 text-sm text-slate-600">Solicitada a {solicitud.targetFreelancerName ?? "(sin destinatario)"} {solicitud.targetFreelancerRole ? `— ${solicitud.targetFreelancerRole}` : ""}</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
                  {solicitud.enviado}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Descripción</p>
                  <p className="mt-2 text-sm text-slate-700">{solicitud.description}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Características</p>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                    {solicitud.characteristics.length > 0
                      ? solicitud.characteristics.join("\n")
                      : "No se agregaron características adicionales."}
                  </p>
                </div>
              </div>
              {solicitud.attachments.length > 0 && (
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Archivos de referencia</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {solicitud.attachments.map((attachment) => (
                      <li key={attachment.id} className="rounded-xl bg-slate-100 px-3 py-2">
                        {attachment.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <CreateSolicitudModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSolicitud}
      />
    </div>
  );
}
