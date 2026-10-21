// Zona fija (Lima) para que el servidor y el navegador muestren la misma fecha.
const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Lima",
});

export function formatSolicitudDate(value: string): string {
  // Las fechas sin hora (yyyy-mm-dd) se tratan como mediodía UTC para no correrse de día.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return dateFormatter.format(date);
}
