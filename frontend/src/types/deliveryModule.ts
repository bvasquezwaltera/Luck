export interface DeliveryAttachment {
  id: string;
  name: string;
  size?: string;
  url?: string;
}

export interface ClientFeedbackEntry {
  id: string;
  type: "approved" | "changes-requested";
  comment: string;
  attachments: DeliveryAttachment[];
  timestamp: string;
}

export interface AdvanceEntry {
  id: string;
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
}
