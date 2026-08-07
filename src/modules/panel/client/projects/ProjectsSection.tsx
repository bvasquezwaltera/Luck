"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FolderOpen, MessageSquareText, Sparkles, UploadCloud } from "lucide-react";
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
      <div className="rounded-[28px] border border-slate-200 bg-[#f8f7ff] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              Mis solicitudes
            </div>
            <PanelSectionHeader
              subtitle="Gestiona tus pedidos y mantén visible el avance de cada solicitud."
              title="Solicitudes"
            />
          </div>
          <Button
            variant="primary"
            className="!min-w-0 !px-4 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setShowCreateModal(true)}
          >
            Nueva solicitud
          </Button>
        </div>
      </div>

      {solicitudes.length === 0 ? (
        <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center gap-4 rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FolderOpen className="h-7 w-7" />
          </div>
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
            <Card key={solicitud.id} className="border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-600">
                      Solicitud nueva
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                      {solicitud.enviado}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{solicitud.titulo}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Solicitada a {solicitud.targetFreelancerName ?? "(sin destinatario)"} {solicitud.targetFreelancerRole ? `— ${solicitud.targetFreelancerRole}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <CalendarDays className="h-4 w-4 text-indigo-500" />
                    Seguimiento activo
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <MessageSquareText className="h-4 w-4 text-indigo-500" />
                    Pendiente de responder
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Descripción</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{solicitud.description}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 text-indigo-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Características</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">
                    {solicitud.characteristics.length > 0
                      ? solicitud.characteristics.join("\n")
                      : "No se agregaron características adicionales."}
                  </p>
                </div>
              </div>

              {solicitud.attachments.length > 0 && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Archivos de referencia</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {solicitud.attachments.map((attachment) => (
                      <li key={attachment.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
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
