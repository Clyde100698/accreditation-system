'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const DEFAULT_PASSWORD = 'password123';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface ProvisionUserResult {
  success: boolean;
  authUserId?: string;
  error?: string;
}

/**
 * Creates a Supabase Auth user with the default password.
 * Must run server-side — uses the service role key.
 */
export async function provisionAuthUser(email: string, fullName: string): Promise<ProvisionUserResult> {
  const admin = createAdminClient();

  // Check if auth user already exists
  const { data: listData } = await admin.auth.admin.listUsers();
  const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    // Auth user already exists — just return their ID
    return { success: true, authUserId: existing.id };
  }

  // Create the auth user with the default password, auto-confirmed
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, authUserId: data.user.id };
}

/**
 * Deactivates a user: sets is_active = false in public.users.
 * The auth account remains so audit logs are preserved.
 * The user will get a 403 on next request via middleware/useAuth checks.
 */
export async function deactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const db = getServiceClient();
  const { error } = await db
    .from('users')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Reactivates a previously deactivated user.
 */
export async function reactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const db = getServiceClient();
  const { error } = await db
    .from('users')
    .update({ is_active: true })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Permanently deletes a user from both public.users and auth.users.
 * This is irreversible — use deactivate for a safer option.
 */
export async function deleteUser(
  userId: string,
  authUserId: string | null
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const db = getServiceClient();

  // 1. Delete from public.users first (FK constraints)
  const { error: dbError } = await db.from('users').delete().eq('id', userId);
  if (dbError) return { success: false, error: dbError.message };

  // 2. Delete from auth.users (if linked)
  if (authUserId) {
    const { error: authError } = await admin.auth.admin.deleteUser(authUserId);
    if (authError) {
      // Auth deletion failed but DB record is already gone — log and continue
      console.error('Auth user deletion failed (DB record already deleted):', authError.message);
    }
  }

  return { success: true };
}
