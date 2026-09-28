// Server-side Supabase client.
// Uses the anon key with public RLS policies.
// No service role key needed.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL =
  process.env["SUPABASE_URL"] ||
  process.env["VITE_SUPABASE_URL"] ||
  (typeof import.meta !== "undefined"
    ? import.meta.env?.["VITE_SUPABASE_URL"] || import.meta.env?.["SUPABASE_URL"]
    : undefined);

const SUPABASE_ANON_KEY =
  process.env["SUPABASE_ANON_KEY"] ||
  process.env["VITE_SUPABASE_ANON_KEY"] ||
  process.env["SUPABASE_PUBLISHABLE_KEY"] ||
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  (typeof import.meta !== "undefined"
    ? import.meta.env?.["VITE_SUPABASE_ANON_KEY"] ||
      import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
      import.meta.env?.["SUPABASE_ANON_KEY"] ||
      import.meta.env?.["SUPABASE_PUBLISHABLE_KEY"]
    : undefined);

function createSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY). Connect Supabase via Lovable integrations.",
    );
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

// Server-side Supabase client — uses public anon key + public RLS policies.
// Load inside server handlers: const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});
