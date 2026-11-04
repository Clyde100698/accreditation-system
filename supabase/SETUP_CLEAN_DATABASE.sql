-- ============================================================================
-- PACUCOA ACCREDITATION SYSTEM: MASTER CLEAN SETUP SCRIPT
-- ============================================================================
-- Project Ref: svcsxskcyxfdcwxpfqna (MIT_Thesis)
--
-- This script performs a complete clean initialization of your database:
--   1. Extensions (uuid-ossp, pgcrypto)
--   2. Custom Enums
--   3. All 15 Core Tables with Constraints & Cascades
--   4. Performance Indexes
--   5. Storage Bucket ('evidence') with Access Policies
--   6. RLS Helper Functions & Security Policies
--   7. PACUCOA Structural Foundation (Framework, 5 Levels, 10 Standard Areas)
--   8. Default Institution ('STI West Negros University')
--   9. Default System Administrator Account (email: admin@sti.edu / pass: admin123456)
--
-- ZERO dummy programs, criteria, evidence, or test users are seeded.
-- You can input your departments, programs, users, and criteria cleanly.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. CUSTOM TYPES / ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'system_admin',
        'qa',
        'dean',
        'program_head',
        'faculty',
        'observer',
        'alumni_rep',
        'student_rep'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE criterion_category AS ENUM ('input', 'process', 'outcome');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE evidence_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE readiness_status AS ENUM ('no_evidence', 'weak', 'sufficient');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE assignment_type AS ENUM ('area_chair', 'co_chair', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE cycle_status AS ENUM ('upcoming', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE recommendation_status AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ----------------------------------------------------------------------------
-- 3. CORE SCHEMAS & TABLES
-- ----------------------------------------------------------------------------

-- Institutions
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments / Colleges
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accreditation Frameworks
CREATE TABLE IF NOT EXISTS accreditation_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accreditation Levels (e.g., Candidate Status, Level I - IV)
CREATE TABLE IF NOT EXISTS accreditation_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES accreditation_frameworks(id) ON DELETE CASCADE,
    level_number INT NOT NULL,
    label TEXT NOT NULL,
    min_score_threshold NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Programs
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    current_level_id UUID REFERENCES accreditation_levels(id) ON DELETE SET NULL,
    is_accreditation_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accreditation Areas (Standard Area I - X)
CREATE TABLE IF NOT EXISTS accreditation_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES accreditation_frameworks(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL,
    auth_user_id UUID UNIQUE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accreditation Criteria (Supports hierarchical trees and dual adequacy/effectiveness axes)
CREATE TABLE IF NOT EXISTS accreditation_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES accreditation_frameworks(id) ON DELETE CASCADE,
    parent_criterion_id UUID REFERENCES accreditation_criteria(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    category criterion_category NOT NULL,
    weight NUMERIC DEFAULT 1.0,
    required_count INT DEFAULT 1,
    expected_document_type TEXT,
    rating_axis TEXT CHECK (rating_axis IN ('adequacy', 'effectiveness', 'both', 'single', NULL)),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    area_id UUID REFERENCES accreditation_areas(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Area Assignments (Faculty / Chair / Co-Chair committee scopes)
CREATE TABLE IF NOT EXISTS area_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID NOT NULL REFERENCES accreditation_areas(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_type assignment_type NOT NULL,
    assigned_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(area_id, program_id, user_id)
);

-- Evidence Documents
CREATE TABLE IF NOT EXISTS evidence_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    criterion_id UUID NOT NULL REFERENCES accreditation_criteria(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    document_type TEXT,
    effective_date DATE,
    version INT DEFAULT 1,
    previous_version_id UUID REFERENCES evidence_documents(id) ON DELETE SET NULL,
    status evidence_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Readiness Scores
CREATE TABLE IF NOT EXISTS readiness_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    criterion_id UUID NOT NULL REFERENCES accreditation_criteria(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    score NUMERIC CHECK (score >= 0 AND score <= 5),
    status readiness_status DEFAULT 'no_evidence',
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(criterion_id, program_id)
);

-- What-If Simulations
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    simulated_criteria_ids JSONB,
    projected_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accreditation Cycles
CREATE TABLE IF NOT EXISTS accreditation_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_level TEXT NOT NULL,
    target_date DATE,
    status cycle_status DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Accreditation Recommendations
CREATE TABLE IF NOT EXISTS accreditation_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID NOT NULL REFERENCES accreditation_cycles(id) ON DELETE CASCADE,
    area_id UUID NOT NULL REFERENCES accreditation_areas(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status recommendation_status DEFAULT 'open',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Defensibility Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_departments_institution_id ON departments(institution_id);
CREATE INDEX IF NOT EXISTS idx_programs_department_id ON programs(department_id);
CREATE INDEX IF NOT EXISTS idx_programs_accreditation_active ON programs(department_id, is_accreditation_active);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_program_id ON users(program_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_criteria_framework_id ON accreditation_criteria(framework_id);
CREATE INDEX IF NOT EXISTS idx_criteria_parent_id ON accreditation_criteria(parent_criterion_id);
CREATE INDEX IF NOT EXISTS idx_criteria_area_id ON accreditation_criteria(area_id);
CREATE INDEX IF NOT EXISTS idx_criteria_program_id ON accreditation_criteria(program_id);
CREATE INDEX IF NOT EXISTS idx_area_assignments_area_id ON area_assignments(area_id);
CREATE INDEX IF NOT EXISTS idx_area_assignments_program_id ON area_assignments(program_id);
CREATE INDEX IF NOT EXISTS idx_area_assignments_user_id ON area_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_criterion_id ON evidence_documents(criterion_id);
CREATE INDEX IF NOT EXISTS idx_evidence_uploaded_by ON evidence_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_evidence_program_id ON evidence_documents(program_id);
CREATE INDEX IF NOT EXISTS idx_scores_criterion_id ON readiness_scores(criterion_id);
CREATE INDEX IF NOT EXISTS idx_scores_program_id ON readiness_scores(program_id);
CREATE INDEX IF NOT EXISTS idx_simulations_created_by ON simulations(created_by);
CREATE INDEX IF NOT EXISTS idx_simulations_program_id ON simulations(program_id);
CREATE INDEX IF NOT EXISTS idx_cycles_program_id ON accreditation_cycles(program_id);
CREATE INDEX IF NOT EXISTS idx_recs_cycle_id ON accreditation_recommendations(cycle_id);
CREATE INDEX IF NOT EXISTS idx_recs_area_id ON accreditation_recommendations(area_id);
CREATE INDEX IF NOT EXISTS idx_recs_program_id ON accreditation_recommendations(program_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- ----------------------------------------------------------------------------
-- 5. STORAGE BUCKET CONFIGURATION
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload evidence files" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update evidence files" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete evidence files" ON storage.objects;
EXCEPTION WHEN undefined_table THEN null; END $$;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'evidence');
CREATE POLICY "Authenticated users can upload evidence files" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'evidence' AND auth.role() = 'authenticated'
);
CREATE POLICY "Authenticated users can update evidence files" ON storage.objects FOR UPDATE USING (
    bucket_id = 'evidence' AND auth.role() = 'authenticated'
);
CREATE POLICY "Authenticated users can delete evidence files" ON storage.objects FOR DELETE USING (
    bucket_id = 'evidence' AND auth.role() = 'authenticated'
);

-- ----------------------------------------------------------------------------
-- 6. RLS HELPER FUNCTIONS & POLICIES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS UUID AS $$
    SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS user_role AS $$
    SELECT role FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_program_id() RETURNS UUID AS $$
    SELECT program_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_department_id() RETURNS UUID AS $$
    SELECT department_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_institution_id() RETURNS UUID AS $$
    SELECT institution_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS across all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Foundational Data Policies (Read by authenticated/anon, managed by system_admin & qa)
CREATE POLICY "Read institutions" ON institutions FOR SELECT USING (true);
CREATE POLICY "Manage institutions" ON institutions FOR ALL USING (
    get_current_user_role() = 'system_admin'
);

CREATE POLICY "Read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Manage departments" ON departments FOR ALL USING (
    get_current_user_role() = 'system_admin'
);

CREATE POLICY "Read frameworks" ON accreditation_frameworks FOR SELECT USING (true);
CREATE POLICY "Manage frameworks" ON accreditation_frameworks FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa')
);

CREATE POLICY "Read levels" ON accreditation_levels FOR SELECT USING (true);
CREATE POLICY "Manage levels" ON accreditation_levels FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa')
);

CREATE POLICY "Read programs" ON programs FOR SELECT USING (true);
CREATE POLICY "System admin manages programs" ON programs FOR ALL USING (
    get_current_user_role() = 'system_admin'
);
CREATE POLICY "QA toggles program accreditation active scope" ON programs FOR UPDATE USING (
    get_current_user_role() = 'qa'
) WITH CHECK (
    get_current_user_role() = 'qa'
);

CREATE POLICY "Read areas" ON accreditation_areas FOR SELECT USING (true);
CREATE POLICY "Manage areas" ON accreditation_areas FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa')
);

-- Users Table Policies
CREATE POLICY "Read users" ON users FOR SELECT USING (
    get_current_user_role() IN ('system_admin', 'qa', 'dean', 'observer') OR
    department_id = get_current_user_department_id() OR
    id = get_current_user_id()
);
CREATE POLICY "System admin manages users" ON users FOR ALL USING (
    get_current_user_role() = 'system_admin'
);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (
    id = get_current_user_id() OR auth_user_id = auth.uid()
);

-- Criteria Policies
CREATE POLICY "Read criteria" ON accreditation_criteria FOR SELECT USING (true);
CREATE POLICY "Manage criteria" ON accreditation_criteria FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa')
);

-- Area Assignments Policies
CREATE POLICY "Read area assignments" ON area_assignments FOR SELECT USING (true);
CREATE POLICY "Manage area assignments" ON area_assignments FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa') OR
    (get_current_user_role() = 'program_head' AND program_id = get_current_user_program_id())
);

-- Evidence Documents Policies
CREATE POLICY "Read evidence" ON evidence_documents FOR SELECT USING (true);
CREATE POLICY "Upload evidence" ON evidence_documents FOR INSERT WITH CHECK (
    get_current_user_role() IN ('system_admin', 'qa', 'faculty', 'program_head') AND
    (
        get_current_user_role() IN ('system_admin', 'qa') OR
        (
            program_id = get_current_user_program_id() AND
            uploaded_by = get_current_user_id() AND
            EXISTS (
                SELECT 1 FROM programs 
                WHERE programs.id = evidence_documents.program_id 
                  AND programs.is_accreditation_active = true
            )
        )
    )
);
CREATE POLICY "Update evidence" ON evidence_documents FOR UPDATE USING (
    get_current_user_role() IN ('system_admin', 'qa') OR
    (get_current_user_role() = 'program_head' AND program_id = get_current_user_program_id() AND uploaded_by != get_current_user_id()) OR
    (
        EXISTS (
            SELECT 1 FROM area_assignments aa
            JOIN accreditation_criteria ac ON ac.area_id = aa.area_id
            WHERE ac.id = evidence_documents.criterion_id
              AND aa.user_id = get_current_user_id()
              AND aa.program_id = evidence_documents.program_id
              AND aa.assignment_type IN ('area_chair', 'co_chair')
        ) AND uploaded_by != get_current_user_id()
    ) OR
    (uploaded_by = get_current_user_id() AND status = 'pending')
);

-- Readiness Scores Policies
CREATE POLICY "Read readiness scores" ON readiness_scores FOR SELECT USING (true);
CREATE POLICY "Write readiness scores" ON readiness_scores FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa', 'dean', 'program_head')
);

-- Simulations Policies
CREATE POLICY "Read simulations" ON simulations FOR SELECT USING (
    created_by = get_current_user_id() OR
    program_id = get_current_user_program_id() OR
    get_current_user_role() IN ('system_admin', 'qa', 'dean')
);
CREATE POLICY "Insert simulations" ON simulations FOR INSERT WITH CHECK (
    created_by = get_current_user_id()
);

-- Cycles Policies
CREATE POLICY "Read cycles" ON accreditation_cycles FOR SELECT USING (true);
CREATE POLICY "Manage cycles" ON accreditation_cycles FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa', 'dean')
);

-- Recommendations Policies
CREATE POLICY "Read recommendations" ON accreditation_recommendations FOR SELECT USING (true);
CREATE POLICY "Manage recommendations" ON accreditation_recommendations FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa', 'dean', 'program_head')
);

-- Audit Log Policies
CREATE POLICY "Read audit log" ON audit_log FOR SELECT USING (
    get_current_user_role() IN ('system_admin', 'qa', 'dean')
);
CREATE POLICY "Insert audit log" ON audit_log FOR INSERT WITH CHECK (
    true
);

-- ----------------------------------------------------------------------------
-- 7. STRUCTURAL FOUNDATION DATA (PACUCOA Instrument Only - Zero Seed Records)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_framework_id UUID;
    v_inst_id UUID;
BEGIN
    -- 1. Default Framework
    SELECT id INTO v_framework_id FROM accreditation_frameworks WHERE name = 'PACUCOA' LIMIT 1;
    IF v_framework_id IS NULL THEN
        INSERT INTO accreditation_frameworks (name, description)
        VALUES ('PACUCOA', 'Philippine Association of Colleges and Universities Commission on Accreditation')
        RETURNING id INTO v_framework_id;
    END IF;

    -- 2. PACUCOA Levels
    IF NOT EXISTS (SELECT 1 FROM accreditation_levels WHERE framework_id = v_framework_id) THEN
        INSERT INTO accreditation_levels (framework_id, level_number, label, min_score_threshold) VALUES
            (v_framework_id, 1, 'Candidate Status', 1.0),
            (v_framework_id, 2, 'Level I - Accredited Status', 3.0),
            (v_framework_id, 3, 'Level II - Re-accredited Status', 3.5),
            (v_framework_id, 4, 'Level III - Re-accredited Status', 4.0),
            (v_framework_id, 5, 'Level IV - Highest Recognition', 4.5);
    END IF;

    -- 3. Standard 10 PACUCOA Areas
    IF NOT EXISTS (SELECT 1 FROM accreditation_areas WHERE framework_id = v_framework_id) THEN
        INSERT INTO accreditation_areas (framework_id, code, title) VALUES
            (v_framework_id, 'Area I',    'Philosophy and Objectives'),
            (v_framework_id, 'Area II',   'Faculty'),
            (v_framework_id, 'Area III',  'Curriculum and Instruction'),
            (v_framework_id, 'Area IV',   'Library'),
            (v_framework_id, 'Area V',    'Research'),
            (v_framework_id, 'Area VI',   'Extension and Community Involvement'),
            (v_framework_id, 'Area VII',  'Student Services'),
            (v_framework_id, 'Area VIII', 'Social Orientation and Community Involvement'),
            (v_framework_id, 'Area IX',   'Physical Plant and Facilities'),
            (v_framework_id, 'Area X',    'Organization and Administration');
    END IF;

    -- 4. Baseline Institution
    SELECT id INTO v_inst_id FROM institutions WHERE name = 'STI West Negros University' LIMIT 1;
    IF v_inst_id IS NULL THEN
        INSERT INTO institutions (name)
        VALUES ('STI West Negros University')
        RETURNING id INTO v_inst_id;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 8. INITIAL SYSTEM ADMINISTRATOR PROVISIONING
-- ----------------------------------------------------------------------------
-- Email: admin@sti.edu
-- Password: admin123456
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_admin_id UUID;
    v_encrypted_pw TEXT;
    v_inst_id UUID;
BEGIN
    SELECT id INTO v_inst_id FROM institutions LIMIT 1;
    v_encrypted_pw := crypt('admin123456', gen_salt('bf'));

    -- Find existing auth user or create new
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@sti.edu' LIMIT 1;

    IF v_admin_id IS NULL THEN
        v_admin_id := gen_random_uuid();

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change,
            email_change_token_new,
            email_change_token_current,
            phone_change,
            phone_change_token,
            reauthentication_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_admin_id,
            'authenticated',
            'authenticated',
            'admin@sti.edu',
            v_encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"System Administrator"}'::jsonb,
            NOW(),
            NOW(),
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
        );
    ELSE
        UPDATE auth.users 
        SET encrypted_password = v_encrypted_pw,
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW(),
            confirmation_token = '',
            recovery_token = '',
            email_change = '',
            email_change_token_new = '',
            email_change_token_current = '',
            phone_change = '',
            phone_change_token = '',
            reauthentication_token = ''
        WHERE id = v_admin_id;
    END IF;

    -- Ensure matching entry in auth.identities
    DELETE FROM auth.identities WHERE user_id = v_admin_id;

    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        v_admin_id,
        v_admin_id,
        format('{"sub":"%s","email":"%s"}', v_admin_id, 'admin@sti.edu')::jsonb,
        'email',
        v_admin_id::text,
        NOW(),
        NOW(),
        NOW()
    );

    -- Ensure public.users entry
    INSERT INTO public.users (
        full_name,
        email,
        role,
        auth_user_id,
        institution_id
    ) VALUES (
        'System Administrator',
        'admin@sti.edu',
        'system_admin',
        v_admin_id,
        v_inst_id
    )
    ON CONFLICT (email) DO UPDATE
    SET auth_user_id = v_admin_id,
        role = 'system_admin',
        full_name = 'System Administrator',
        institution_id = v_inst_id;

END $$;

-- Verify Clean Setup
SELECT 'SETUP_COMPLETE' AS status,
       (SELECT count(*) FROM institutions) AS institutions_count,
       (SELECT count(*) FROM accreditation_frameworks) AS frameworks_count,
       (SELECT count(*) FROM accreditation_areas) AS areas_count,
       (SELECT count(*) FROM accreditation_levels) AS levels_count,
       (SELECT count(*) FROM departments) AS departments_count,
       (SELECT count(*) FROM programs) AS programs_count,
       (SELECT count(*) FROM accreditation_criteria) AS criteria_count,
       (SELECT count(*) FROM users) AS users_count;
