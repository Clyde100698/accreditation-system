-- ============================================================================
-- MIGRATION V5 - STEP 1 OF 2: ADD ENUM VALUES
-- ============================================================================
-- IMPORTANT: Run this script by itself first and click "Run" in Supabase SQL Editor.
-- PostgreSQL requires new enum values to be committed to the system catalog
-- before they can be referenced in tables, policies, or insert statements.
-- ============================================================================

ALTER TYPE user_role_v2 ADD VALUE IF NOT EXISTS 'system_admin';
ALTER TYPE user_role_v2 ADD VALUE IF NOT EXISTS 'observer';
