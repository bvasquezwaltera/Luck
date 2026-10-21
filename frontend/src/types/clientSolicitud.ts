export type ClientSolicitudStatus = "enviada" | "aceptada" | "rechazada" | "cancelada" | "expirada";

export interface SolicitudAttachmentInfo {
  id: string;
  name: string;
  type: "pdf" | "image";
  size: string;
}

export interface SolicitudPlanInfo {
  name: string;
  tier: string;
  price: number;
  activeProjects: string;
  revisions: string;
}

export interface ClientSolicitud {
  id: string;
  title: string;
  description: string;
  characteristics: string[];
  category: string;
  desiredDate: string | null;
  status: ClientSolicitudStatus;
  rejectionReason: string | null;
  createdAt: string;
  plan: SolicitudPlanInfo;
  attachments: SolicitudAttachmentInfo[];
  freelancer: { id: string; name: string; initials: string; specialty: string };
}
