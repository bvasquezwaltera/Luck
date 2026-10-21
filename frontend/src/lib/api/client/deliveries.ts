import { apiFetch } from "@/lib/api/httpClient";
import type { ContractDeliveries } from "@/types/deliveryApi";

// Todas las acciones devuelven la lista actualizada de contratos: la pantalla la usa tal cual.
interface Result {
  contracts?: ContractDeliveries[];
  error?: string;
}

async function readError(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) return "Tu sesión expiró. Inicia sesión de nuevo.";
  if (response.status === 403) return "Tu cuenta no puede hacer esta acción.";
  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
  return typeof body?.detail === "string" ? body.detail : fallback;
}

async function toResult(response: Response, fallback: string): Promise<Result> {
  if (response.ok) return { contracts: (await response.json()) as ContractDeliveries[] };
  return { error: await readError(response, fallback) };
}

export async function createDelivery(
  contractId: string,
  input: { title: string; description: string; dueDate: string; objectives: string[] },
): Promise<Result> {
  const response = await apiFetch(`/api/deliveries/contracts/${contractId}/items`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return toResult(response, "No se pudo crear la entrega.");
}

export async function deleteDelivery(deliveryId: string): Promise<Result> {
  const response = await apiFetch(`/api/deliveries/items/${deliveryId}`, { method: "DELETE" });
  return toResult(response, "No se pudo eliminar la entrega.");
}

// multipart/form-data: lleva texto, archivos y enlaces en la misma petición.
function submission(fields: Record<string, string>, links: string[], files: File[]): FormData {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => body.set(key, value));
  links.forEach((link) => body.append("links", link));
  files.forEach((file) => body.append("files", file));
  return body;
}

export async function addAdvance(
  deliveryId: string,
  input: { note: string; progress: number; files: File[]; links: string[] },
): Promise<Result> {
  const body = submission({ note: input.note, progress: String(input.progress) }, input.links, input.files);
  const response = await apiFetch(`/api/deliveries/items/${deliveryId}/advances`, { method: "POST", body });
  return toResult(response, "No se pudo enviar el avance.");
}

export async function addReview(
  deliveryId: string,
  input: { type: "aprobado" | "cambios"; comment: string; files: File[]; links: string[] },
): Promise<Result> {
  const body = submission({ type: input.type, comment: input.comment }, input.links, input.files);
  const response = await apiFetch(`/api/deliveries/items/${deliveryId}/reviews`, { method: "POST", body });
  return toResult(response, "No se pudo enviar tu respuesta.");
}

// Abre un archivo en una pestaña nueva con un enlace temporal. La pestaña se abre antes de pedir el enlace:
// si se abriera después de la espera, el navegador la bloquearía como emergente.
export async function openDeliveryAttachment(deliveryId: string, attachmentId: string): Promise<{ error?: string }> {
  const tab = window.open("", "_blank");
  const response = await apiFetch(`/api/deliveries/items/${deliveryId}/attachments/${attachmentId}/url`);

  if (!response.ok) {
    tab?.close();
    return { error: await readError(response, "No se pudo abrir el archivo.") };
  }

  const { url } = (await response.json()) as { url: string };
  if (tab) tab.location.href = url;
  else window.location.href = url;
  return {};
}
