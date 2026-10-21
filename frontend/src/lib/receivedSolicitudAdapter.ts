import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { ReceivedSolicitud } from "@/types/receivedSolicitud";
import type { Solicitud, SolicitudCategory, SolicitudStatus } from "@/types/solicitud";

// Las categorías de los freelancers ("Desarrollo Web", "Diseño UI/UX"...) no coinciden con las
// del diseño del panel (solo para elegir icono y color); el texto original se muestra tal cual.
export function toPanelCategory(category: string): SolicitudCategory {
  const text = category.toLowerCase();
  if (/mobile|móvil|movil/.test(text)) return "movil";
  if (/dise[ñn]o|ui|ux/.test(text)) return "diseno";
  if (/marketing|community|redacci/.test(text)) return "marketing";
  if (/desarrollo|web|devops|datos/.test(text)) return "desarrollo";
  return "servicios_generales";
}

// enviada -> nueva · aceptada -> aceptada (el cliente debe pagar) · el resto -> archivada.
function toPanelStatus(status: ReceivedSolicitud["status"]): SolicitudStatus {
  if (status === "enviada") return "nueva";
  if (status === "aceptada") return "respondida";
  return "archivada";
}

export function toPanelSolicitud(received: ReceivedSolicitud): Solicitud {
  return {
    id: received.id,
    titulo: received.title,
    clienteName: received.client.name,
    clienteInitials: received.client.initials,
    planName: `Plan ${received.plan.name}`,
    category: toPanelCategory(received.category),
    categoryLabel: received.category || undefined,
    description: received.description,
    characteristics: received.characteristics,
    attachments: received.attachments,
    status: toPanelStatus(received.status),
    enviado: formatSolicitudDate(received.createdAt),
    revisiones: Number.parseInt(received.plan.revisions, 10) || 0,
    requestedDeliveries: 0,
    requestedMilestones: [],
    desiredDate: received.desiredDate ?? undefined,
    planProjects: received.plan.activeProjects || undefined,
    rejected: received.status === "rechazada",
    rejectionReason: received.rejectionReason ?? undefined,
  };
}
