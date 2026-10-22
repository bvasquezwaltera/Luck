// Cuando Supabase no tiene la dirección de retorno en su lista de redirecciones permitidas, manda a la persona a la
// dirección principal del sitio (Site URL), con la sesión en el fragmento (#access_token=...). Esta función reconoce ese
// caso para llevarla a la pantalla que corresponde, en vez de dejarla en la página de inicio con la sesión sin usar.
export const GOOGLE_RETURN_PATH = "/auth/callback";
export const RESET_PASSWORD_PATH = "/restablecer-contrasena";

// A dónde hay que ir (con el mismo fragmento), o null si esta página no tiene nada que redirigir.
export function authReturnRedirect(pathname: string, hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const hasSession = params.has("access_token");
  const hasError = params.has("error") && params.has("error_description");
  if (!hasSession && !hasError) return null;

  // Un enlace de recuperación de contraseña lleva a su pantalla; lo demás viene de iniciar sesión con Google.
  const target = params.get("type") === "recovery" ? RESET_PASSWORD_PATH : GOOGLE_RETURN_PATH;
  if (pathname === target) return null; // ya está donde debe

  // Las pantallas que ya leen el fragmento por su cuenta no se tocan.
  if (pathname === GOOGLE_RETURN_PATH || pathname === RESET_PASSWORD_PATH) return null;

  return target + (hash.startsWith("#") ? hash : `#${hash}`);
}
