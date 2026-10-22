import type { RowTone } from "@/modules/panel/SolicitudRowCard";
import type { DeliveryApiStatus } from "@/types/deliveryApi";

export type DeliveryViewer = "freelancer" | "client";

// Color y texto del estado de una entrega según quién la mira: el color de aviso (ámbar) se reserva
// para lo que le toca hacer a quien mira.
export function deliveryStatusFor(status: DeliveryApiStatus, viewer: DeliveryViewer): { tone: RowTone; label: string } {
  switch (status) {
    case "pendiente":
      return { tone: "slate", label: "Nueva" };
    case "en_revision":
      return viewer === "client"
        ? { tone: "amber", label: "Esperando tu revisión" }
        : { tone: "indigo", label: "En revisión del cliente" };
    case "cambios_solicitados":
      return viewer === "freelancer"
        ? { tone: "amber", label: "Cambios solicitados" }
        : { tone: "indigo", label: "Esperando el nuevo avance" };
    case "aprobada":
      return { tone: "emerald", label: "Culminado" };
  }
}

// "Vence hoy", "Vence en 3 días", "Venció hace 2 días". Las fechas son yyyy-mm-dd, sin hora.
export function dueDateHint(dueDateValue: string, today = new Date()): { text: string; overdue: boolean } {
  const [year, month, day] = dueDateValue.split("-").map(Number);
  const due = Date.UTC(year, month - 1, day);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((due - now) / 86_400_000);

  if (days === 0) return { text: "Vence hoy", overdue: false };
  if (days === 1) return { text: "Vence mañana", overdue: false };
  if (days > 1) return { text: `Vence en ${days} días`, overdue: false };
  if (days === -1) return { text: "Venció ayer", overdue: true };
  return { text: `Venció hace ${Math.abs(days)} días`, overdue: true };
}
