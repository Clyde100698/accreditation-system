-- MIGRATION: Accreditation Cycles and Post-Visit Recommendations
-- Run this in Supabase SQL Editor AFTER MIGRATION_AREAS_SCORING.sql

CREATE TYPE cycle_status AS ENUM ('upcoming', 'in_progress', 'completed');
CREATE TYPE recommendation_status AS ENUM ('open', 'in_progress', 'resolved');

-- Accreditation Cycles table
CREATE TABLE accreditation_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_level TEXT NOT NULL,
    target_date DATE,
    status cycle_status DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Accreditation Recommendations table
CREATE TABLE accreditation_recommendations (
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

-- Indexes
CREATE INDEX idx_cycles_program_id ON accreditation_cycles(program_id);
CREATE INDEX idx_recs_cycle_id ON accreditation_recommendations(cycle_id);
CREATE INDEX idx_recs_area_id ON accreditation_recommendations(area_id);
CREATE INDEX idx_recs_program_id ON accreditation_recommendations(program_id);
CREATE INDEX idx_recs_assigned_to ON accreditation_recommendations(assigned_to);

-- Seed data for testing
DO $$
DECLARE
    v_bsit_id UUID;
    v_qa_admin_id UUID;
    v_cycle_id UUID;
    v_area_1_id UUID;
    v_area_2_id UUID;
BEGIN
    -- Get BSIT program
    SELECT id INTO v_bsit_id FROM programs WHERE code = 'BSIT' LIMIT 1;
    
    -- Get QA Admin
    SELECT id INTO v_qa_admin_id FROM users WHERE role = 'qa_admin' LIMIT 1;

    -- Get Area 1 and 2
    SELECT id INTO v_area_1_id FROM accreditation_areas WHERE code = 'Area I' LIMIT 1;
    SELECT id INTO v_area_2_id FROM accreditation_areas WHERE code = 'Area II' LIMIT 1;

    -- Create a completed preliminary visit cycle
    INSERT INTO accreditation_cycles (program_id, name, target_level, target_date, status, created_by)
    VALUES (v_bsit_id, '2025 Preliminary Visit', 'Candidate Status', '2025-05-15', 'completed', v_qa_admin_id)
    RETURNING id INTO v_cycle_id;

    -- Create an upcoming Level I cycle
    INSERT INTO accreditation_cycles (program_id, name, target_level, target_date, status, created_by)
    VALUES (v_bsit_id, '2026 Formal Visit', 'Level I', '2026-10-20', 'upcoming', v_qa_admin_id);

    -- Insert some recommendations from the preliminary visit
    INSERT INTO accreditation_recommendations (cycle_id, area_id, program_id, description, status, created_by)
    VALUES 
    (v_cycle_id, v_area_1_id, v_bsit_id, 'Revise the VMGO to explicitly state alignment with ASEAN integration goals.', 'open', v_qa_admin_id),
    (v_cycle_id, v_area_2_id, v_bsit_id, 'Increase the number of faculty members with relevant industry certifications.', 'in_progress', v_qa_admin_id),
    (v_cycle_id, v_area_1_id, v_bsit_id, 'Ensure VMGO is visibly disseminated in all laboratory rooms.', 'resolved', v_qa_admin_id);

    -- Mark the last one as resolved
    UPDATE accreditation_recommendations SET resolved_at = NOW(), resolved_by = v_qa_admin_id WHERE status = 'resolved';

END $$;
