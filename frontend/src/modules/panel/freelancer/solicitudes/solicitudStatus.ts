import type { RowTone } from "@/modules/panel/SolicitudRowCard";
import type { Solicitud } from "@/types/solicitud";

// Estado visible para el freelancer: color y texto de la píldora (lista y detalle usan lo mismo).
export function statusFor(solicitud: Solicitud): { tone: RowTone; label: string } {
  if (solicitud.contracted) return { tone: "emerald", label: "Contratada" };
  if (solicitud.rejected) return { tone: "red", label: "Rechazada" };
  if (solicitud.status === "nueva") return { tone: "amber", label: "Nueva · por responder" };
  if (solicitud.status === "respondida") return { tone: "indigo", label: "Aceptada · pendiente de pago" };
  return { tone: "slate", label: "Archivada" };
}
