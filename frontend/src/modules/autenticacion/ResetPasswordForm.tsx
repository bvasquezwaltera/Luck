"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { PasswordMatch, PasswordRules } from "@/modules/autenticacion/PasswordFeedback";
import { resetPasswordWithToken } from "@/lib/api/client/auth";
import { parseOAuthReturn } from "@/lib/oauthHash";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { validateStrongPasswordField } from "@/validators/validators";

// Pantalla a la que lleva el enlace del correo de recuperación: Supabase la abre con la sesión temporal en la dirección.
export function ResetPasswordForm() {
  const started = useRef(false); // el fragmento de la dirección solo se puede leer una vez
  const [token, setToken] = useState<string | null>(null);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmation?: string }>({});
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const expired = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_code") === "otp_expired";
    const returned = parseOAuthReturn(window.location.hash, window.location.search);
    // El token no debe quedarse a la vista en la dirección ni en el historial.
    window.history.replaceState(null, "", window.location.pathname);

    /* eslint-disable react-hooks/set-state-in-effect -- la dirección solo se puede leer en el navegador, al llegar */
    if ("error" in returned) {
      setLinkError(
        expired
          ? "El enlace venció o ya se usó. Pide uno nuevo para continuar."
          : "El enlace no es válido. Pide uno nuevo para continuar.",
      );
      return;
    }
    setToken(returned.accessToken);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    const next: typeof errors = {};
    const passwordError = validateStrongPasswordField(password);
    if (passwordError) next.password = passwordError;
    if (!confirmation) next.confirmation = "Confirma tu contraseña";
    else if (confirmation !== password) next.confirmation = "Las contraseñas no coinciden";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setFormError("");
    setIsSaving(true);
    const result = await resetPasswordWithToken(token, password);
    setIsSaving(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setDone(true);
  }

  const card = "w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-10";

  if (done) {
    return (
      <div className={`${card} text-center`}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Contraseña actualizada</h1>
        <p className="mt-2 text-xs text-gray-500">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Button href="/login" variant="primary" className="mt-6 w-full min-w-0">
          Iniciar sesión
        </Button>
      </div>
    );
  }

  if (linkError) {
    return (
      <div className={`${card} text-center`}>
        <h1 className="text-lg font-bold text-gray-900">No pudimos abrir el enlace</h1>
        <p className="mt-2 text-sm text-red-500">{linkError}</p>
        <Button href="/recuperar-contrasena" variant="primary" className="mt-6 w-full min-w-0">
          Pedir un enlace nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className={card}>
      <h1 className="text-center text-2xl font-bold text-gray-900">Nueva contraseña</h1>
      <p className="mt-2 text-center text-xs text-gray-500">Elige una contraseña nueva para tu cuenta.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <div>
          <Input
            label="Nueva contraseña"
            required
            type={show ? "text" : "password"}
            name="new-password"
            autoComplete="new-password"
            placeholder="Crea una contraseña"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <button type="button" onClick={() => setShow((value) => !value)} className="text-gray-400" aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors({});
            }}
            error={errors.password}
          />
          <PasswordRules password={password} />
        </div>

        <div>
          <Input
            label="Confirmar contraseña"
            required
            type={show ? "text" : "password"}
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Confirma tu contraseña"
            leftIcon={<Lock className="h-4 w-4" />}
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              setErrors((current) => ({ ...current, confirmation: undefined }));
            }}
            error={errors.confirmation}
          />
          <PasswordMatch password={password} confirmation={confirmation} />
        </div>

        {formError && <p className="text-center text-xs text-red-500">{formError}</p>}

        <Button type="submit" variant="primary" disabled={isSaving || !token} className="w-full min-w-0">
          {isSaving ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </form>
    </div>
  );
}
