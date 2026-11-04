-- CLEAR DUMMY DATA SCRIPT
-- Run this in your Supabase SQL Editor to wipe all dummy evidence, criteria, and scores
-- while KEEPING your user accounts, university departments, and programs intact.

-- We use CASCADE to automatically delete anything that depends on these tables.
TRUNCATE TABLE simulations CASCADE;
TRUNCATE TABLE evidence_documents CASCADE;
TRUNCATE TABLE readiness_scores CASCADE;
TRUNCATE TABLE accreditation_recommendations CASCADE;
TRUNCATE TABLE area_assignments CASCADE;
TRUNCATE TABLE accreditation_criteria CASCADE;
TRUNCATE TABLE accreditation_areas CASCADE;
TRUNCATE TABLE accreditation_cycles CASCADE;

-- Note: We are intentionally NOT truncating:
-- 1. users (so you can still log in)
-- 2. institutions, departments, programs (foundational structure)
-- 3. accreditation_frameworks & accreditation_levels (PACUCOA definitions)
