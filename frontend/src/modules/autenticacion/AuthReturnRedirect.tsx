"use client";

import { useEffect } from "react";
import { authReturnRedirect } from "@/lib/authReturn";

// Red de seguridad: si el regreso de Google o de un correo de recuperación llega a una página que no corresponde
// (porque Supabase usó la dirección principal del sitio), lleva a la pantalla correcta conservando la sesión.
export function AuthReturnRedirect() {
  useEffect(() => {
    const target = authReturnRedirect(window.location.pathname, window.location.hash);
    if (target) window.location.replace(target);
  }, []);

  return null;
}
