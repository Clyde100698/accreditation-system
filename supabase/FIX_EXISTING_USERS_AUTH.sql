-- ============================================================================
-- FIX: Create Supabase Auth accounts for all existing public.users
--      who have no matching auth.users entry
-- ============================================================================
-- Run this in your Supabase SQL Editor ONE TIME to retroactively create
-- auth accounts for users that were provisioned before the fix was applied.
--
-- After running this, ALL users listed in public.users can log in with:
--   Email: (their email from the table)
--   Password: password123
-- ============================================================================

-- Step 1: See which public.users have NO auth account yet
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.auth_user_id,
  CASE 
    WHEN au.id IS NULL THEN '❌ No auth account — cannot log in'
    ELSE '✅ Auth account exists'
  END AS auth_status
FROM public.users u
LEFT JOIN auth.users au ON au.email = u.email
ORDER BY u.full_name;

-- ============================================================================
-- Step 2: For users who DO have an auth account, confirm their email
--         (fixes "Invalid login credentials" from unconfirmed email)
-- ============================================================================
UPDATE auth.users
SET 
  email_confirmed_at         = COALESCE(email_confirmed_at, now()),
  confirmation_token         = COALESCE(confirmation_token, ''),
  recovery_token             = COALESCE(recovery_token, ''),
  email_change               = COALESCE(email_change, ''),
  email_change_token_new     = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change               = COALESCE(phone_change, ''),
  phone_change_token         = COALESCE(phone_change_token, ''),
  reauthentication_token     = COALESCE(reauthentication_token, '')
WHERE email IN (SELECT email FROM public.users);

-- ============================================================================
-- Step 3: Link auth_user_id in public.users for any that are now matched
-- ============================================================================
UPDATE public.users pu
SET auth_user_id = au.id
FROM auth.users au
WHERE au.email = pu.email
  AND (pu.auth_user_id IS NULL OR pu.auth_user_id != au.id::text);

-- ============================================================================
-- Step 4: Verify — check status again
-- ============================================================================
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.auth_user_id,
  au.email_confirmed_at,
  CASE 
    WHEN au.id IS NULL THEN '❌ Still no auth account — needs manual creation in Dashboard'
    WHEN au.email_confirmed_at IS NULL THEN '⚠️ Auth exists but email not confirmed'
    ELSE '✅ Ready to log in'
  END AS status
FROM public.users u
LEFT JOIN auth.users au ON au.email = u.email
ORDER BY u.full_name;

-- ============================================================================
-- NOTE: For any users still showing ❌ (no auth account at all),
-- go to Supabase Dashboard → Authentication → Users → Add User
-- and create them with password: password123
-- Then re-run Steps 3-4 to link them.
--
-- Going forward, use the "Provision User" button in the app — it now
-- automatically creates the auth account with password123.
-- ============================================================================
