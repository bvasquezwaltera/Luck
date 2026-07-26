"use client";

import { useState, type FormEvent } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { GoogleIcon } from "@/modules/autenticacion/GoogleIcon";
import { RoleToggle, type Role } from "@/modules/autenticacion/RoleToggle";
import { signUp } from "@/server/auth/actions";
import {
  validateRegisterForm,
  type RegisterFormErrors,
} from "@/validators/authValidation";

export function RegisterForm() {
  const [role, setRole] = useState<Role>("freelancer");
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validateRegisterForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setFormError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("role", role === "cliente" ? "client" : "freelancer");

    const result = await signUp(formData);
    setIsSubmitting(false);
    if (result?.error) {
      setFormError(result.error);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-10 shadow-xl">
      <h1 className="text-center text-2xl font-bold text-gray-900">Crear cuenta</h1>
      <p className="mt-2 text-center text-xs text-gray-500">
        Únete a <span className="font-semibold text-indigo-600">Luck</span> y
        descubre oportunidades increíbles.
      </p>

      <div className="mt-4">
        <RoleToggle role={role} onChange={setRole} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          label="Nombre completo"
          required
          type="text"
          name="fullName"
          placeholder="Ingresa tu nombre completo"
          leftIcon={<User className="h-4 w-4" />}
          value={values.fullName}
          onChange={(e) => setValues({ ...values, fullName: e.target.value })}
          error={errors.fullName}
        />

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
            placeholder="Crea una contraseña"
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
          <p className="mt-1.5 text-xs text-gray-400">
            Mínimo 8 caracteres, una letra mayúscula, un número y carácter especial.
          </p>
        </div>

        <Input
          label="Confirmar contraseña"
          required
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirma tu contraseña"
          leftIcon={<Lock className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-gray-400"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          value={values.confirmPassword}
          onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
        />

        <Checkbox
          name="acceptedTerms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        >
          Acepto los{" "}
          <a href="#" className="font-semibold text-indigo-600">
            Términos y Condiciones
          </a>{" "}
          y la{" "}
          <a href="#" className="font-semibold text-indigo-600">
            Política de Privacidad
          </a>
          .
        </Checkbox>

        {formError && <p className="text-center text-xs text-red-500">{formError}</p>}

        <Button
          type="submit"
          variant="primary"
          disabled={!acceptedTerms || isSubmitting}
          className={`w-full min-w-0 ${!acceptedTerms ? "!bg-indigo-300 hover:!bg-indigo-300" : ""}`}
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">o regístrate con</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <Button variant="google" className="w-full !min-w-0 gap-2 !py-2.5">
        <GoogleIcon />
        Registrarme con Google
      </Button>

      <p className="mt-6 text-center text-xs text-gray-500">
        ¿Ya tienes una cuenta?{" "}
        <a href="/login" className="font-semibold text-indigo-600">
          Iniciar sesión
        </a>
      </p>
    </div>
  );
}
