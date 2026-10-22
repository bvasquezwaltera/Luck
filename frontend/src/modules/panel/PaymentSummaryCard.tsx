import type { ReactNode } from "react";

// Cada tarjeta lleva su icono en un recuadro de color suave: la tarjeta sigue siendo blanca, pero se
// distinguen de un vistazo.
const TILE_TONES = {
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  indigo: "bg-indigo-50 text-indigo-600",
  sky: "bg-sky-50 text-sky-600",
};

export function PaymentSummaryCard({
  label,
  value,
  hint,
  icon,
  tone = "indigo",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  tone?: keyof typeof TILE_TONES;
}) {
  return (
    <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TILE_TONES[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      <p className="mt-1 min-h-4 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
