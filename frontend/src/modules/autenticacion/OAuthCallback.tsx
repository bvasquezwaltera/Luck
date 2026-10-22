"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RoleToggle, type Role } from "@/modules/autenticacion/RoleToggle";
import { completeGoogleSignIn } from "@/lib/api/client/auth";
import { clearPending, readPending } from "@/lib/oauthPending";
import { parseOAuthReturn } from "@/lib/oauthHash";
import { clearSession, storeSession } from "@/lib/api/token";
import { Button } from "@/ui/Button";

const PANEL_PATH_BY_ROLE: Record<string, string> = {
  freelancer: "/panel/freelancer",
  client: "/panel/cliente",
};

// Página a la que vuelve Google (vía Supabase): guarda la sesión, crea el perfil si es una cuenta nueva y entra al panel.
export function OAuthCallback() {
  const router = useRouter();
  const started = useRef(false); // en desarrollo React ejecuta los efectos dos veces; el retorno solo se puede leer una vez
  const [stage, setStage] = useState<"working" | "choose" | "error">("working");
  const [error, setError] = useState("");
  const [role, setRole] = useState<Role>("freelancer");
  const [isSaving, setIsSaving] = useState(false);

  function enter(apiRole: string) {
    const { next } = readPending();
    clearPending();
    router.replace(next ?? PANEL_PATH_BY_ROLE[apiRole] ?? "/");
  }

  async function complete(apiRole?: "freelancer" | "client") {
    const result = await completeGoogleSignIn(apiRole);
    if (result.needsRole) {
      setStage("choose");
      return;
    }
    if (result.error || !result.role) {
      clearSession();
      setError(result.error ?? "No se pudo completar el inicio de sesión.");
      setStage("error");
      return;
    }
    enter(result.role);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const returned = parseOAuthReturn(window.location.hash, window.location.search);
    // El token no debe quedarse a la vista en la dirección ni en el historial.
    window.history.replaceState(null, "", window.location.pathname);

    if ("error" in returned) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- el retorno solo se puede leer en el navegador, al llegar
      setError(returned.error);
      setStage("error");
      return;
    }
    storeSession({ accessToken: returned.accessToken, refreshToken: returned.refreshToken });
    void complete(readPending().role);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al llegar a la página
  }, []);

  async function handleChoose() {
    setIsSaving(true);
    await complete(role === "cliente" ? "client" : "freelancer");
    setIsSaving(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl sm:p-10">
      {stage === "working" && (
        <>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <h1 className="mt-4 text-lg font-bold text-gray-900">Entrando con Google...</h1>
          <p className="mt-1 text-xs text-gray-500">Un momento, estamos preparando tu cuenta.</p>
        </>
      )}

      {stage === "choose" && (
        <>
          <h1 className="text-2xl font-bold text-gray-900">¿Cómo usarás Luck?</h1>
          <p className="mt-2 text-xs text-gray-500">
            Es tu primera vez con esta cuenta de Google. Elige tu tipo de cuenta para terminar.
          </p>
          <div className="mt-5">
            <RoleToggle role={role} onChange={setRole} />
          </div>
          <Button variant="primary" className="mt-6 w-full min-w-0" onClick={handleChoose} disabled={isSaving}>
            {isSaving ? "Creando tu cuenta..." : "Continuar"}
          </Button>
        </>
      )}

      {stage === "error" && (
        <>
          <h1 className="text-lg font-bold text-gray-900">No pudimos iniciar sesión</h1>
          <p className="mt-2 text-sm text-red-500">{error}</p>
          <a href="/login" className="mt-5 inline-block text-sm font-semibold text-indigo-600">
            Volver a iniciar sesión
          </a>
        </>
      )}
    </div>
  );
}
