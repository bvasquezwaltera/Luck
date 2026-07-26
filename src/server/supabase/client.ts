import "server-only";
import { createClient } from "@supabase/supabase-js";

// Uses the secret key — full access, bypasses RLS. Never import this file
// (or anything under src/server/) from a "use client" component; it must
// only run in Server Components, Server Actions, or Route Handlers.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);
