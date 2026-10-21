import type {
  ClientSolicitudStatus,
  SolicitudAttachmentInfo,
  SolicitudPlanInfo,
} from "@/types/clientSolicitud";
import type { SolicitudPaymentInfo } from "@/types/payment";

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
  payment: SolicitudPaymentInfo | null;
  client: { id: string; name: string; initials: string; country: string };
}
