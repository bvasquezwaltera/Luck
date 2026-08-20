export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Nombre de la cookie propia del frontend donde se guarda el access token que
// devuelve el backend al iniciar sesión. No es una cookie de Supabase.
export const AUTH_TOKEN_COOKIE = "luck_session";
