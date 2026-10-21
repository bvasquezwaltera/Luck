// Mismos límites que el backend (backend/app/services/storage_service.py); allí se vuelven a validar.
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
export const ATTACHMENT_ACCEPT = ALLOWED_ATTACHMENT_EXTENSIONS.join(",");

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

// Devuelve los archivos que se pueden agregar y el primer motivo por el que se rechazó alguno.
export function pickAttachments(
  current: File[],
  incoming: File[],
): { accepted: File[]; error: string } {
  const accepted = [...current];
  let error = "";

  for (const file of incoming) {
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(extensionOf(file.name))) {
      error ||= `«${file.name}»: solo se permiten PDF, PNG, JPG o WEBP.`;
    } else if (file.size === 0) {
      error ||= `«${file.name}» está vacío.`;
    } else if (file.size > MAX_ATTACHMENT_BYTES) {
      error ||= `«${file.name}» supera el límite de ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} MB.`;
    } else if (accepted.length >= MAX_ATTACHMENTS) {
      error ||= `Puedes adjuntar hasta ${MAX_ATTACHMENTS} archivos.`;
    } else if (accepted.some((value) => value.name === file.name && value.size === file.size)) {
      continue;
    } else {
      accepted.push(file);
    }
  }

  return { accepted, error };
}
