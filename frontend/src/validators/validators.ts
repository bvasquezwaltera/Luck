const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_REGEX = /[A-Z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'`~]/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function hasUppercase(value: string): boolean {
  return UPPERCASE_REGEX.test(value);
}

export function hasNumber(value: string): boolean {
  return NUMBER_REGEX.test(value);
}

export function hasSpecialChar(value: string): boolean {
  return SPECIAL_CHAR_REGEX.test(value);
}

// Field-level validators shared by every form that has a name/email/password
// field (login, register, and any future form), so each form's validate*Form
// function doesn't redefine the same "required" / "valid format" rules.

export const FULL_NAME_MIN_LENGTH = 3;
export const FULL_NAME_MAX_LENGTH = 120;
// Letras (con tildes, ñ, etc.), espacios y los signos de nombres reales: O'Brien, María-José, Jr.
const FULL_NAME_REGEX = /^\p{L}[\p{L}\s'’.-]*$/u;

// Misma regla que el backend (auth_validation.validate_full_name).
export function validateFullNameField(value: string): string | undefined {
  const name = value.trim();
  if (!name) {
    return "El nombre completo es obligatorio";
  }
  if (/\d/.test(name)) {
    return "El nombre no puede contener números";
  }
  if (name.length < FULL_NAME_MIN_LENGTH) {
    return `El nombre debe tener al menos ${FULL_NAME_MIN_LENGTH} caracteres`;
  }
  if (name.length > FULL_NAME_MAX_LENGTH) {
    return `El nombre no puede superar los ${FULL_NAME_MAX_LENGTH} caracteres`;
  }
  if (!FULL_NAME_REGEX.test(name)) {
    return "El nombre solo puede tener letras, espacios, apóstrofes, guiones y puntos";
  }
  return undefined;
}

export function validateEmailField(value: string): string | undefined {
  if (!value.trim()) {
    return "El correo electrónico es obligatorio";
  }
  if (!isValidEmail(value)) {
    return "Ingresa un correo electrónico válido";
  }
  return undefined;
}

export function validatePasswordField(value: string): string | undefined {
  if (!value) {
    return "La contraseña es obligatoria";
  }
  return undefined;
}

export interface PasswordRule {
  label: string;
  met: boolean;
}

// Las mismas reglas que validateStrongPasswordField, una por una, para mostrar cuáles se cumplen mientras se escribe.
export function getPasswordRules(value: string): PasswordRule[] {
  return [
    { label: "Mínimo 8 caracteres", met: hasMinLength(value, 8) },
    { label: "Una letra mayúscula", met: hasUppercase(value) },
    { label: "Un número", met: hasNumber(value) },
    { label: "Un carácter especial", met: hasSpecialChar(value) },
  ];
}

export function validateStrongPasswordField(value: string): string | undefined {
  const basicError = validatePasswordField(value);
  if (basicError) {
    return basicError;
  }
  if (!hasMinLength(value, 8)) {
    return "La contraseña debe tener al menos 8 caracteres";
  }
  if (!hasUppercase(value)) {
    return "La contraseña debe incluir al menos una letra mayúscula";
  }
  if (!hasNumber(value)) {
    return "La contraseña debe incluir al menos un número";
  }
  if (!hasSpecialChar(value)) {
    return "La contraseña debe incluir al menos un carácter especial";
  }
  return undefined;
}
