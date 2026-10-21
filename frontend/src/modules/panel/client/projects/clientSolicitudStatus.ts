import type { RowTone } from "@/modules/panel/SolicitudRowCard";
import type { ClientSolicitudStatus } from "@/types/clientSolicitud";

// Color y texto del estado visto por el cliente (lista y detalle usan lo mismo).
export const CLIENT_TONE: Record<ClientSolicitudStatus, RowTone> = {
  enviada: "amber",
  aceptada: "indigo",
  contratada: "emerald",
  rechazada: "red",
  cancelada: "slate",
  expirada: "slate",
};

export const CLIENT_LABEL: Record<ClientSolicitudStatus, string> = {
  enviada: "Enviada · esperando respuesta",
  aceptada: "Aceptada · falta tu pago",
  contratada: "Contratada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
  expirada: "Expirada",
};

// El botón de pagar solo se habilita con la solicitud aceptada; en los demás estados explica por qué no.
export function payHint(status: ClientSolicitudStatus): string {
  if (status === "enviada") return "Disponible cuando el freelancer acepte tu solicitud";
  if (status === "aceptada") return "Pagar para activar el contrato";
  if (status === "contratada") return "Ya pagaste esta solicitud";
  return "Esta solicitud no se puede pagar";
}
