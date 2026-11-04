-- ============================================================================
-- QUICK FIX: Fix "Database error querying schema" in Supabase Auth
-- ============================================================================
-- Run this single command in your Supabase SQL Editor.
--
-- Why this happens:
-- Supabase GoTrue (the auth service) scans auth.users columns into Go strings.
-- If token columns are NULL, GoTrue crashes with "converting NULL to string is unsupported",
-- which surfaces on the frontend as "Database error querying schema".
--
-- This script sets all token columns to empty strings ('') so GoTrue can scan them.
-- ============================================================================

UPDATE auth.users
SET confirmation_token = '',
    recovery_token = '',
    email_change = '',
    email_change_token_new = '',
    email_change_token_current = '',
    phone_change = '',
    phone_change_token = '',
    reauthentication_token = ''
WHERE email = 'admin@sti.edu';

-- Verify the fix
SELECT id, email, role, email_confirmed_at, confirmation_token, recovery_token
FROM auth.users
WHERE email = 'admin@sti.edu';
