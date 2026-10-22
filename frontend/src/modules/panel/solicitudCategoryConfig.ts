import { Building2, Code2, Megaphone, Palette, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SolicitudCategory } from "@/types/solicitud";

// Icono y color de cada categoría; lo usan las listas de solicitudes del freelancer y del cliente.
export const solicitudCategoryConfig: Record<
  SolicitudCategory,
  { icon: LucideIcon; label: string; className: string }
> = {
  desarrollo: { icon: Code2, label: "Desarrollo", className: "!bg-indigo-100 !text-indigo-600" },
  movil: { icon: Smartphone, label: "Móvil", className: "!bg-emerald-100 !text-emerald-600" },
  diseno: { icon: Palette, label: "Diseño", className: "!bg-violet-100 !text-violet-600" },
  marketing: { icon: Megaphone, label: "Marketing", className: "!bg-amber-100 !text-amber-600" },
  arquitectura: { icon: Building2, label: "Arquitectura", className: "!bg-sky-100 !text-sky-600" },
  hogar: { icon: Building2, label: "Hogar", className: "!bg-slate-100 !text-slate-700" },
  restaurantes: { icon: Building2, label: "Restaurantes", className: "!bg-rose-100 !text-rose-600" },
  moda: { icon: Palette, label: "Moda", className: "!bg-pink-100 !text-pink-600" },
  reposteria: { icon: Palette, label: "Repostería", className: "!bg-amber-50 !text-amber-600" },
  servicios_generales: { icon: Building2, label: "Servicios", className: "!bg-slate-50 !text-slate-600" },
};
