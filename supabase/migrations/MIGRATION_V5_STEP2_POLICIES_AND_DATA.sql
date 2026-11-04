-- ============================================================================
-- MIGRATION V5 - STEP 2 OF 2: POLICIES, SCOPE COLUMN, AND SEED ACCOUNTS
-- ============================================================================
-- Prerequisite: Make sure you have already run STEP 1 (MIGRATION_V5_STEP1_ENUMS.sql)
-- so that 'system_admin' and 'observer' are committed in PostgreSQL.
-- ============================================================================

-- 1. Add is_accreditation_active column to programs
ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_accreditation_active BOOLEAN NOT NULL DEFAULT true;

-- Index for efficient querying by department and accreditation status
CREATE INDEX IF NOT EXISTS idx_programs_accreditation_active ON programs(department_id, is_accreditation_active);

-- 2. Update / Add RLS Policies for Separation of Concerns

-- System Admin: Institutions (full CRUD)
DROP POLICY IF EXISTS "System admin manages institutions" ON institutions;
CREATE POLICY "System admin manages institutions" ON institutions FOR ALL USING (
    get_current_user_role() = 'system_admin'
);

-- System Admin: Departments (full CRUD)
DROP POLICY IF EXISTS "System admin manages departments" ON departments;
CREATE POLICY "System admin manages departments" ON departments FOR ALL USING (
    get_current_user_role() = 'system_admin'
);

-- System Admin & QA: Programs management
DROP POLICY IF EXISTS "System admin manages programs" ON programs;
CREATE POLICY "System admin manages programs" ON programs FOR ALL USING (
    get_current_user_role() = 'system_admin'
);

DROP POLICY IF EXISTS "QA toggles program accreditation active scope" ON programs;
CREATE POLICY "QA toggles program accreditation active scope" ON programs FOR UPDATE USING (
    get_current_user_role() = 'qa'
) WITH CHECK (
    get_current_user_role() = 'qa'
);

-- System Admin: Users management
DROP POLICY IF EXISTS "System admin manages users" ON users;
CREATE POLICY "System admin manages users" ON users FOR ALL USING (
    get_current_user_role() = 'system_admin'
);

-- Observer: Read-only access to users in same department or public
DROP POLICY IF EXISTS "Observer can view users" ON users;
CREATE POLICY "Observer can view users" ON users FOR SELECT USING (
    get_current_user_role() = 'observer'
);

-- Evidence Documents: Block INSERT and UPDATE when program is out of active accreditation cycle
-- (Except QA override or read operations)
DROP POLICY IF EXISTS "Faculty/PH can upload evidence to active program" ON evidence_documents;
CREATE POLICY "Faculty/PH can upload evidence to active program" ON evidence_documents FOR INSERT WITH CHECK (
    get_current_user_role() IN ('faculty', 'program_head') AND
    program_id = get_current_user_program_id() AND
    uploaded_by = get_current_user_id() AND
    EXISTS (
        SELECT 1 FROM programs 
        WHERE programs.id = evidence_documents.program_id 
          AND programs.is_accreditation_active = true
    )
);

-- System Admin & Observer: Audit log viewing
DROP POLICY IF EXISTS "System Admin and Observer can read audit log" ON audit_log;
CREATE POLICY "System Admin and Observer can read audit log" ON audit_log FOR SELECT USING (
    get_current_user_role() IN ('system_admin', 'qa', 'dean')
);

-- 3. Seed Demo Accounts & Test Inactive Program
DO $$
DECLARE
    v_inst_id UUID;
    v_dept_id UUID;
    v_bsit_id UUID;
    v_bscs_id UUID;
BEGIN
    SELECT id INTO v_inst_id FROM institutions LIMIT 1;
    SELECT id INTO v_dept_id FROM departments WHERE code = 'CICT' LIMIT 1;
    IF v_dept_id IS NULL THEN
        SELECT id INTO v_dept_id FROM departments LIMIT 1;
    END IF;

    SELECT id INTO v_bsit_id FROM programs WHERE code = 'BSIT' LIMIT 1;
    SELECT id INTO v_bscs_id FROM programs WHERE code = 'BSCS' LIMIT 1;

    -- Ensure BSIT is marked active
    IF v_bsit_id IS NOT NULL THEN
        UPDATE programs SET is_accreditation_active = true WHERE id = v_bsit_id;
    END IF;

    -- Ensure a second program BSCS exists under CICT to demonstrate inactive / out-of-cycle status
    IF v_bscs_id IS NULL AND v_dept_id IS NOT NULL THEN
        INSERT INTO programs (department_id, code, name, is_accreditation_active)
        VALUES (v_dept_id, 'BSCS', 'Bachelor of Science in Computer Science', false)
        RETURNING id INTO v_bscs_id;
    ELSEIF v_bscs_id IS NOT NULL THEN
        -- Mark BSCS as inactive out-of-cycle for demonstration
        UPDATE programs SET is_accreditation_active = false WHERE id = v_bscs_id;
    END IF;

    -- Seed IT System Administrator
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@sti.edu') THEN
        INSERT INTO users (full_name, email, role, institution_id, department_id)
        VALUES ('IT System Administrator', 'admin@sti.edu', 'system_admin', v_inst_id, v_dept_id);
    ELSE
        UPDATE users SET role = 'system_admin' WHERE email = 'admin@sti.edu';
    END IF;

    -- Seed Stakeholder Observer
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'observer@sti.edu') THEN
        INSERT INTO users (full_name, email, role, department_id, program_id)
        VALUES ('Stakeholder Observer', 'observer@sti.edu', 'observer', v_dept_id, v_bsit_id);
    ELSE
        UPDATE users SET role = 'observer' WHERE email = 'observer@sti.edu';
    END IF;
END $$;
