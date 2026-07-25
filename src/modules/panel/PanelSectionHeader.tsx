import type { ReactNode } from "react";

export function PanelSectionHeader({
  subtitle,
  title,
  actions,
  size = "lg",
}: {
  subtitle: string;
  title: string;
  actions?: ReactNode;
  size?: "lg" | "xl";
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-slate-500">{subtitle}</p>
        {size === "xl" ? (
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        ) : (
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
