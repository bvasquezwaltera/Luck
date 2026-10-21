import type {
  ClientSolicitudStatus,
  SolicitudAttachmentInfo,
  SolicitudPlanInfo,
} from "@/types/clientSolicitud";

export interface ReceivedSolicitud {
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
  client: { id: string; name: string; initials: string; country: string };
}
