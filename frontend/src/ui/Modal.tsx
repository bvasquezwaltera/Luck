"use client";

import type { ReactNode } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

const SIZE_CLASSES = {
  sm: "max-w-md", // para confirmaciones
  md: "max-w-2xl",
  xl: "max-w-4xl", // para modales con dos columnas
};

export function Modal({
  open,
  onClose,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: keyof typeof SIZE_CLASSES;
}) {
  // La página de atrás no se mueve mientras el modal está abierto.
  useScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro y desenfocado: lo de atrás no se distingue. */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <div className={`relative max-h-[90vh] w-full ${SIZE_CLASSES[size]} overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        {/* overscroll-contain: si el modal llega al final, la rueda no pasa a mover la página. */}
        <div className="max-h-[90vh] overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
