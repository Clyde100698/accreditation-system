-- ============================================================================
-- MIGRATION: ENFORCE UNIQUE CONSTRAINTS ON DEPARTMENTS, PROGRAMS, AND USERS
-- ============================================================================
-- Prevents duplicate department codes, duplicate program codes, and duplicate emails.
-- Clean up any duplicates before applying if needed.
-- ============================================================================

DO $$
BEGIN
    -- 1. Unique constraint on departments(code)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_department_code'
    ) THEN
        ALTER TABLE departments ADD CONSTRAINT unique_department_code UNIQUE (code);
    END IF;

    -- 2. Unique constraint on programs(code)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_program_code'
    ) THEN
        ALTER TABLE programs ADD CONSTRAINT unique_program_code UNIQUE (code);
    END IF;

    -- 3. Unique constraint on users(email)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_email'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT unique_user_email UNIQUE (email);
    END IF;
END $$;
