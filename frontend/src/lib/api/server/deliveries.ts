import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { ContractDeliveries } from "@/types/deliveryApi";

// null si el servidor falla: la pantalla avisa en vez de mostrar "sin entregas".
export async function getDeliveries(): Promise<ContractDeliveries[] | null> {
  try {
    const response = await apiFetchServer("/api/deliveries");
    return response.ok ? ((await response.json()) as ContractDeliveries[]) : null;
  } catch {
    return null;
  }
}
