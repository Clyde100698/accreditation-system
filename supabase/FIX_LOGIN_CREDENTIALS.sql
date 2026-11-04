-- ============================================================================
-- FIX: "Invalid login credentials" for dashboard-created users
-- ============================================================================
-- WHY THIS HAPPENS:
--   When you create a user via the Supabase Dashboard, two things can go wrong:
--   1. email_confirmed_at is NULL → Supabase treats the account as unverified
--      and rejects login with "Invalid login credentials"
--   2. Token columns are NULL → causes "Database error querying schema"
--
-- RUN THIS in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- ============================================================================

-- STEP 1: See all your auth users and their confirmation status
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  CASE WHEN email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED - this is why login fails' 
       ELSE '✅ Confirmed' END AS status
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 2: Confirm ALL unconfirmed users so they can log in
--         (Sets email_confirmed_at to now if it is currently NULL)
-- ============================================================================
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_token  = '',
  recovery_token      = '',
  email_change        = '',
  email_change_token_new     = '',
  email_change_token_current = '',
  phone_change        = '',
  phone_change_token  = '',
  reauthentication_token = ''
WHERE email_confirmed_at IS NULL;

-- ============================================================================
-- STEP 3: Also fix any existing confirmed users that have NULL token columns
--         (prevents "Database error querying schema")
-- ============================================================================
UPDATE auth.users
SET 
  confirmation_token  = COALESCE(confirmation_token, ''),
  recovery_token      = COALESCE(recovery_token, ''),
  email_change        = COALESCE(email_change, ''),
  email_change_token_new     = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change        = COALESCE(phone_change, ''),
  phone_change_token  = COALESCE(phone_change_token, ''),
  reauthentication_token     = COALESCE(reauthentication_token, '')
WHERE email_confirmed_at IS NOT NULL;

-- ============================================================================
-- STEP 4: Verify - all users should now show ✅ Confirmed
-- ============================================================================
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE WHEN email_confirmed_at IS NULL THEN '❌ STILL NOT CONFIRMED' 
       ELSE '✅ Ready to log in' END AS status
FROM auth.users
ORDER BY created_at DESC;
