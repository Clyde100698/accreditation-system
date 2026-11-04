-- ============================================================================
-- MIGRATION: FULLY CONFIGURABLE ACCREDITATION FRAMEWORK & RATING SCALES
-- ============================================================================
-- Eliminates all hardcoded framework assumptions.
-- Stores framework weights, rating scales, level thresholds, and optional criteria rules
-- entirely as dynamic database records editable by QA / System Admin.
-- ============================================================================

-- 1. Schema Additions to Existing Tables
ALTER TABLE accreditation_levels 
ADD COLUMN IF NOT EXISTS required_optional_criteria_count INT NOT NULL DEFAULT 0;

ALTER TABLE accreditation_areas 
ADD COLUMN IF NOT EXISTS weight NUMERIC NOT NULL DEFAULT 1.0;

ALTER TABLE accreditation_areas 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- 2. Rating Scales Table
CREATE TABLE IF NOT EXISTS rating_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES accreditation_frameworks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    scale_definition JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Level-Specific Criteria Table (e.g. Level III / Level IV additions)
CREATE TABLE IF NOT EXISTS level_specific_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID NOT NULL REFERENCES accreditation_levels(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    rating_scale_id UUID REFERENCES rating_scales(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_rating_scales_framework_id ON rating_scales(framework_id);
CREATE INDEX IF NOT EXISTS idx_level_criteria_level_id ON level_specific_criteria(level_id);
CREATE INDEX IF NOT EXISTS idx_level_criteria_rating_scale_id ON level_specific_criteria(rating_scale_id);
CREATE INDEX IF NOT EXISTS idx_areas_display_order ON accreditation_areas(display_order);

-- 5. Row Level Security Policies
ALTER TABLE rating_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_specific_criteria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read rating scales" ON rating_scales;
CREATE POLICY "Read rating scales" ON rating_scales FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage rating scales" ON rating_scales;
CREATE POLICY "Manage rating scales" ON rating_scales FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa')
);

DROP POLICY IF EXISTS "Read level criteria" ON level_specific_criteria;
CREATE POLICY "Read level criteria" ON level_specific_criteria FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage level criteria" ON level_specific_criteria;
CREATE POLICY "Manage level criteria" ON level_specific_criteria FOR ALL USING (
    get_current_user_role() IN ('system_admin', 'qa')
);

-- 6. Seed Configurable Data for PACUCOA (Stored as DATA, not code)
DO $$
DECLARE
    v_fw_id UUID;
    v_lvl3_id UUID;
    v_lvl4_id UUID;
    v_scale_likert_id UUID;
    v_scale_pct_id UUID;
    v_scale_binary_id UUID;
BEGIN
    SELECT id INTO v_fw_id FROM accreditation_frameworks WHERE name = 'PACUCOA' LIMIT 1;
    IF v_fw_id IS NULL THEN
        SELECT id INTO v_fw_id FROM accreditation_frameworks LIMIT 1;
    END IF;

    -- Update Area Weights and Display Orders (Sum of weights = 30 for PACUCOA, but dynamic in calculations)
    UPDATE accreditation_areas SET weight = 2.0, display_order = 1 WHERE code = 'Area I';
    UPDATE accreditation_areas SET weight = 4.0, display_order = 2 WHERE code = 'Area II';
    UPDATE accreditation_areas SET weight = 5.0, display_order = 3 WHERE code = 'Area III';
    UPDATE accreditation_areas SET weight = 3.0, display_order = 4 WHERE code = 'Area IV';
    UPDATE accreditation_areas SET weight = 3.0, display_order = 5 WHERE code = 'Area V';
    UPDATE accreditation_areas SET weight = 2.0, display_order = 6 WHERE code = 'Area VI';
    UPDATE accreditation_areas SET weight = 3.0, display_order = 7 WHERE code = 'Area VII';
    UPDATE accreditation_areas SET weight = 2.0, display_order = 8 WHERE code = 'Area VIII';
    UPDATE accreditation_areas SET weight = 3.0, display_order = 9 WHERE code = 'Area IX';
    UPDATE accreditation_areas SET weight = 3.0, display_order = 10 WHERE code = 'Area X';

    -- Seed Configurable Rating Scales
    INSERT INTO rating_scales (framework_id, name, description, scale_definition) VALUES
        (
            v_fw_id,
            'Standard 0-5 Likert Scale',
            'Standard academic rubric evaluating degree of compliance and documentation completeness.',
            '[
                {"value": 5, "label": "Excellent", "description": "Exceeds standard with outstanding documentation"},
                {"value": 4, "label": "Very Good", "description": "Meets standard with complete documentation"},
                {"value": 3, "label": "Good / Satisfactory", "description": "Meets minimum accreditation requirement"},
                {"value": 2, "label": "Fair", "description": "Partially met, documentation gaps identified"},
                {"value": 1, "label": "Poor", "description": "Substantially deficient"},
                {"value": 0, "label": "No Evidence", "description": "Zero documentation submitted"}
            ]'::jsonb
        ) RETURNING id INTO v_scale_likert_id;

    INSERT INTO rating_scales (framework_id, name, description, scale_definition) VALUES
        (
            v_fw_id,
            'Percentage Band Scale (OBE & Passing Rates)',
            'Used for licensure exam passing rates, graduation rates, and tracer study employment percentages.',
            '[
                {"value": 5, "label": "90% - 100% (High Distinction)", "min_pct": 90, "max_pct": 100},
                {"value": 4, "label": "80% - 89% (Proficient)", "min_pct": 80, "max_pct": 89},
                {"value": 3, "label": "75% - 79% (Accreditation Baseline)", "min_pct": 75, "max_pct": 79},
                {"value": 2, "label": "60% - 74% (Conditional)", "min_pct": 60, "max_pct": 74},
                {"value": 1, "label": "Below 60% (Unacceptable)", "min_pct": 0, "max_pct": 59}
            ]'::jsonb
        ) RETURNING id INTO v_scale_pct_id;

    INSERT INTO rating_scales (framework_id, name, description, scale_definition) VALUES
        (
            v_fw_id,
            'Binary Compliance (Yes / No)',
            'Used for regulatory pre-requisites such as CHED Recognized status or Institutional Autonomy.',
            '[
                {"value": 5, "label": "Compliant / Present", "description": "Criterion fully satisfied"},
                {"value": 0, "label": "Non-Compliant / Absent", "description": "Criterion not satisfied"}
            ]'::jsonb
        ) RETURNING id INTO v_scale_binary_id;

    -- Update Level III configuration: Requires selecting 2 optional criteria
    SELECT id INTO v_lvl3_id FROM accreditation_levels WHERE label LIKE '%Level III%' LIMIT 1;
    IF v_lvl3_id IS NOT NULL THEN
        UPDATE accreditation_levels SET required_optional_criteria_count = 2 WHERE id = v_lvl3_id;

        -- Mandatory Level III Criteria
        INSERT INTO level_specific_criteria (level_id, code, title, description, is_mandatory, rating_scale_id) VALUES
            (v_lvl3_id, 'L3-M1', 'Board Licensure Performance', 'Licensure examination passing rate consistently above national average for past 3 years', true, v_scale_pct_id),
            (v_lvl3_id, 'L3-M2', 'Faculty Credentials & Qualifications', 'At least 100% full-time faculty holding relevant masteral or doctoral degrees', true, v_scale_likert_id),
            (v_lvl3_id, 'L3-M3', 'Active Research Agenda & Peer-Reviewed Publications', 'Demonstrated active research culture with faculty and student publications in indexed journals', true, v_scale_likert_id);

        -- Optional Level III Pool (QA requires selecting 2 of these)
        INSERT INTO level_specific_criteria (level_id, code, title, description, is_mandatory, rating_scale_id) VALUES
            (v_lvl3_id, 'L3-O1', 'International Linkages & Cross-Border Academic Consortia', 'Active MOUs and student/faculty exchange programs with foreign partner universities', false, v_scale_likert_id),
            (v_lvl3_id, 'L3-O2', 'Community Extension Impact Assessment Studies', 'Sustained community development programs with empirical longitudinal impact evaluations', false, v_scale_likert_id),
            (v_lvl3_id, 'L3-O3', 'Instructional Innovations & Copyright / Patent Holdings', 'Patented inventions, copyrighted textbooks, or recognized instructional modules developed by faculty', false, v_scale_likert_id),
            (v_lvl3_id, 'L3-O4', 'Graduate Employability & Tracer Study Index', 'Over 85% verified employment rate of graduates in program-aligned industries within 2 years', false, v_scale_pct_id);
    END IF;

    -- Update Level IV configuration
    SELECT id INTO v_lvl4_id FROM accreditation_levels WHERE label LIKE '%Level IV%' LIMIT 1;
    IF v_lvl4_id IS NOT NULL THEN
        UPDATE accreditation_levels SET required_optional_criteria_count = 1 WHERE id = v_lvl4_id;

        INSERT INTO level_specific_criteria (level_id, code, title, description, is_mandatory, rating_scale_id) VALUES
            (v_lvl4_id, 'L4-M1', 'Institutional Autonomy or Deregulated Status Eligibility', 'University recognized by CHED with Autonomous or Deregulated status', true, v_scale_binary_id),
            (v_lvl4_id, 'L4-M2', 'Global Benchmark & International Accreditation Recognition', 'Substantial equivalence recognition by recognized international bodies (e.g. AUN-QA, Washington Accord)', true, v_scale_likert_id),
            (v_lvl4_id, 'L4-O1', 'Center of Excellence (COE) / Development (COD) Endorsement', 'Official CHED designation as Center of Excellence or Center of Development', false, v_scale_binary_id);
    END IF;
END $$;
