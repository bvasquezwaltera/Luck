import type { Solicitud, SolicitudAttachment, SolicitudCategory, SolicitudMilestone, SolicitudStatus } from "@/types/solicitud";

const STORAGE_KEY = "luck_client_solicitudes";

function normalizeAttachment(fileName: string): SolicitudAttachment {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const type = extension.match(/^(png|jpe?g|gif|svg)$/)
    ? "image"
    : extension === "pdf"
    ? "pdf"
    : "link";

  return {
    id: `att-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: fileName,
    type,
    size: "--",
  };
}

function createDefaultMilestones(deliveries: number): SolicitudMilestone[] {
  return Array.from({ length: deliveries }, (_, index) => ({
    id: `m-client-${Date.now()}-${index}`,
    title: `Entrega ${index + 1}`,
    description:
      index === 0
        ? "Primera entrega con propuesta inicial y revisión de alcance."
        : index === deliveries - 1
        ? "Entrega final con ajustes y documentación."
        : "Entrega intermedia con avances y ajustes según el cliente.",
  }));
}

export function loadStoredSolicitudes(): Solicitud[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Solicitud[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type StoredSolicitudInput = {
  titulo: string;
  description: string;
  category: SolicitudCategory;
  planName: string;
  requestedDeliveries: number;
  characteristics: string;
  attachmentNames: string[];
  targetFreelancerName?: string;
  targetFreelancerRole?: string;
  desiredDate?: string;
};

export function storeSolicitud(solicitud: StoredSolicitudInput) {
  if (typeof window === "undefined") return;

  const savedSolicitudes = loadStoredSolicitudes();
  const clientSolicitud: Solicitud = {
    id: `sol-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    titulo: solicitud.titulo,
    clienteName: "Cliente",
    clienteInitials: "CL",
    planName: solicitud.planName,
    category: solicitud.category,
    description: solicitud.description,
    characteristics: solicitud.characteristics
      ? solicitud.characteristics.split("\n").map((item) => item.trim()).filter(Boolean)
      : [],
    attachments: solicitud.attachmentNames.map(normalizeAttachment),
    status: "nueva",
    enviado: "Hace unos segundos",
    revisiones: 1,
    requestedDeliveries: solicitud.requestedDeliveries,
    requestedMilestones: createDefaultMilestones(solicitud.requestedDeliveries),
    desiredDate: solicitud.desiredDate,
    // If the stored input included a target freelancer, map to the optional fields
    targetFreelancerName: solicitud.targetFreelancerName,
    targetFreelancerRole: solicitud.targetFreelancerRole,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([clientSolicitud, ...savedSolicitudes]));
}

export function clearStoredSolicitudes() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
