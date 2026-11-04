-- ============================================================================
-- MIGRATION: V8 Program-Specific Criteria (Shared Base + Program Overrides)
-- ============================================================================
-- HOW CRITERIA ARE SCOPED AFTER THIS MIGRATION:
--   * accreditation_criteria.program_id IS NULL      -> SHARED criterion
--     (applies to every program, e.g. faculty qualifications, library, etc.)
--   * accreditation_criteria.program_id = <program>  -> PROGRAM-SPECIFIC criterion
--     (only that program sees it, e.g. BSP Psychological Testing Laboratory)
--   * program_criterion_exclusions (program, criterion) -> a SHARED criterion
--     that is HIDDEN / NOT APPLICABLE for one program
--     (e.g. hide the COSC1021 Software Engineering lab manual for BSP)
--
-- HOW TO APPLY:
--   Open Supabase Dashboard -> SQL Editor -> paste this whole file -> Run.
--   Safe to run multiple times (idempotent).
-- ============================================================================

-- 1. Exclusion table (which shared criteria are hidden for which program)
CREATE TABLE IF NOT EXISTS program_criterion_exclusions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    criterion_id UUID NOT NULL REFERENCES accreditation_criteria(id) ON DELETE CASCADE,
    created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_program_criterion_exclusion UNIQUE (program_id, criterion_id)
);

CREATE INDEX IF NOT EXISTS idx_pce_program_id ON program_criterion_exclusions(program_id);
CREATE INDEX IF NOT EXISTS idx_pce_criterion_id ON program_criterion_exclusions(criterion_id);

-- 2. Make sure program-specific criteria are removed when their program is deleted
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'accreditation_criteria_program_id_fkey'
    ) THEN
        ALTER TABLE accreditation_criteria DROP CONSTRAINT accreditation_criteria_program_id_fkey;
    END IF;

    ALTER TABLE accreditation_criteria
        ADD CONSTRAINT accreditation_criteria_program_id_fkey
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE;
END $$;

CREATE INDEX IF NOT EXISTS idx_criteria_program_id ON accreditation_criteria(program_id);

-- 3. Row-Level Security
ALTER TABLE program_criterion_exclusions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read program criterion exclusions" ON program_criterion_exclusions;
CREATE POLICY "Everyone can read program criterion exclusions"
    ON program_criterion_exclusions FOR SELECT USING (true);

DROP POLICY IF EXISTS "QA manages program criterion exclusions" ON program_criterion_exclusions;
CREATE POLICY "QA manages program criterion exclusions"
    ON program_criterion_exclusions FOR ALL USING (
        get_current_user_role() IN ('qa', 'system_admin')
    ) WITH CHECK (
        get_current_user_role() IN ('qa', 'system_admin')
    );

-- 4. Ask PostgREST to reload its schema cache so the new table is visible immediately
NOTIFY pgrst, 'reload schema';

