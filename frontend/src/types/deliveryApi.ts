// Forma de lo que devuelve /api/deliveries (ver backend/app/schemas/delivery.py).
export type DeliveryApiStatus = "pendiente" | "en_revision" | "cambios_solicitados" | "aprobada";

export interface DeliveryAttachmentApi {
  id: string;
  name: string;
  type: "pdf" | "image" | "file" | "link";
  size: string | null;
  url: string | null; // solo los enlaces; los archivos se abren con un enlace temporal
}

export interface DeliveryAdvanceApi {
  id: string;
  note: string;
  progress: number;
  createdAt: string;
  attachments: DeliveryAttachmentApi[];
}

export interface DeliveryReviewApi {
  id: string;
  type: "aprobado" | "cambios";
  comment: string;
  createdAt: string;
  attachments: DeliveryAttachmentApi[];
}

export interface DeliveryItemApi {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  dueDate: string;
  status: DeliveryApiStatus;
  progress: number;
  createdAt: string;
  advances: DeliveryAdvanceApi[];
  reviews: DeliveryReviewApi[];
}

export interface ContractDeliveries {
  contractId: string;
  solicitudId: string;
  title: string;
  category: string;
  planName: string;
  startedAt: string;
  nextChargeAt: string;
  revisionsLimit: number | null; // null = el plan no limita las revisiones
  revisionsUsed: number;
  counterpart: { id: string; name: string; initials: string };
  deliveries: DeliveryItemApi[];
}
