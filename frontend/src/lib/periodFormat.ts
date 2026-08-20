export const PRESENT = "Presente";

export function parsePeriod(period: string): { from: string; to: string } {
  const [from = "", to = ""] = period.split("–").map((part) => part.trim());
  return { from, to };
}

export function formatPeriod(from: string, to: string): string {
  if (!from) return "";
  return to ? `${from} – ${to}` : from;
}
