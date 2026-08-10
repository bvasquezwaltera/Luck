import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import type { DeliveryModule } from "@/types/deliveryModule";

export const statusConfig = {
  Nueva: {
    icon: Circle,
    badgeClassName: "!bg-slate-100 !text-slate-500",
    iconClassName: "bg-slate-100 text-slate-500",
    barClassName: "bg-slate-300",
  },
  "En proceso": {
    icon: Clock3,
    badgeClassName: "!bg-amber-50 !text-amber-600",
    iconClassName: "bg-amber-50 text-amber-600",
    barClassName: "bg-gradient-to-r from-amber-500 to-amber-400",
  },
  Culminado: {
    icon: CheckCircle2,
    badgeClassName: "!bg-emerald-50 !text-emerald-600",
    iconClassName: "bg-emerald-50 text-emerald-600",
    barClassName: "bg-gradient-to-r from-emerald-600 to-emerald-400",
  },
} satisfies Record<
  DeliveryModule["status"],
  { icon: typeof Circle; badgeClassName: string; iconClassName: string; barClassName: string }
>;

const categoryColorPalette = [
  "!bg-indigo-50 !text-indigo-600",
  "!bg-violet-50 !text-violet-600",
  "!bg-sky-50 !text-sky-600",
  "!bg-amber-50 !text-amber-600",
  "!bg-rose-50 !text-rose-600",
  "!bg-emerald-50 !text-emerald-600",
];

export function getCategoryBadgeClassName(category: string) {
  let hash = 0;
  for (let index = 0; index < category.length; index += 1) {
    hash = (hash * 31 + category.charCodeAt(index)) >>> 0;
  }
  return categoryColorPalette[hash % categoryColorPalette.length];
}
