// El token de acceso dura una hora. Con el token de renovación se pide uno nuevo sin que la persona tenga que
// volver a escribir su contraseña. Supabase usa cada token de renovación una sola vez, así que varias peticiones
// que fallen a la vez deben compartir UNA renovación (si cada una renovara por su cuenta, solo la primera valdría).

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefresherDeps {
  readRefreshToken: () => string | null;
  callRefresh: (refreshToken: string) => Promise<Tokens | null>;
  store: (tokens: Tokens) => void;
}

// Devuelve una función que renueva la sesión: true si quedó una sesión nueva guardada, false si ya no se puede.
export function createRefresher({ readRefreshToken, callRefresh, store }: RefresherDeps): () => Promise<boolean> {
  let inFlight: Promise<boolean> | null = null;

  return function refresh() {
    if (inFlight) return inFlight;

    inFlight = (async () => {
      const refreshToken = readRefreshToken();
      if (!refreshToken) return false;

      const tokens = await callRefresh(refreshToken).catch(() => null);
      if (!tokens) return false;

      store(tokens);
      return true;
    })().finally(() => {
      inFlight = null;
    });

    return inFlight;
  };
}

// A dónde ir cuando la sesión ya no sirve: al inicio de sesión con el aviso, y de vuelta al panel al entrar.
export function loginUrlAfterExpiry(pathname: string, search = ""): string {
  const base = "/login?expired=1";
  // Solo se vuelve a las pantallas del panel; desde cualquier otra, entrar lleva al panel de siempre.
  if (!pathname.startsWith("/panel")) return base;
  return `${base}&next=${encodeURIComponent(pathname + search)}`;
}
