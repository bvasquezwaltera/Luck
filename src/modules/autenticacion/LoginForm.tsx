"use client";

import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { GoogleIcon } from "@/modules/autenticacion/GoogleIcon";
import { signIn } from "@/server/auth/actions";
import { validateLoginForm, type LoginFormErrors } from "@/validators/authValidation";

export function LoginForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validateLoginForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setFormError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    const result = await signIn(formData);
    setIsSubmitting(false);
    if (result?.error) {
      setFormError(result.error);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-10 shadow-xl">
      <h1 className="text-center text-2xl font-bold text-gray-900">Iniciar sesión</h1>
      <p className="mt-2 text-center text-xs text-gray-500">
        Ingresa a tu cuenta para continuar conectando con{" "}
        <span className="font-semibold text-indigo-600">talento</span> increíble.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          label="Correo electrónico"
          required
          type="email"
          name="email"
          placeholder="Ingresa tu correo electrónico"
          leftIcon={<Mail className="h-4 w-4" />}
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          error={errors.email}
        />

        <div>
          <Input
            label="Contraseña"
            required
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Ingresa tu contraseña"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            error={errors.password}
          />
          <div className="mt-2 text-right">
            <a href="/recuperar-contrasena" className="text-xs font-semibold text-indigo-600">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        {formError && <p className="text-center text-xs text-red-500">{formError}</p>}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full min-w-0">
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">o continúa con</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <Button variant="google" className="w-full !min-w-0 gap-2 !py-2.5">
        <GoogleIcon />
        Continuar con Google
      </Button>

      <p className="mt-6 text-center text-xs text-gray-500">
        ¿No tienes una cuenta?{" "}
        <a href="/registro" className="font-semibold text-indigo-600">
          Regístrate
        </a>
      </p>
    </div>
  );
}
