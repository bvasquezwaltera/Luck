import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { ROW_TONES, type RowTone } from "@/modules/panel/SolicitudRowCard";

const BANNER_TONES: Record<RowTone, { box: string; icon: string; title: string; text: string }> = {
  emerald: { box: "bg-emerald-50 ring-emerald-100", icon: "bg-emerald-100 text-emerald-600", title: "text-emerald-900", text: "text-emerald-800" },
  amber: { box: "bg-amber-50 ring-amber-100", icon: "bg-amber-100 text-amber-600", title: "text-amber-900", text: "text-amber-800" },
  indigo: { box: "bg-indigo-50 ring-indigo-100", icon: "bg-indigo-100 text-indigo-600", title: "text-indigo-900", text: "text-indigo-800" },
  slate: { box: "bg-slate-50 ring-slate-200", icon: "bg-slate-200 text-slate-600", title: "text-slate-900", text: "text-slate-700" },
  red: { box: "bg-red-50 ring-red-100", icon: "bg-red-100 text-red-600", title: "text-red-900", text: "text-red-800" },
};

// Estructura común del detalle de una solicitud (cliente y freelancer): cabecera con el estado, el
// aviso de lo que sigue arriba del todo, el contenido a la izquierda y los datos de resumen a la derecha.
export function SolicitudDetailsLayout({
  title,
  tone,
  statusLabel,
  subtitle,
  onClose,
  banner,
  main,
  aside,
  footer,
}: {
  title: string;
  tone: RowTone;
  statusLabel: string;
  subtitle: string;
  onClose: () => void;
  banner?: ReactNode;
  main: ReactNode;
  aside: ReactNode;
  footer: ReactNode;
}) {
  const colors = ROW_TONES[tone];

  return (
    <>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="min-w-0 text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${colors.pill}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
              {statusLabel}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          aria-label="Cerrar detalles"
          onClick={onClose}
          className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-5">
          {banner}
          {main}
        </div>
        <aside className="space-y-4">{aside}</aside>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-8">{footer}</div>
    </>
  );
}

// Aviso del estado actual y de qué sigue, arriba del contenido.
export function DetailsBanner({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: RowTone;
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
}) {
  const colors = BANNER_TONES[tone];
  return (
    <div className={`flex items-start gap-3 rounded-2xl p-4 ring-1 ring-inset ${colors.box}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colors.icon}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${colors.title}`}>{title}</p>
        {children && <div className={`mt-0.5 text-sm leading-6 ${colors.text}`}>{children}</div>}
      </div>
    </div>
  );
}

export function DetailsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function SideCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function InfoRows({ rows }: { rows: Array<{ label: string; value: string; strong?: boolean }> }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500">{row.label}</dt>
          <dd className={`text-right text-slate-900 ${row.strong ? "font-bold" : "font-medium"}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
