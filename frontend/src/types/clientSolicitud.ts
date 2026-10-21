import type { SolicitudPaymentInfo } from "@/types/payment";

export type ClientSolicitudStatus =
  | "enviada"
  | "aceptada"
  | "contratada"
  | "rechazada"
  | "cancelada"
  | "expirada";

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
  payment: SolicitudPaymentInfo | null;
  freelancer: { id: string; name: string; initials: string; specialty: string };
}
