-- MIGRATION V4: Full Audit Log Table & Policies
-- Run this in Supabase SQL Editor

-- 1. Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes for fast timeline filtering
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- 3. Row Level Security
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors on rerun
DROP POLICY IF EXISTS "QA and Dean can view audit logs" ON audit_log;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_log;

-- QA and Dean can read all audit logs across the institution/department
CREATE POLICY "QA and Dean can view audit logs" ON audit_log FOR SELECT USING (
    get_current_user_role() IN ('qa', 'dean')
);

-- Authenticated users can insert audit logs for actions they perform
CREATE POLICY "Authenticated users can insert audit logs" ON audit_log FOR INSERT WITH CHECK (
    user_id = get_current_user_id() OR get_current_user_role() = 'qa'
);
