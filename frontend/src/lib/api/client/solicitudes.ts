import { apiFetch } from "@/lib/api/httpClient";
import type { PaymentReceipt } from "@/types/payment";
import type { ReceivedSolicitud } from "@/types/receivedSolicitud";

export interface CreateSolicitudInput {
  freelancerId: string;
  planId: string;
  title: string;
  description: string;
  desiredDate?: string;
  characteristics: string[];
  files: File[];
}

async function readError(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) return "Tu sesión expiró. Inicia sesión de nuevo.";

  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
  return typeof body?.detail === "string" ? body.detail : fallback;
}

export async function createSolicitud(input: CreateSolicitudInput): Promise<{ error?: string }> {
  // multipart/form-data: lleva texto y archivos en la misma petición.
  const body = new FormData();
  body.set("freelancerId", input.freelancerId);
  body.set("planId", input.planId);
  body.set("title", input.title);
  body.set("description", input.description);
  if (input.desiredDate) body.set("desiredDate", input.desiredDate);
  input.characteristics.forEach((item) => body.append("characteristics", item));
  input.files.forEach((file) => body.append("files", file));

  const response = await apiFetch("/api/solicitudes", { method: "POST", body });

  if (response.ok) return {};
  if (response.status === 403) return { error: "Solo las cuentas de cliente pueden enviar solicitudes." };
  return { error: await readError(response, "No se pudo enviar la solicitud.") };
}

interface DecisionResult {
  solicitud?: ReceivedSolicitud;
  error?: string;
}

export async function acceptSolicitud(id: string): Promise<DecisionResult> {
  const response = await apiFetch(`/api/solicitudes/${id}/accept`, { method: "POST" });
  if (response.ok) return { solicitud: (await response.json()) as ReceivedSolicitud };
  return { error: await readError(response, "No se pudo aceptar la solicitud.") };
}

export async function rejectSolicitud(id: string, reason: string): Promise<DecisionResult> {
  const response = await apiFetch(`/api/solicitudes/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason: reason.trim() || null }),
  });
  if (response.ok) return { solicitud: (await response.json()) as ReceivedSolicitud };
  return { error: await readError(response, "No se pudo rechazar la solicitud.") };
}

// Abre un adjunto en una pestaña nueva con un enlace temporal. La pestaña se abre antes de
// pedir el enlace: si se abriera después de la espera, el navegador la bloquearía como emergente.
export async function openAttachment(solicitudId: string, attachmentId: string): Promise<{ error?: string }> {
  const tab = window.open("", "_blank");
  const response = await apiFetch(`/api/solicitudes/${solicitudId}/attachments/${attachmentId}/url`);

  if (!response.ok) {
    tab?.close();
    return { error: await readError(response, "No se pudo abrir el archivo.") };
  }

  const { url } = (await response.json()) as { url: string };
  if (tab) tab.location.href = url;
  else window.location.href = url;
  return {};
}

// Cobro de una solicitud aceptada. Hoy es simulado; los datos de la tarjeta nunca salen de la pantalla.
export async function paySolicitud(id: string): Promise<{ receipt?: PaymentReceipt; error?: string }> {
  const response = await apiFetch(`/api/solicitudes/${id}/pay`, { method: "POST", body: JSON.stringify({}) });

  if (response.ok) return { receipt: (await response.json()) as PaymentReceipt };
  if (response.status === 403) return { error: "Solo las cuentas de cliente pueden pagar." };
  return { error: await readError(response, "No se pudo procesar el pago.") };
}
