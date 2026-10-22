import { Check, X } from "lucide-react";
import { getPasswordRules } from "@/validators/validators";

// Lista de reglas que se va marcando mientras se escribe la contraseña.
export function PasswordRules({ password }: { password: string }) {
  const started = password.length > 0;

  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1" aria-label="Requisitos de la contraseña">
      {getPasswordRules(password).map((rule) => (
        <li
          key={rule.label}
          className={`flex items-center gap-1.5 text-xs ${
            rule.met ? "text-emerald-600" : started ? "text-red-500" : "text-gray-400"
          }`}
        >
          {rule.met ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
          {rule.label}
        </li>
      ))}
    </ul>
  );
}

// "Coinciden" / "No coinciden" mientras se escribe la confirmación; no dice nada hasta que se empieza a escribir.
export function PasswordMatch({ password, confirmation }: { password: string; confirmation: string }) {
  if (!confirmation) return null;
  const matches = password === confirmation;

  return (
    <p
      role="status"
      className={`mt-1.5 flex items-center gap-1.5 text-xs ${matches ? "text-emerald-600" : "text-red-500"}`}
    >
      {matches ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
      {matches ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
    </p>
  );
}
