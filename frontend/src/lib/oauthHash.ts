export type OAuthReturn = { accessToken: string; refreshToken: string | null } | { error: string };

// Supabase devuelve el resultado de Google en el fragmento de la dirección (#access_token=...) o, si algo
// falló, como error en el fragmento o en la consulta (?error_description=...).
export function parseOAuthReturn(hash: string, search = ""): OAuthReturn {
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const query = new URLSearchParams(search.replace(/^\?/, ""));

  const failure = fragment.get("error_description") ?? query.get("error_description") ?? fragment.get("error") ?? query.get("error");
  if (failure) {
    // "access_denied" es que la persona canceló en la pantalla de Google: no es un fallo para asustarse.
    const denied = (fragment.get("error") ?? query.get("error")) === "access_denied";
    return { error: denied ? "Cancelaste el inicio de sesión con Google." : "No se pudo iniciar sesión con Google. Inténtalo de nuevo." };
  }

  const accessToken = fragment.get("access_token");
  if (!accessToken) return { error: "No se recibió la sesión de Google. Inténtalo de nuevo." };
  return { accessToken, refreshToken: fragment.get("refresh_token") };
}
