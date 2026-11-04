-- ============================================================================
-- CONFIRM USER EMAILS IN SUPABASE AUTH
-- ============================================================================
-- Run this in your Supabase SQL Editor to mark your admin email as confirmed.
-- ============================================================================

-- 1. Confirm email for admin@sti.edu (and any unconfirmed users)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@sti.edu';

-- 2. Link auth_user_id in public.users to ensure role and permissions work
UPDATE public.users 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'admin@sti.edu' LIMIT 1),
    role = 'system_admin'
WHERE email = 'admin@sti.edu';
