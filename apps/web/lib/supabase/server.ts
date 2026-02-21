import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Create a Supabase server client with service role. Returns null when env is not set,
 * so the app can run without Supabase configured.
 */
export function createServerClient(): ReturnType<typeof createClient> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let serverClient: SupabaseClient | null | undefined = undefined;

export function getServerClient(): SupabaseClient | null {
  if (serverClient === undefined) {
    serverClient = createServerClient();
  }
  return serverClient;
}
