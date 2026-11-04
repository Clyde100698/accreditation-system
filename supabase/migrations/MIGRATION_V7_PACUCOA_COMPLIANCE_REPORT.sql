-- ============================================================================
-- MIGRATION: Part B - PACUCOA Compliance Report (STI WNU CICT Format)
-- ============================================================================

-- 1. Rename 'description' to 'opportunity_for_improvement'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accreditation_recommendations' AND column_name = 'description'
  ) THEN
    ALTER TABLE accreditation_recommendations RENAME COLUMN description TO opportunity_for_improvement;
  END IF;
END $$;

-- 2. Add recommendation_text and item_number
ALTER TABLE accreditation_recommendations 
  ADD COLUMN IF NOT EXISTS recommendation_text TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS item_number INTEGER;

-- 3. Create compliance_actions table (one-to-many Actions Taken & Team Verification per Opportunity)
CREATE TABLE IF NOT EXISTS compliance_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recommendation_id UUID NOT NULL REFERENCES accreditation_recommendations(id) ON DELETE CASCADE,
  action_number TEXT NOT NULL,              -- e.g. "1.1", "1.2", "2.1"
  action_taken TEXT NOT NULL,
  team_verification TEXT NOT NULL,          -- description of the verifying evidence
  linked_evidence_id UUID REFERENCES evidence_documents(id) ON DELETE SET NULL,  -- optional link to uploaded evidence
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for report rendering and document linking
CREATE INDEX IF NOT EXISTS idx_compliance_actions_rec_id ON compliance_actions(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_compliance_actions_evidence_id ON compliance_actions(linked_evidence_id);
CREATE INDEX IF NOT EXISTS idx_recs_item_number ON accreditation_recommendations(item_number);
