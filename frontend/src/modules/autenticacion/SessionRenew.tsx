"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { expireSession, refreshSession } from "@/lib/api/httpClient";
import { getSafeNext } from "@/lib/safeNext";

const TRIED_KEY = "luck:renew-tried";
const RETRY_WINDOW_MS = 15_000;

// Pantalla puente: el panel se arma en el servidor y, si la sesión venció, no puede renovarla (no escribe cookies).
// Aquí se renueva con el token de renovación y se vuelve al panel; si no se puede, se pide iniciar sesión.
export function SessionRenew({ next }: { next: string | null }) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function run() {
      // Si ya se renovó hace un momento y el panel vuelve a mandar aquí, algo anda mal: se corta el ciclo.
      let lastTry = 0;
      try {
        lastTry = Number(sessionStorage.getItem(TRIED_KEY) ?? 0);
        sessionStorage.setItem(TRIED_KEY, String(Date.now()));
      } catch {
        // sin almacenamiento: se intenta una vez y listo
      }
      const looping = Date.now() - lastTry < RETRY_WINDOW_MS;

      if (!looping && (await refreshSession())) {
        router.replace(getSafeNext(next) ?? "/");
        return;
      }
      expireSession();
    }

    void run();
  }, [next, router]);

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl sm:p-10">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
      <h1 className="mt-4 text-lg font-bold text-gray-900">Renovando tu sesión...</h1>
      <p className="mt-1 text-xs text-gray-500">Un momento, enseguida continúas donde estabas.</p>
    </div>
  );
}
