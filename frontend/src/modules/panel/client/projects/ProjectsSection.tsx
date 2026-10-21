import Link from "next/link";
import { CalendarDays, FolderOpen } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import type { ClientSolicitud, ClientSolicitudStatus } from "@/types/clientSolicitud";

const STATUS_CONFIG: Record<ClientSolicitudStatus, { label: string; hint: string; className: string }> = {
  enviada: {
    label: "Enviada",
    hint: "Esperando la respuesta del freelancer.",
    className: "bg-indigo-50 text-indigo-600",
  },
  aceptada: {
    label: "Aceptada · pendiente de pago",
    hint: "El freelancer aceptó tu solicitud. Falta el pago para activar el contrato.",
    className: "bg-emerald-50 text-emerald-700",
  },
  rechazada: {
    label: "Rechazada",
    hint: "El freelancer no pudo aceptar esta solicitud.",
    className: "bg-red-50 text-red-600",
  },
  cancelada: {
    label: "Cancelada",
    hint: "La solicitud fue cancelada.",
    className: "bg-slate-100 text-slate-600",
  },
  expirada: {
    label: "Expirada",
    hint: "La solicitud venció sin respuesta.",
    className: "bg-amber-50 text-amber-700",
  },
};

// Zona fija (Lima) para que el servidor y el navegador muestren la misma fecha.
const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Lima",
});

function formatDate(value: string): string {
  // Las fechas sin hora (yyyy-mm-dd) se tratan como mediodía UTC para no correrse de día.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return dateFormatter.format(date);
}

export function SolicitudesSection({ solicitudes }: { solicitudes: ClientSolicitud[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <PanelSectionHeader
          subtitle="Gestiona tus pedidos y mantén visible el avance de cada solicitud."
          title="Solicitudes"
        />
      </div>

      {solicitudes.length === 0 ? (
        <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center gap-4 rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FolderOpen className="h-7 w-7" />
          </div>
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold text-slate-900">Aún no tienes solicitudes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Elige un freelancer y un plan desde su perfil para enviar tu primera solicitud. Aquí verás
              su respuesta.
            </p>
          </div>
          <Button variant="soft" className="!min-w-0 !px-5" href="/">
            Explorar freelancers
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {solicitudes.map((solicitud) => (
            <SolicitudCard key={solicitud.id} solicitud={solicitud} />
          ))}
        </div>
      )}
    </div>
  );
}

function SolicitudCard({ solicitud }: { solicitud: ClientSolicitud }) {
  const status = STATUS_CONFIG[solicitud.status];

  return (
    <Card className="border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>
          {status.label}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
          Enviada el {formatDate(solicitud.createdAt)}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-900">{solicitud.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{status.hint}</p>

      {solicitud.status === "rechazada" && solicitud.rejectionReason && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          Motivo: {solicitud.rejectionReason}
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Descripción</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{solicitud.description}</p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Link
            href={`/perfil/${solicitud.freelancer.id}`}
            className="flex items-center gap-3 hover:opacity-80"
          >
            <Avatar initials={solicitud.freelancer.initials} name={solicitud.freelancer.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{solicitud.freelancer.name}</p>
              <p className="truncate text-xs text-slate-500">{solicitud.freelancer.specialty}</p>
            </div>
          </Link>

          <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
            <p className="text-sm font-medium text-slate-700">Plan {solicitud.plan.name}</p>
            <p className="text-sm font-bold text-slate-900">
              ${solicitud.plan.price}
              <span className="text-xs font-normal text-slate-500"> /mes</span>
            </p>
          </div>

          {solicitud.category && <p className="text-xs text-slate-500">Categoría: {solicitud.category}</p>}

          {solicitud.desiredDate && (
            <p className="inline-flex items-center gap-2 text-xs text-slate-600">
              <CalendarDays className="h-4 w-4 text-indigo-500" />
              Fecha deseada: {formatDate(solicitud.desiredDate)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
