-- FULL RLS POLICIES FOR ACCREDITATION SYSTEM
-- This applies the final row-level security constraints, including Area Chair verification logic.
-- Run in Supabase SQL Editor AFTER reviewing.

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_assignments ENABLE ROW LEVEL SECURITY;

-- Helper functions to get current user details securely
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


-- 1. USERS
CREATE POLICY "Users can view users in their department" ON users
    FOR SELECT USING (department_id = get_current_user_department_id());

-- 2. INSTITUTIONS, DEPARTMENTS, PROGRAMS, FRAMEWORKS, AREAS
-- Everyone can read foundational data
CREATE POLICY "Read foundational data" ON institutions FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON departments FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON programs FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON accreditation_frameworks FOR SELECT USING (true);
CREATE POLICY "Read foundational data" ON accreditation_areas FOR SELECT USING (true);
-- Only QA Admin can insert/update foundational data
CREATE POLICY "QA Admin configures areas" ON accreditation_areas FOR ALL
    USING (get_current_user_role() = 'qa_admin');


-- 3. AREA ASSIGNMENTS
CREATE POLICY "Everyone can read assignments" ON area_assignments
    FOR SELECT USING (true);

CREATE POLICY "QA Admin and PC can manage assignments" ON area_assignments
    FOR ALL
    USING (
        get_current_user_role() = 'qa_admin' OR
        (get_current_user_role() = 'program_chair' AND program_id = get_current_user_program_id())
    );


-- 4. ACCREDITATION CRITERIA
CREATE POLICY "Everyone can read criteria" ON accreditation_criteria
    FOR SELECT USING (true);

CREATE POLICY "QA Admin can manage criteria" ON accreditation_criteria
    FOR ALL
    USING (get_current_user_role() = 'qa_admin');


-- 5. EVIDENCE DOCUMENTS
CREATE POLICY "Everyone can read evidence" ON evidence_documents
    FOR SELECT USING (true);

CREATE POLICY "Faculty/PC can upload evidence to their program" ON evidence_documents
    FOR INSERT
    WITH CHECK (
        get_current_user_role() IN ('faculty', 'program_chair') AND
        program_id = get_current_user_program_id() AND
        uploaded_by = get_current_user_id()
    );

-- THE COMPLEX VERIFICATION POLICY
CREATE POLICY "Verification Policy" ON evidence_documents
    FOR UPDATE
    USING (
        (
            -- QA Admin can update ANY evidence
            get_current_user_role() = 'qa_admin'
        ) OR (
            -- Program Chair can update any evidence in their program (except their own)
            get_current_user_role() = 'program_chair' AND
            program_id = get_current_user_program_id() AND
            uploaded_by != get_current_user_id()
        ) OR (
            -- Area Chair / Co-Chair can update evidence in their assigned area + program (except their own)
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
            -- Uploader can update their own PENDING evidence (e.g., to fix typos, not change status)
            uploaded_by = get_current_user_id() AND status = 'pending'
        )
    );


-- 6. READINESS SCORES
CREATE POLICY "Everyone can read scores" ON readiness_scores
    FOR SELECT USING (true);
-- Only the database trigger can insert/update this table, so no insert/update policies needed for frontend users.


-- 7. SIMULATIONS
CREATE POLICY "Users can read own and program simulations" ON simulations
    FOR SELECT USING (
        created_by = get_current_user_id() OR
        program_id = get_current_user_program_id() OR
        get_current_user_role() = 'qa_admin'
    );

CREATE POLICY "Users can insert own simulations" ON simulations
    FOR INSERT WITH CHECK (created_by = get_current_user_id());
