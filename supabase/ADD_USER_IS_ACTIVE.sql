-- ============================================================================
-- MIGRATION: Add is_active flag to public.users
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Add the column (defaults to true = active)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Verify
SELECT id, full_name, email, role, is_active FROM public.users ORDER BY full_name;
