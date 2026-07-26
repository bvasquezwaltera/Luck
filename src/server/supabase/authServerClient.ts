import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Auth-aware client: uses the publishable key + the request's session cookies,
// so RLS applies as the logged-in user. Use this for anything auth-related
// (sign in/up/out, "who is the current user"). For privileged/service-role
// queries that intentionally bypass RLS, use src/server/supabase/client.ts.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component without a mutable cookie store;
            // safe to ignore as long as the proxy also refreshes the session.
          }
        },
      },
    },
  );
}
