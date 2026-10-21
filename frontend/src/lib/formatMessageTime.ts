// Zona fija (Lima) para que el servidor y el navegador muestren la misma hora.
const TIME_ZONE = "America/Lima";
const timeFormatter = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIME_ZONE });
const dayFormatter = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", timeZone: TIME_ZONE });
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }); // yyyy-mm-dd

function dayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

// Dentro del chat: "14:05" si es de hoy, "Ayer, 14:05" o "12 oct, 14:05".
export function formatMessageTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const time = timeFormatter.format(date);
  if (dayKey(date) === dayKey(now)) return time;
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (dayKey(date) === dayKey(yesterday)) return `Ayer, ${time}`;
  return `${dayFormatter.format(date)}, ${time}`;
}

// En la lista de conversaciones: "14:05", "Ayer" o "12 oct".
export function formatConversationTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (dayKey(date) === dayKey(now)) return timeFormatter.format(date);
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (dayKey(date) === dayKey(yesterday)) return "Ayer";
  return dayFormatter.format(date);
}
