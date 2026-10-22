import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Piezas visuales que comparten todos los bloques del perfil: no guardan ni cambian datos, solo dan la
// misma forma a las tarjetas, a los botones de quitar y de agregar.

export function ProfileCard({
  icon: Icon,
  title,
  description,
  count,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
        {count !== undefined && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{count}</span>
        )}
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

// Subtarjeta de un elemento editable (una experiencia, una formación, una categoría).
export function EntryCard({
  title,
  onRemove,
  removeLabel,
  children,
}: {
  title: string;
  onRemove: () => void;
  removeLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50/70 p-4 ring-1 ring-inset ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <RemoveIconButton onClick={onRemove} label={removeLabel} />
      </div>
      {children}
    </div>
  );
}

export function RemoveIconButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function AddItemButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
    >
      <Plus className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
