-- MIGRATION: V2 Role Hierarchy & Scope
-- Run this in Supabase SQL Editor

-- 1. Create new Enums
CREATE TYPE user_role_v2 AS ENUM ('qa', 'dean', 'program_head', 'faculty', 'alumni_rep', 'student_rep');
ALTER TYPE assignment_type ADD VALUE IF NOT EXISTS 'member';

-- 2. Add scoping and role columns to users
ALTER TABLE users ADD COLUMN institution_id UUID REFERENCES institutions(id);
ALTER TABLE users ADD COLUMN role_v2 user_role_v2;

-- 3. Accreditation Levels
CREATE TABLE accreditation_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES accreditation_frameworks(id),
    level_number INT NOT NULL,
    label TEXT NOT NULL,
    min_score_threshold NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE accreditation_levels ENABLE ROW LEVEL SECURITY;

ALTER TABLE programs ADD COLUMN current_level_id UUID REFERENCES accreditation_levels(id);

-- 4. Seed PACUCOA Levels
DO $$
DECLARE
    v_framework_id UUID;
BEGIN
    SELECT id INTO v_framework_id FROM accreditation_frameworks WHERE name = 'PACUCOA' LIMIT 1;
    IF v_framework_id IS NOT NULL THEN
        INSERT INTO accreditation_levels (framework_id, level_number, label, min_score_threshold) VALUES
            (v_framework_id, 1, 'Candidate Status', 1.0),
            (v_framework_id, 2, 'Level I - Accredited Status', 3.0),
            (v_framework_id, 3, 'Level II - Re-accredited Status', 3.5),
            (v_framework_id, 4, 'Level III - Re-accredited Status', 4.0),
            (v_framework_id, 5, 'Level IV - Highest Recognition', 4.5);
    END IF;
END $$;

-- 5. Data Migration (Remapping users)
ALTER TABLE users ALTER COLUMN department_id DROP NOT NULL;

DO $$
BEGIN
    EXECUTE 'UPDATE users SET role_v2 = ''qa''::user_role_v2, institution_id = (SELECT id FROM institutions LIMIT 1), department_id = NULL WHERE role::text = ''qa_admin''';
    EXECUTE 'UPDATE users SET role_v2 = ''program_head''::user_role_v2 WHERE role::text = ''program_chair''';
    EXECUTE 'UPDATE users SET role_v2 = ''faculty''::user_role_v2 WHERE role::text = ''faculty''';
    EXECUTE 'UPDATE users SET role_v2 = ''alumni_rep''::user_role_v2 WHERE role::text = ''committee''';
END $$;

-- Drop old role and rename new
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users RENAME COLUMN role_v2 TO role;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- 6. Add New Test Accounts
DO $$
DECLARE
    v_department_id UUID;
    v_bsit_id UUID;
BEGIN
    SELECT id INTO v_department_id FROM departments WHERE code = 'CICT' LIMIT 1;
    SELECT id INTO v_bsit_id FROM programs WHERE code = 'BSIT' LIMIT 1;
    
    INSERT INTO users (full_name, email, role, department_id) 
    VALUES ('Dean CICT', 'dean.cict@sti.edu', 'dean'::user_role_v2, v_department_id);
    
    INSERT INTO users (full_name, email, role, program_id, department_id) 
    VALUES ('Mark Faculty', 'mark.faculty@sti.edu', 'faculty'::user_role_v2, v_bsit_id, v_department_id);
END $$;

-- 7. RLS POLICY REWRITES

-- Drop ALL existing policies (using a DO block to ignore errors if they don't exist)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- RE-CREATE POLICIES BASED ON V2 HIERARCHY

-- Helpers
DROP FUNCTION IF EXISTS get_current_user_id();
DROP FUNCTION IF EXISTS get_current_user_role();
DROP FUNCTION IF EXISTS get_current_user_program_id();
DROP FUNCTION IF EXISTS get_current_user_department_id();
DROP FUNCTION IF EXISTS get_current_user_institution_id();

CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS UUID AS $$ SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1; $$ LANGUAGE sql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS user_role_v2 AS $$ SELECT role FROM users WHERE auth_user_id = auth.uid() LIMIT 1; $$ LANGUAGE sql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION get_current_user_program_id() RETURNS UUID AS $$ SELECT program_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1; $$ LANGUAGE sql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION get_current_user_department_id() RETURNS UUID AS $$ SELECT department_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1; $$ LANGUAGE sql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION get_current_user_institution_id() RETURNS UUID AS $$ SELECT institution_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1; $$ LANGUAGE sql SECURITY DEFINER;

-- Table: Users
CREATE POLICY "QA can view all users" ON users FOR SELECT USING (get_current_user_role() = 'qa');
CREATE POLICY "Users can view users in their department" ON users FOR SELECT USING (department_id = get_current_user_department_id());

-- Table: Foundational Data (Read)
CREATE POLICY "Read foundational data" ON institutions FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON departments FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON programs FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON accreditation_frameworks FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON accreditation_areas FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON accreditation_levels FOR SELECT USING (true);

-- Table: Foundational Data (Write)
CREATE POLICY "QA Admin configures areas" ON accreditation_areas FOR ALL USING (get_current_user_role() = 'qa');
CREATE POLICY "QA Admin configures levels" ON accreditation_levels FOR ALL USING (get_current_user_role() = 'qa');
CREATE POLICY "QA Admin configures criteria" ON accreditation_criteria FOR ALL USING (get_current_user_role() = 'qa');

-- Table: Criteria
CREATE POLICY "Everyone can read criteria" ON accreditation_criteria FOR SELECT USING (true);

-- Table: Area Assignments
CREATE POLICY "Everyone can read assignments" ON area_assignments FOR SELECT USING (true);
CREATE POLICY "QA and Program Head can manage assignments" ON area_assignments FOR ALL USING (
    get_current_user_role() = 'qa' OR
    (get_current_user_role() = 'program_head' AND program_id = get_current_user_program_id())
);

-- Table: Readiness Scores
CREATE POLICY "Everyone can read scores" ON readiness_scores FOR SELECT USING (true);

-- Table: Simulations
CREATE POLICY "Users can read own and program simulations" ON simulations FOR SELECT USING (
    created_by = get_current_user_id() OR
    program_id = get_current_user_program_id() OR
    program_id IN (SELECT id FROM programs WHERE department_id = get_current_user_department_id()) OR -- For Dean
    get_current_user_role() = 'qa'
);
CREATE POLICY "Users can insert own simulations" ON simulations FOR INSERT WITH CHECK (created_by = get_current_user_id());

-- Table: Evidence Documents
CREATE POLICY "QA, Dean, and Reps can read evidence" ON evidence_documents FOR SELECT USING (
    get_current_user_role() = 'qa' OR
    (get_current_user_role() = 'dean' AND program_id IN (SELECT id FROM programs WHERE department_id = get_current_user_department_id())) OR
    program_id = get_current_user_program_id()
);
-- Note: Alumni/Student Reps are prevented from viewing raw evidence in the UI application layer, 
-- but technically could query it. If strict DB level restriction is required:
-- (get_current_user_role() NOT IN ('alumni_rep', 'student_rep')) AND program_id = ...

CREATE POLICY "Faculty/PH can upload evidence to their program" ON evidence_documents FOR INSERT WITH CHECK (
    get_current_user_role() IN ('faculty', 'program_head') AND
    program_id = get_current_user_program_id() AND
    uploaded_by = get_current_user_id()
);

-- Complex Verification Policy
CREATE POLICY "Verification Policy" ON evidence_documents FOR UPDATE USING (
    (
        get_current_user_role() = 'qa'
    ) OR (
        get_current_user_role() = 'program_head' AND
        program_id = get_current_user_program_id() AND
        uploaded_by != get_current_user_id()
    ) OR (
        EXISTS (
            SELECT 1 FROM area_assignments aa
            JOIN accreditation_criteria ac ON ac.area_id = aa.area_id
            WHERE ac.id = evidence_documents.criterion_id
              AND aa.user_id = get_current_user_id()
              AND aa.program_id = evidence_documents.program_id
              AND aa.assignment_type IN ('area_chair', 'co_chair')
        ) AND
        uploaded_by != get_current_user_id()
    ) OR (
        uploaded_by = get_current_user_id() AND status = 'pending'
    )
);

