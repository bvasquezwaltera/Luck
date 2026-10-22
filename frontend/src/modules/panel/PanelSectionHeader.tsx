import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface HeaderStat {
  label: string;
  value: number;
  tone?: "amber" | "emerald" | "indigo";
}

const STAT_TONES = {
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  indigo: "bg-indigo-50 text-indigo-700",
} as const;

export function PanelSectionHeader({
  subtitle,
  title,
  actions,
  icon: Icon,
  stats,
  size = "lg",
}: {
  subtitle: string;
  title: string;
  actions?: ReactNode;
  icon?: LucideIcon;
  stats?: HeaderStat[];
  size?: "lg" | "xl";
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          {size === "xl" ? (
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          ) : (
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          )}
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {stats && stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {stats.map((stat) => (
            <span
              key={stat.label}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                STAT_TONES[stat.tone ?? "indigo"]
              }`}
            >
              <span className="text-sm font-bold">{stat.value}</span>
              {stat.label}
            </span>
          ))}
        </div>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
