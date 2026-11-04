-- ============================================================================
-- MIGRATION: Part A - QA Institutional Cycle Certification
-- Description: Adds 'certified' status to cycle_status enum and tracks
--              institutional QA certification on accreditation_cycles table.
-- ============================================================================

-- 1. Extend cycle_status enum with 'certified'
ALTER TYPE cycle_status ADD VALUE IF NOT EXISTS 'certified';

-- 2. Add certification tracking columns to accreditation_cycles
ALTER TABLE accreditation_cycles 
  ADD COLUMN IF NOT EXISTS certified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS certified_at TIMESTAMPTZ;

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS idx_cycles_certified_by ON accreditation_cycles(certified_by);
