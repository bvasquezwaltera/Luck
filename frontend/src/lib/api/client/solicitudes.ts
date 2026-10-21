import { apiFetch } from "@/lib/api/httpClient";

export interface CreateSolicitudInput {
  freelancerId: string;
  planId: string;
  title: string;
  description: string;
  desiredDate?: string;
}

export async function createSolicitud(input: CreateSolicitudInput): Promise<{ error?: string }> {
  const response = await apiFetch("/api/solicitudes", {
    method: "POST",
    body: JSON.stringify({ ...input, desiredDate: input.desiredDate || null }),
  });

  if (response.ok) return {};

  if (response.status === 401) return { error: "Tu sesión expiró. Inicia sesión de nuevo." };
  if (response.status === 403) return { error: "Solo las cuentas de cliente pueden enviar solicitudes." };

  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
  return {
    error: typeof body?.detail === "string" ? body.detail : "No se pudo enviar la solicitud.",
  };
}
