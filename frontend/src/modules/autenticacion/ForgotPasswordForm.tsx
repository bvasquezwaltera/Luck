"use client";

import { useState, type FormEvent } from "react";
import { Mail, MailCheck, ArrowLeft } from "lucide-react";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import {
  validateForgotPasswordForm,
  type ForgotPasswordFormErrors,
} from "@/validators/authValidation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const formErrors = validateForgotPasswordForm({ email });
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-10 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
          <MailCheck className="h-6 w-6 text-indigo-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Revisa tu email</h1>
        <p className="mt-2 text-xs text-gray-500">
          Te enviamos un enlace a{" "}
          <span className="font-semibold text-gray-900">{email}</span> para
          restablecer tu contraseña.
        </p>
        <Button href="/login" variant="primary" className="mt-6 w-full min-w-0">
          Volver a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-10 shadow-xl">
      <h1 className="text-center text-2xl font-bold text-gray-900">
        Recuperar contraseña
      </h1>
      <p className="mt-2 text-center text-xs text-gray-500">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu
        contraseña.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          label="Correo electrónico"
          required
          type="email"
          name="email"
          placeholder="Ingresa tu correo electrónico"
          leftIcon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Button type="submit" variant="primary" className="w-full min-w-0">
          Enviar enlace
        </Button>
      </form>

      <a
        href="/login"
        className="mt-6 flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a iniciar sesión
      </a>
    </div>
  );
}
