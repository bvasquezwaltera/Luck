import { apiFetch } from "@/lib/api/httpClient";

// Descarga el comprobante en PDF. Se pide con la sesión (no es un enlace público) y se entrega al navegador
// como archivo.
export async function downloadReceipt(paymentId: string, reference: string): Promise<{ error?: string }> {
  const response = await apiFetch(`/api/payments/${paymentId}/receipt`);
  if (!response.ok) {
    return { error: response.status === 401 ? "Tu sesión expiró. Inicia sesión de nuevo." : "No se pudo descargar el comprobante." };
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = `comprobante-${reference}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return {};
}
