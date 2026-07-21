import {
  validateFullNameField,
  validateEmailField,
  validatePasswordField,
  validateStrongPasswordField,
} from "@/validators/validators";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  const emailError = validateEmailField(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePasswordField(values.password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  const fullNameError = validateFullNameField(values.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const emailError = validateEmailField(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validateStrongPasswordField(values.password);
  if (passwordError) errors.password = passwordError;

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ForgotPasswordFormErrors {
  email?: string;
}

export function validateForgotPasswordForm(
  values: ForgotPasswordFormValues,
): ForgotPasswordFormErrors {
  const errors: ForgotPasswordFormErrors = {};

  const emailError = validateEmailField(values.email);
  if (emailError) errors.email = emailError;

  return errors;
}
