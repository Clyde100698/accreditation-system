import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client — server-side only.
 * Uses the SERVICE ROLE KEY which bypasses RLS and can manage auth.users.
 * NEVER import this in client components ('use client').
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
