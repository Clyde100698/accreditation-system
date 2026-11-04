import { createBrowserClient } from '@supabase/ssr'

function build() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

let client: ReturnType<typeof build> | undefined;

export function createClient() {
  if (typeof window === 'undefined') return build();
  if (!client) client = build();
  return client;
}
