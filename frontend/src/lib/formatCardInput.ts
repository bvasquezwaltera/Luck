// Ayudas del formulario de pago de demostración. Los datos de tarjeta solo viven en la pantalla:
// nunca se envían al servidor ni se guardan.

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function formatCvc(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export interface CardFormValues {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
}

export type CardFormErrors = Partial<Record<keyof CardFormValues, string>>;

export function validateCardForm(values: CardFormValues, now = new Date()): CardFormErrors {
  const errors: CardFormErrors = {};

  if (!values.name.trim()) errors.name = "Escribe el nombre que aparece en la tarjeta.";

  const digits = values.number.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) errors.number = "El número de tarjeta no es válido.";

  const match = /^(\d{2})\/(\d{2})$/.exec(values.expiry);
  if (!match) {
    errors.expiry = "Usa el formato MM/AA.";
  } else {
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
    if (month < 1 || month > 12) errors.expiry = "El mes no es válido.";
    else if (expired) errors.expiry = "La tarjeta está vencida.";
  }

  if (!/^\d{3,4}$/.test(values.cvc)) errors.cvc = "El código debe tener 3 o 4 dígitos.";

  return errors;
}
