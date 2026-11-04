-- ============================================================================
-- SEED 10 PACUCOA AREAS ONLY (TOUCHES NO ACCOUNTS OR USERS)
-- ============================================================================
-- Safe to run: Does NOT delete or modify any existing users, accounts, or programs.
-- ============================================================================

DO $$
DECLARE
    v_framework_id UUID;
BEGIN
    SELECT id INTO v_framework_id FROM accreditation_frameworks WHERE name = 'PACUCOA' LIMIT 1;
    IF v_framework_id IS NULL THEN
        INSERT INTO accreditation_frameworks (name, description)
        VALUES ('PACUCOA', 'Philippine Association of Colleges and Universities Commission on Accreditation')
        RETURNING id INTO v_framework_id;
    END IF;

    -- Insert the 10 PACUCOA Areas only if not already present
    IF NOT EXISTS (SELECT 1 FROM accreditation_areas WHERE framework_id = v_framework_id AND code = 'Area I') THEN
        INSERT INTO accreditation_areas (framework_id, code, title) VALUES
            (v_framework_id, 'Area I', 'Philosophy and Objectives'),
            (v_framework_id, 'Area II', 'Faculty'),
            (v_framework_id, 'Area III', 'Curriculum and Instruction'),
            (v_framework_id, 'Area IV', 'Library'),
            (v_framework_id, 'Area V', 'Laboratories'),
            (v_framework_id, 'Area VI', 'Physical Plant and Facilities'),
            (v_framework_id, 'Area VII', 'Student Personnel Services'),
            (v_framework_id, 'Area VIII', 'Social Orientation and Community Involvement'),
            (v_framework_id, 'Area IX', 'Organization and Administration'),
            (v_framework_id, 'Area X', 'Research');
    END IF;
END $$;
