"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { PanelBrandHeader } from "@/modules/panel/PanelBrandHeader";
import { PanelNavButton, type PanelMenuItem } from "@/modules/panel/PanelSidebar";
import { signOut } from "@/lib/api/client/auth";
import { useScrollLock } from "@/hooks/useScrollLock";

const DESKTOP_MIN_WIDTH = 1024; // desde aquí se usa el menú lateral fijo (lg)

// En pantallas chicas: una barra con el botón de menú, que abre el mismo menú como panel que sale por la izquierda.
export function PanelMobileNav<T extends string>({
  menuItems,
  activeSection,
  onSectionChange,
}: {
  menuItems: PanelMenuItem<T>[];
  activeSection: T;
  onSectionChange: (section: T) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // La página de atrás no se mueve mientras el menú está abierto.
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && close();
    // Si la ventana crece hasta mostrar el menú fijo, este panel ya no tiene sentido.
    const onResize = () => window.innerWidth >= DESKTOP_MIN_WIDTH && close();
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  const activeLabel = menuItems.find((item) => item.id === activeSection)?.label ?? "";
  const pending = menuItems.reduce((total, item) => total + (item.badge ?? 0), 0);

  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={pending > 0 ? `Abrir menú (${pending} sin leer)` : "Abrir menú"}
          aria-expanded={open}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
          {pending > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-600" />}
        </button>
        <p className="text-sm font-semibold text-slate-900">{activeLabel}</p>
      </header>

      {/* Siempre montado para que la entrada y la salida se animen; cerrado, no recibe clics ni foco (inert). */}
      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} inert={!open} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={close}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className={`absolute inset-y-0 left-0 flex w-[82%] max-w-[300px] flex-col bg-white shadow-xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <PanelBrandHeader />
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar menú"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-4">
            {menuItems.map((item) => (
              <PanelNavButton
                key={item.id}
                item={item}
                active={item.id === activeSection}
                onClick={() => {
                  onSectionChange(item.id);
                  close();
                }}
              />
            ))}
          </nav>

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
        </aside>
      </div>
    </div>
  );
}
