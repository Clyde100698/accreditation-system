'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/types';
import { getBypassUser, setBypassUser } from '@/lib/auth-mock';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function getUser() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (!authError && authData?.user) {
          // Real Supabase session exists — clear any stale bypass user
          const bypass = getBypassUser();
          if (bypass) {
            setBypassUser(null);
          }

          const authUser = authData.user;
          const userEmail = authUser.email;

          // Fetch user profile from public.users table
          const query = userEmail
            ? supabase
                .from('users')
                .select('*, programs(*)')
                .or(`auth_user_id.eq.${authUser.id},email.eq.${userEmail}`)
                .limit(1)
                .maybeSingle()
            : supabase
                .from('users')
                .select('*, programs(*)')
                .eq('auth_user_id', authUser.id)
                .limit(1)
                .maybeSingle();

          const { data, error } = await query;
          if (!active) return;

          if (error || !data) {
            await supabase.auth.signOut().catch(() => {});
            setUser(null);
          } else {
            if (!data.auth_user_id) {
              await supabase
                .from('users')
                .update({ auth_user_id: authUser.id })
                .eq('id', data.id);
            }
            setUser((prev) =>
              prev && JSON.stringify(prev) === JSON.stringify(data) ? prev : (data as User)
            );
          }
          setLoading(false);
          return;
        }

        // If no active Supabase Auth session, check offline bypass user
        const bypass = getBypassUser();
        if (bypass) {
          if (!active) return;
          setUser(bypass);
          setLoading(false);
          return;
        }

        if (!active) return;
        setUser(null);
        setLoading(false);
      } catch {
        const bypass = getBypassUser();
        if (active) {
          setUser(bypass || null);
          setLoading(false);
        }
      }
    }

    getUser();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (getBypassUser()) {
        return; // Preserve bypass user session
      }
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setLoading(false);
        return;
      }
      // Ignore INITIAL_SESSION / TOKEN_REFRESHED noise; getUser() already ran on mount
      if (event === 'SIGNED_IN') {
        setUser((prev) => {
          if (!prev || prev.auth_user_id !== session.user.id) {
            setTimeout(() => getUser(), 0);
          }
          return prev;
        });
      } else if (event === 'USER_UPDATED') {
        setTimeout(() => getUser(), 0);
      }
    });

    return () => {
      active = false;
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}
