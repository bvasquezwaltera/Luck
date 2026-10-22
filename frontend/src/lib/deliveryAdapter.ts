import { formatSolicitudDate, formatSolicitudDateTime } from "@/lib/formatSolicitudDate";
import type { ContractDeliveries, DeliveryAttachmentApi, DeliveryItemApi } from "@/types/deliveryApi";
import type { DeliveryAttachment, DeliveryModule } from "@/types/deliveryModule";

// Un proyecto es un contrato: agrupa las entregas que el freelancer planificó para ese cliente.
export interface DeliveryProject {
  contractId: string;
  title: string;
  counterpartName: string;
  category: string;
  revisionsLimit: number | null;
  revisionsUsed: number;
  modules: DeliveryModule[];
}

function toAttachment(attachment: DeliveryAttachmentApi): DeliveryAttachment {
  return {
    id: attachment.id,
    name: attachment.name,
    size: attachment.size ?? undefined,
    url: attachment.url ?? undefined,
  };
}

// Los tres estados del diseño (Nueva / En proceso / Culminado) agrupan los cuatro del servidor.
function toUiStatus(status: DeliveryItemApi["status"]): DeliveryModule["status"] {
  if (status === "pendiente") return "Nueva";
  if (status === "aprobada") return "Culminado";
  return "En proceso";
}

export function toDeliveryModule(contract: ContractDeliveries, item: DeliveryItemApi): DeliveryModule {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    clientName: contract.counterpart.name,
    freelancerName: contract.counterpart.name,
    requestTitle: contract.title,
    category: contract.category || "General",
    progress: item.progress,
    status: toUiStatus(item.status),
    dueDate: formatSolicitudDate(item.dueDate),
    dueDateValue: item.dueDate,
    nextMilestone: "",
    objectives: item.objectives,
    // El orden del hilo lo decide DeliveryThread, por la fecha real de cada entrada.
    advanceHistory: item.advances.map((advance) => ({
      id: advance.id,
      note: advance.note,
      progress: advance.progress,
      createdAt: advance.createdAt,
      attachments: advance.attachments.map(toAttachment),
      timestamp: formatSolicitudDateTime(advance.createdAt),
    })),
    clientFeedback: item.reviews.map((review) => ({
      id: review.id,
      type: review.type === "aprobado" ? ("approved" as const) : ("changes-requested" as const),
      comment: review.comment,
      createdAt: review.createdAt,
      attachments: review.attachments.map(toAttachment),
      timestamp: formatSolicitudDateTime(review.createdAt),
    })),
    contractId: contract.contractId,
    apiStatus: item.status,
  };
}

export function toDeliveryProjects(contracts: ContractDeliveries[]): DeliveryProject[] {
  return contracts.map((contract) => ({
    contractId: contract.contractId,
    title: contract.title,
    counterpartName: contract.counterpart.name,
    category: contract.category || "General",
    revisionsLimit: contract.revisionsLimit,
    revisionsUsed: contract.revisionsUsed,
    modules: contract.deliveries.map((item) => toDeliveryModule(contract, item)),
  }));
}
