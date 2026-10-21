const DAY_MS = 86_400_000;

// "Hoy", "Mañana", "Dentro de 30 días", "Hace 2 días". Cuenta días completos entre dos instantes.
export function describeDaysUntil(iso: string, now = Date.now()): string {
  const days = Math.ceil((new Date(iso).getTime() - now) / DAY_MS);

  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days > 1) return `Dentro de ${days} días`;
  if (days === -1) return "Ayer";
  return `Hace ${Math.abs(days)} días`;
}
