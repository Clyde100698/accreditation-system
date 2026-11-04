-- ============================================================================
-- SQL SCRIPT: Enforce Role-Based Access Policies and Storage Security
-- Tables: simulations, evidence_documents, accreditation_recommendations, compliance_actions, storage.buckets
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADD storage_path TO evidence_documents AND POPULATE IT
-- Preserves existing file_url untouched while enabling signed-URL resolution.
-- ----------------------------------------------------------------------------
ALTER TABLE evidence_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;

UPDATE evidence_documents
SET storage_path = split_part(file_url, '/storage/v1/object/public/evidence/', 2)
WHERE file_url LIKE '%/storage/v1/object/public/evidence/%'
  AND (storage_path IS NULL OR storage_path = '');

-- ----------------------------------------------------------------------------
-- 2. SIMULATIONS POLICIES
-- Allows INSERT only for QA, Dean, and Program Head where created_by matches.
-- Allows SELECT only for QA, Dean, and Program Head.
-- Blocks alumni_rep, student_rep, and faculty from reading or creating simulations.
-- ----------------------------------------------------------------------------
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert simulations" ON simulations;
DROP POLICY IF EXISTS "Read simulations" ON simulations;
DROP POLICY IF EXISTS "Users can insert own simulations" ON simulations;
DROP POLICY IF EXISTS "Users can read own and program simulations" ON simulations;
DROP POLICY IF EXISTS "Authorized roles can insert simulations" ON simulations;
DROP POLICY IF EXISTS "Authorized roles can read simulations" ON simulations;

CREATE POLICY "Authorized roles can insert simulations" ON simulations
FOR INSERT WITH CHECK (
    get_current_user_role() IN ('qa', 'dean', 'program_head')
    AND created_by = get_current_user_id()
);

CREATE POLICY "Authorized roles can read simulations" ON simulations
FOR SELECT USING (
    get_current_user_role() IN ('qa', 'dean', 'program_head')
);

-- ----------------------------------------------------------------------------
-- 3. EVIDENCE DOCUMENTS POLICIES
-- Allow-list: qa, dean, program_head, faculty.
-- Denied: system_admin (Table 3), alumni_rep, student_rep, observer.
-- Program Scope:
--   - qa: institution-wide scope (all programs).
--   - dean: college/department scope (all programs in user's department).
--   - program_head & faculty: program scope only (matching program_id).
-- Existing upload and update rules are retained.
-- ----------------------------------------------------------------------------
ALTER TABLE evidence_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read evidence" ON evidence_documents;
DROP POLICY IF EXISTS "Users can read own and program evidence" ON evidence_documents;
DROP POLICY IF EXISTS "Exclude representatives from evidence select" ON evidence_documents;
DROP POLICY IF EXISTS "Authorized roles read evidence" ON evidence_documents;
DROP POLICY IF EXISTS "Authorized roles read scoped evidence" ON evidence_documents;

CREATE POLICY "Authorized roles read scoped evidence" ON evidence_documents
FOR SELECT USING (
    (get_current_user_role() = 'qa')
    OR
    (get_current_user_role() = 'dean' AND program_id IN (
        SELECT id FROM programs WHERE department_id = get_current_user_department_id()
    ))
    OR
    (get_current_user_role() IN ('program_head', 'faculty') AND program_id = get_current_user_program_id())
);

-- ----------------------------------------------------------------------------
-- 4. ACCREDITATION RECOMMENDATIONS POLICIES
-- SELECT: Allowed for qa, dean, program_head, faculty.
-- MANAGE (INSERT, UPDATE, DELETE): Only qa and program_head.
-- Dean is read-only per Table 3; System Admin has no evaluation access.
-- ----------------------------------------------------------------------------
ALTER TABLE accreditation_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read recommendations" ON accreditation_recommendations;
DROP POLICY IF EXISTS "Manage recommendations" ON accreditation_recommendations;
DROP POLICY IF EXISTS "Exclude representatives from recommendations select" ON accreditation_recommendations;
DROP POLICY IF EXISTS "Authorized roles read recommendations" ON accreditation_recommendations;
DROP POLICY IF EXISTS "Authorized roles manage recommendations" ON accreditation_recommendations;

CREATE POLICY "Authorized roles read recommendations" ON accreditation_recommendations
FOR SELECT USING (
    get_current_user_role() IN ('qa', 'dean', 'program_head', 'faculty')
);

CREATE POLICY "Authorized roles manage recommendations" ON accreditation_recommendations
FOR ALL USING (
    get_current_user_role() IN ('qa', 'program_head')
) WITH CHECK (
    get_current_user_role() IN ('qa', 'program_head')
);

-- ----------------------------------------------------------------------------
-- 5. COMPLIANCE ACTIONS POLICIES
-- SELECT: Allowed for qa, dean, program_head, faculty.
-- MANAGE (INSERT, UPDATE, DELETE): Only qa and program_head.
-- ----------------------------------------------------------------------------
ALTER TABLE compliance_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read compliance actions" ON compliance_actions;
DROP POLICY IF EXISTS "Manage compliance actions" ON compliance_actions;
DROP POLICY IF EXISTS "Exclude representatives from compliance actions select" ON compliance_actions;
DROP POLICY IF EXISTS "Authorized roles read compliance actions" ON compliance_actions;
DROP POLICY IF EXISTS "Authorized roles manage compliance actions" ON compliance_actions;

CREATE POLICY "Authorized roles read compliance actions" ON compliance_actions
FOR SELECT USING (
    get_current_user_role() IN ('qa', 'dean', 'program_head', 'faculty')
);

CREATE POLICY "Authorized roles manage compliance actions" ON compliance_actions
FOR ALL USING (
    get_current_user_role() IN ('qa', 'program_head')
) WITH CHECK (
    get_current_user_role() IN ('qa', 'program_head')
);

-- ----------------------------------------------------------------------------
-- 6. STORAGE BUCKET PRIVACY
-- Sets the 'evidence' bucket to private to disable public unauthenticated URL access.
-- All client access will now go through authenticated signed URLs.
-- ----------------------------------------------------------------------------
UPDATE storage.buckets SET public = false WHERE id = 'evidence';

-- (Rollback command if ever needed to switch back to public:
-- UPDATE storage.buckets SET public = true WHERE id = 'evidence';)
