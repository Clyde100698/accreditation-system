-- ============================================================================
-- FIX & CLEANUP AUTH SCHEMA
-- ============================================================================
-- Run this in Supabase SQL Editor to remove manual entries from auth schema
-- that caused "Database error querying schema".
-- ============================================================================

-- 1. Remove manual records from auth.identities and auth.users
DELETE FROM auth.identities 
WHERE identity_data->>'email' IN ('admin@sti.edu', 'observer@sti.edu')
   OR user_id IN (SELECT id FROM auth.users WHERE email IN ('admin@sti.edu', 'observer@sti.edu'));

DELETE FROM auth.users 
WHERE email IN ('admin@sti.edu', 'observer@sti.edu');

-- 2. Reset auth_user_id pointers in public.users
UPDATE public.users 
SET auth_user_id = NULL 
WHERE email IN ('admin@sti.edu', 'observer@sti.edu');

-- ============================================================================
-- OPTION: If you want to promote your existing working account (e.g. admin.qa@sti.edu)
-- to System Admin so you can log in immediately with your existing password:
-- ============================================================================
-- UPDATE public.users SET role = 'system_admin' WHERE email = 'admin.qa@sti.edu';
