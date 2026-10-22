export interface PaymentReceipt {
  id: string;
  solicitudId: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  status: "aprobado" | "rechazado";
  paidAt: string;
  contractStartedAt: string;
  nextChargeAt: string;
}

// Pago aprobado y próximo cobro de una solicitud ya contratada.
export interface SolicitudPaymentInfo {
  reference: string;
  amount: number;
  net?: number | null; // solo lo recibe el freelancer
  paidAt: string;
  nextChargeAt: string;
}

// Un pago de la lista de Pagos. La comisión solo viene para el freelancer.
export interface PaymentRecord {
  id: string;
  solicitudId: string;
  solicitudTitle: string;
  planName: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  status: "aprobado" | "rechazado";
  rejectionReason: string | null;
  createdAt: string;
  counterpart: { id: string; name: string; initials: string };
  commissionRate: number | null;
  commission: number | null;
  net: number | null;
}

export interface ClientPaymentSummary {
  activeContracts: number;
  monthlySpend: number;
  nextChargeAt: string | null;
}

export interface FreelancerPaymentSummary {
  commissionRate: number;
  totalGross: number;
  totalCommission: number;
  totalNet: number;
  activeContracts: number;
  monthlyNet: number;
  nextChargeAt: string | null;
}
