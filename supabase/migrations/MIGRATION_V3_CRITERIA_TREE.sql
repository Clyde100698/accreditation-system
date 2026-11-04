-- MIGRATION V3: Criteria Tree Hierarchy & Scoring Refactor
-- Run this in Supabase SQL Editor

-- 1. Add Parent Criterion ID for self-referencing tree
ALTER TABLE accreditation_criteria 
ADD COLUMN parent_criterion_id UUID REFERENCES accreditation_criteria(id) ON DELETE CASCADE;

-- 2. Add Rating Axis for dual-axis support
ALTER TABLE accreditation_criteria 
ADD COLUMN rating_axis TEXT CHECK (rating_axis IN ('adequacy', 'effectiveness', 'both', NULL));

-- 3. Create index for efficient tree lookups
CREATE INDEX idx_criteria_parent_id ON accreditation_criteria(parent_criterion_id);

-- 4. Disable the old SQL Trigger for readiness_scores
-- Since we are moving recursive scoring to the application layer (TypeScript),
-- we drop the old trigger that auto-calculates flat scores on evidence change.
DROP TRIGGER IF EXISTS evidence_status_change_trigger ON evidence_documents;
DROP FUNCTION IF EXISTS trigger_recalculate_readiness();
DROP FUNCTION IF EXISTS recalculate_readiness(UUID);
