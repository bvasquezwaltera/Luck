import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { ClientPaymentSummary, FreelancerPaymentSummary, PaymentRecord } from "@/types/payment";

// Devuelven null si el servidor falla, para que la pantalla avise en lugar de mostrar "sin pagos".
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await apiFetchServer(path);
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export const getMyPayments = () => getJson<PaymentRecord[]>("/api/payments/mine");
export const getClientPaymentSummary = () => getJson<ClientPaymentSummary>("/api/payments/mine/summary");
export const getReceivedPayments = () => getJson<PaymentRecord[]>("/api/payments/received");
export const getFreelancerPaymentSummary = () =>
  getJson<FreelancerPaymentSummary>("/api/payments/received/summary");
