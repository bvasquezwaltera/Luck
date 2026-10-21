import type { DeliveryApiStatus } from "@/types/deliveryApi";

export interface DeliveryAttachment {
  id: string;
  name: string;
  size?: string;
  url?: string;
}

export interface ClientFeedbackEntry {
  id: string;
  createdAt?: string; // fecha real (ISO), para ordenar el hilo
  type: "approved" | "changes-requested";
  comment: string;
  attachments: DeliveryAttachment[];
  timestamp: string;
}

export interface AdvanceEntry {
  id: string;
  createdAt?: string; // fecha real (ISO), para ordenar el hilo
  progress?: number;
  note: string;
  attachments: DeliveryAttachment[];
  timestamp: string;
}

export interface DeliveryModule {
  id: string;
  title: string;
  description: string;
  clientName: string;
  freelancerName: string;
  requestTitle: string;
  category: string;
  progress: number;
  status: "Nueva" | "En proceso" | "Culminado";
  dueDate: string;
  dueDateValue: string;
  nextMilestone: string;
  objectives: string[];
  advanceHistory?: AdvanceEntry[];
  clientFeedback?: ClientFeedbackEntry[];
  // Solo en entregas reales (backend): a qué contrato pertenece y su estado exacto.
  contractId?: string;
  apiStatus?: DeliveryApiStatus;
}
