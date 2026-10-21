import type { ReactNode } from "react";

export function PaymentSummaryCard({
  label,
  value,
  hint,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border p-5 shadow-sm ${
        highlight ? "border-indigo-200 bg-indigo-50/60" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-slate-500">
        <span className="text-indigo-500">{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
