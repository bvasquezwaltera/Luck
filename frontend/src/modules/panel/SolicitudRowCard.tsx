import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type RowTone = "emerald" | "amber" | "indigo" | "slate" | "red";

// Franja lateral y píldora de estado según el estado de la solicitud.
export const ROW_TONES: Record<RowTone, { bar: string; pill: string; dot: string }> = {
  emerald: { bar: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  amber: { bar: "bg-amber-400", pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  indigo: { bar: "bg-indigo-500", pill: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  slate: { bar: "bg-slate-300", pill: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  red: { bar: "bg-red-400", pill: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

export interface RowFact {
  icon: LucideIcon;
  label: string;
}

export interface RowDetail {
  label: string;
  value: string;
}

// Fila de una solicitud, igual para el cliente y el freelancer: estado con color, el dato que importa a la
// derecha (precio y, si hay contrato, lo cobrado) y los botones de acción según el estado.
export function SolicitudRowCard({
  tone,
  statusLabel,
  title,
  categoryIcon: CategoryIcon,
  categoryClassName,
  person,
  planLine,
  description,
  facts,
  footer,
  price,
  details,
  actions,
}: {
  tone: RowTone;
  statusLabel: string;
  title: string;
  categoryIcon: LucideIcon;
  categoryClassName: string;
  person: { name: string; initials: string };
  planLine: string;
  description: string;
  facts: RowFact[];
  footer: string;
  price: { amount: string; period?: string };
  details: RowDetail[];
  actions: ReactNode;
}) {
  const colors = ROW_TONES[tone];

  return (
    <article className="relative border-b border-slate-100 py-5 pl-5 pr-4 transition last:border-b-0 hover:bg-slate-50/50 sm:py-6 sm:pl-6 sm:pr-6">
      <span className={`absolute left-0 top-0 h-full w-1 ${colors.bar}`} aria-hidden="true" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${categoryClassName}`}>
            <CategoryIcon className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h3 className="min-w-0 text-base font-semibold text-slate-900 sm:truncate sm:text-lg">{title}</h3>
              <span
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${colors.pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                {statusLabel}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                {person.initials}
              </span>
              <span className="font-medium text-slate-700">{person.name}</span>
              <span className="text-slate-300">·</span>
              <span>{planLine}</span>
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>

            {facts.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {facts.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 text-xs text-slate-400">{footer}</p>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70">
          <p className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{price.amount}</span>
            {price.period && <span className="text-xs text-slate-500">{price.period}</span>}
          </p>

          {details.length > 0 && (
            <dl className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 text-xs">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-slate-500">{detail.label}</dt>
                  <dd className="text-right font-semibold text-slate-800">{detail.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-4 flex flex-col gap-2">{actions}</div>
        </div>
      </div>
    </article>
  );
}
