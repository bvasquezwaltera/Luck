export type SolicitudStatus = "nueva" | "sin_responder" | "respondida" | "archivada";
export type SolicitudCategory = "desarrollo" | "movil" | "diseno" | "marketing" | "arquitectura";

export interface SolicitudAttachment {
  id: string;
  name: string;
  type: "pdf" | "image" | "link";
  size?: string;
}

export interface SolicitudMilestone {
  id: string;
  title: string;
  description: string;
}

export interface Solicitud {
  id: string;
  titulo: string;
  clienteName: string;
  clienteInitials: string;
  planName: string;
  category: SolicitudCategory;
  description: string;
  characteristics: string[];
  attachments: SolicitudAttachment[];
  status: SolicitudStatus;
  enviado: string; // "Hace X horas/días"
  revisiones: number;
  requestedDeliveries: number;
  requestedMilestones: SolicitudMilestone[];
}
