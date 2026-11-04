-- MIGRATION: Add Areas, Area Assignments, and schema updates
-- Run this in Supabase SQL Editor AFTER FRESH_START.sql

-- New enum
CREATE TYPE assignment_type AS ENUM ('area_chair', 'co_chair');

-- Accreditation Areas table
CREATE TABLE accreditation_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES accreditation_frameworks(id),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link criteria to areas
ALTER TABLE accreditation_criteria ADD COLUMN area_id UUID REFERENCES accreditation_areas(id);

-- Area assignments table
CREATE TABLE area_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID NOT NULL REFERENCES accreditation_areas(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    assignment_type assignment_type NOT NULL,
    assigned_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(area_id, program_id, user_id)
);

-- Indexes
CREATE INDEX idx_areas_framework_id ON accreditation_areas(framework_id);
CREATE INDEX idx_criteria_area_id ON accreditation_criteria(area_id);
CREATE INDEX idx_area_assignments_area_id ON area_assignments(area_id);
CREATE INDEX idx_area_assignments_program_id ON area_assignments(program_id);
CREATE INDEX idx_area_assignments_user_id ON area_assignments(user_id);

-- Seed the 10 PACUCOA Areas
INSERT INTO accreditation_areas (framework_id, code, title)
SELECT f.id, area.code, area.title
FROM accreditation_frameworks f,
(VALUES
    ('Area I',    'Philosophy and Objectives'),
    ('Area II',   'Faculty (TBD — confirm from full instrument)'),
    ('Area III',  'Curriculum and Instruction (TBD — confirm from full instrument)'),
    ('Area IV',   'Library (TBD — confirm from full instrument)'),
    ('Area V',    'Research'),
    ('Area VI',   'Extension and Community Involvement (TBD — confirm from full instrument)'),
    ('Area VII',  'Student Services'),
    ('Area VIII', 'Social Orientation and Community Involvement'),
    ('Area IX',   'Physical Plant and Facilities'),
    ('Area X',    'Organization and Administration')
) AS area(code, title)
WHERE f.name = 'PACUCOA';

-- Readiness scoring function
CREATE OR REPLACE FUNCTION recalculate_readiness(p_program_id UUID)
RETURNS void AS $$
DECLARE
    r RECORD;
    v_verified_count INT;
    v_total_required INT;
    v_has_old_docs BOOLEAN;
    v_has_type_mismatch BOOLEAN;
    v_score NUMERIC;
    v_status readiness_status;
BEGIN
    FOR r IN SELECT id, required_count, expected_document_type FROM accreditation_criteria
    LOOP
        v_total_required := COALESCE(r.required_count, 1);
        
        -- Count verified evidence for this criterion+program
        SELECT COUNT(*) INTO v_verified_count
        FROM evidence_documents
        WHERE criterion_id = r.id AND program_id = p_program_id AND status = 'verified';

        v_total_required := r.required_count;

        -- Check for old documents (older than 5 years)
        SELECT EXISTS(
            SELECT 1 FROM evidence_documents
            WHERE criterion_id = r.id AND program_id = p_program_id AND status = 'verified'
            AND effective_date < (CURRENT_DATE - INTERVAL '5 years')
        ) INTO v_has_old_docs;

        -- Check for document type mismatch
        SELECT EXISTS(
            SELECT 1 FROM evidence_documents
            WHERE criterion_id = r.id AND program_id = p_program_id AND status = 'verified'
            AND r.expected_document_type IS NOT NULL
            AND document_type != r.expected_document_type
        ) INTO v_has_type_mismatch;

        -- Calculate score
        IF v_verified_count = 0 THEN
            v_score := 0;
            v_status := 'no_evidence';
        ELSIF v_verified_count < v_total_required OR v_has_old_docs OR v_has_type_mismatch THEN
            -- Weak: score 1-2 based on how close to requirements
            v_score := LEAST(2, ROUND((v_verified_count::numeric / GREATEST(v_total_required, 1)) * 2, 1));
            IF v_score < 1 THEN v_score := 1; END IF;
            v_status := 'weak';
        ELSE
            -- Sufficient: score 3-5 based on completeness ratio
            v_score := 3 + LEAST(2, ROUND((v_verified_count::numeric / GREATEST(v_total_required, 1) - 1) * 2, 1));
            IF v_score > 5 THEN v_score := 5; END IF;
            v_status := 'sufficient';
        END IF;

        -- Upsert readiness score
        INSERT INTO readiness_scores (criterion_id, program_id, score, status, last_computed_at)
        VALUES (r.id, p_program_id, v_score, v_status, NOW())
        ON CONFLICT (criterion_id, program_id)
        DO UPDATE SET score = v_score, status = v_status, last_computed_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: auto-recalculate when evidence status changes
CREATE OR REPLACE FUNCTION trigger_recalculate_readiness()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM recalculate_readiness(NEW.program_id);
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM recalculate_readiness(NEW.program_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER evidence_status_change_trigger
    AFTER INSERT OR UPDATE ON evidence_documents
    FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_readiness();
