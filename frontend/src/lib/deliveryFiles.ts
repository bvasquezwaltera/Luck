// Mismos límites que el backend (backend/app/services/storage_service.py); allí se vuelven a validar.
export const DELIVERY_MAX_FILES = 5;
export const DELIVERY_MAX_LINKS = 5;
export const DELIVERY_MAX_FILE_BYTES = 25 * 1024 * 1024;
export const DELIVERY_MAX_TOTAL_BYTES = 50 * 1024 * 1024;
export const DELIVERY_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".zip",
  ".docx",
  ".xlsx",
  ".pptx",
  ".txt",
  ".csv",
  ".md",
];
export const DELIVERY_ACCEPT = DELIVERY_EXTENSIONS.join(",");

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

const mb = (bytes: number) => bytes / (1024 * 1024);

// Devuelve los archivos que se pueden agregar y el primer motivo por el que se rechazó alguno.
export function pickDeliveryFiles(current: File[], incoming: File[]): { accepted: File[]; error: string } {
  const accepted = [...current];
  let total = accepted.reduce((sum, file) => sum + file.size, 0);
  let error = "";

  for (const file of incoming) {
    if (!DELIVERY_EXTENSIONS.includes(extensionOf(file.name))) {
      error ||= `«${file.name}»: formato no permitido. Usa PDF, imágenes, ZIP, Office, TXT, CSV o MD.`;
    } else if (file.size === 0) {
      error ||= `«${file.name}» está vacío.`;
    } else if (file.size > DELIVERY_MAX_FILE_BYTES) {
      error ||= `«${file.name}» supera el límite de ${mb(DELIVERY_MAX_FILE_BYTES)} MB.`;
    } else if (accepted.length >= DELIVERY_MAX_FILES) {
      error ||= `Puedes adjuntar hasta ${DELIVERY_MAX_FILES} archivos por envío.`;
    } else if (total + file.size > DELIVERY_MAX_TOTAL_BYTES) {
      error ||= `Los archivos de un envío no pueden superar ${mb(DELIVERY_MAX_TOTAL_BYTES)} MB en total.`;
    } else if (accepted.some((value) => value.name === file.name && value.size === file.size)) {
      continue;
    } else {
      accepted.push(file);
      total += file.size;
    }
  }
  return { accepted, error };
}

// Solo http y https: nada de javascript:, data: ni file:.
export function validateLink(value: string): string | null {
  const link = value.trim();
  if (!link) return "Pega un enlace.";
  if (link.length > 500) return "El enlace es demasiado largo.";
  try {
    const url = new URL(link);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocolo");
  } catch {
    return "El enlace debe empezar con http:// o https://.";
  }
  return null;
}

export interface PickedAttachments {
  files: File[];
  links: string[];
  // Lo que está escrito en el cuadro de enlace y aún no se agregó con el botón.
  pendingLink: string;
}

export const EMPTY_ATTACHMENTS: PickedAttachments = { files: [], links: [], pendingLink: "" };

// Al enviar, un enlace escrito pero sin agregar se incluye solo: si no, se perdería en silencio.
export function resolveAttachments(
  value: PickedAttachments,
): { files: File[]; links: string[]; error?: undefined } | { error: string } {
  const pending = value.pendingLink.trim();
  if (!pending) return { files: value.files, links: value.links };

  const problem = validateLink(pending);
  if (problem) return { error: `El enlace que escribiste no es válido. ${problem}` };
  if (value.links.includes(pending)) return { files: value.files, links: value.links };
  if (value.links.length >= DELIVERY_MAX_LINKS) {
    return { error: `Puedes agregar hasta ${DELIVERY_MAX_LINKS} enlaces por envío.` };
  }
  return { files: value.files, links: [...value.links, pending] };
}
