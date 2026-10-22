"use client";

import { useRouter } from "next/navigation";
import { LogOut, type LucideIcon } from "lucide-react";
import { PanelBrandHeader } from "@/modules/panel/PanelBrandHeader";
import { signOut } from "@/lib/api/client/auth";

export interface PanelMenuItem<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
  // Número pendiente (p. ej. mensajes sin leer); con 0 o sin valor no se muestra nada.
  badge?: number;
  // Sección que todavía no tiene contenido: se ve en el menú, pero no se puede abrir.
  disabled?: boolean;
}

// Un elemento del menú; lo usan el menú lateral y el panel del menú móvil.
export function PanelNavButton<T extends string>({
  item,
  active,
  onClick,
}: {
  item: PanelMenuItem<T>;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={item.disabled ? undefined : onClick}
      disabled={item.disabled}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition ${
        item.disabled
          ? "cursor-not-allowed text-gray-300"
          : active
            ? "bg-indigo-600 text-white"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{item.label}</span>
      {item.disabled && (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400">Próximamente</span>
      )}
      {item.badge ? (
        <span
          aria-label={`${item.badge} sin leer`}
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
            active ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
          }`}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      ) : null}
    </button>
  );
}

export function PanelSidebar<T extends string>({
  menuItems,
  activeSection,
  onSectionChange,
  showHeader = false,
  className = "",
}: {
  menuItems: PanelMenuItem<T>[];
  activeSection: T;
  onSectionChange: (section: T) => void;
  showHeader?: boolean;
  className?: string;
}) {
  const router = useRouter();

  return (
    <aside className={`${showHeader ? "hidden lg:flex" : "flex"} flex-col lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto ${className}`}>
      {showHeader && <PanelBrandHeader className="px-5 py-5" />}

      <nav className={showHeader ? "flex-1 space-y-1 px-3 pb-4" : "space-y-2"}>
        {menuItems.map((item) => {
          const isActive = item.id === activeSection;

          return <PanelNavButton key={item.id} item={item} active={isActive} onClick={() => onSectionChange(item.id)} />;
        })}
      </nav>

      {showHeader && (
        <div className="border-t border-slate-200 px-3 py-4">
          <button
            type="button"
            onClick={() => signOut().then(() => router.push("/login"))}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </aside>
  );
}
