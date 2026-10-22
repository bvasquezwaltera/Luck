import { apiFetch } from "@/lib/api/httpClient";
import type { ChatMessage, Conversation } from "@/types/message";

async function readError(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) return "Tu sesión expiró. Inicia sesión de nuevo.";
  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
  return typeof body?.detail === "string" ? body.detail : fallback;
}

// Las lecturas devuelven null si fallan: la pantalla conserva lo que ya tenía en vez de vaciarse.
export async function fetchConversations(): Promise<Conversation[] | null> {
  const response = await apiFetch("/api/messages/conversations").catch(() => null);
  return response?.ok ? ((await response.json()) as Conversation[]) : null;
}

export async function fetchMessages(contractId: string): Promise<ChatMessage[] | null> {
  const response = await apiFetch(`/api/messages/conversations/${contractId}/messages`).catch(() => null);
  return response?.ok ? ((await response.json()) as ChatMessage[]) : null;
}

// Avisa al resto de la pantalla (p. ej. la insignia del menú) de que cambió lo que hay sin leer.
export const MESSAGES_CHANGED_EVENT = "luck:messages-changed";

export async function markConversationRead(contractId: string): Promise<void> {
  await apiFetch(`/api/messages/conversations/${contractId}/read`, { method: "POST" }).catch(() => null);
  window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT));
}

export async function fetchUnreadCount(): Promise<number | null> {
  const response = await apiFetch("/api/messages/unread-count").catch(() => null);
  return response?.ok ? ((await response.json()) as { count: number }).count : null;
}

export async function sendMessage(
  contractId: string,
  input: { text: string; file: File | null },
): Promise<{ message?: ChatMessage; error?: string }> {
  const body = new FormData();
  body.set("text", input.text);
  if (input.file) body.set("file", input.file);

  const response = await apiFetch(`/api/messages/conversations/${contractId}/messages`, { method: "POST", body }).catch(
    () => null,
  );
  if (!response) return { error: "No se pudo conectar. Revisa tu conexión." };
  if (!response.ok) return { error: await readError(response, "No se pudo enviar el mensaje.") };
  return { message: (await response.json()) as ChatMessage };
}

// Igual que en las entregas: la pestaña se abre antes de pedir el enlace para que no la bloqueen.
export async function openMessageAttachment(contractId: string, messageId: string): Promise<{ error?: string }> {
  const tab = window.open("", "_blank");
  const response = await apiFetch(`/api/messages/conversations/${contractId}/messages/${messageId}/attachment-url`);

  if (!response.ok) {
    tab?.close();
    return { error: await readError(response, "No se pudo abrir el archivo.") };
  }

  const { url } = (await response.json()) as { url: string };
  if (tab) tab.location.href = url;
  else window.location.href = url;
  return {};
}
