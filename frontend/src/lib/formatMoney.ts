export function formatMoney(value: number, currency = "USD"): string {
  return `$${value.toFixed(2)}${currency === "USD" ? "" : ` ${currency}`}`;
}
