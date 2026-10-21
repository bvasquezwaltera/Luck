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
  paidAt: string;
  nextChargeAt: string;
}
