export type ClientSolicitudStatus = "enviada" | "aceptada" | "rechazada" | "cancelada" | "expirada";

export interface ClientSolicitud {
  id: string;
  title: string;
  description: string;
  category: string;
  desiredDate: string | null;
  status: ClientSolicitudStatus;
  rejectionReason: string | null;
  createdAt: string;
  plan: { name: string; tier: string; price: number };
  freelancer: { id: string; name: string; initials: string; specialty: string };
}
