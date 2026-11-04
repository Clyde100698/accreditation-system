-- FULL CLEAN SETUP (No RLS - just tables, data, and auth linking)
-- Run this in a fresh Supabase project's SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('faculty', 'program_chair', 'qa_admin', 'committee');
CREATE TYPE criterion_category AS ENUM ('input', 'process', 'outcome');
CREATE TYPE evidence_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE readiness_status AS ENUM ('no_evidence', 'weak', 'sufficient');

CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL
);

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE accreditation_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL,
    auth_user_id UUID,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE accreditation_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES accreditation_frameworks(id),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    category criterion_category NOT NULL,
    weight NUMERIC DEFAULT 1.0,
    required_count INT DEFAULT 1,
    expected_document_type TEXT,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE evidence_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    criterion_id UUID NOT NULL REFERENCES accreditation_criteria(id),
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    document_type TEXT,
    effective_date DATE,
    version INT DEFAULT 1,
    previous_version_id UUID REFERENCES evidence_documents(id) ON DELETE SET NULL,
    status evidence_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE readiness_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    criterion_id UUID NOT NULL REFERENCES accreditation_criteria(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    score NUMERIC CHECK (score >= 0 AND score <= 5),
    status readiness_status DEFAULT 'no_evidence',
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(criterion_id, program_id)
);

CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id),
    simulated_criteria_ids JSONB,
    projected_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_departments_institution_id ON departments(institution_id);
CREATE INDEX idx_programs_department_id ON programs(department_id);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_program_id ON users(program_id);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_criteria_framework_id ON accreditation_criteria(framework_id);
CREATE INDEX idx_criteria_program_id ON accreditation_criteria(program_id);
CREATE INDEX idx_criteria_created_by ON accreditation_criteria(created_by);
CREATE INDEX idx_evidence_criterion_id ON evidence_documents(criterion_id);
CREATE INDEX idx_evidence_uploaded_by ON evidence_documents(uploaded_by);
CREATE INDEX idx_evidence_program_id ON evidence_documents(program_id);
CREATE INDEX idx_scores_criterion_id ON readiness_scores(criterion_id);
CREATE INDEX idx_scores_program_id ON readiness_scores(program_id);
CREATE INDEX idx_simulations_created_by ON simulations(created_by);
CREATE INDEX idx_simulations_program_id ON simulations(program_id);

-- SEED DATA
DO $$
DECLARE
    v_institution_id UUID;
    v_department_id UUID;
    v_bsit_id UUID;
    v_bscs_id UUID;
    v_framework_id UUID;
    v_qa_admin_id UUID;
BEGIN
    INSERT INTO institutions (name) VALUES ('STI West Negros University') RETURNING id INTO v_institution_id;
    INSERT INTO departments (institution_id, name, code) VALUES (v_institution_id, 'College of Information and Communications Technology', 'CICT') RETURNING id INTO v_department_id;
    INSERT INTO programs (department_id, code, name) VALUES (v_department_id, 'BSIT', 'Bachelor of Science in Information Technology') RETURNING id INTO v_bsit_id;
    INSERT INTO programs (department_id, code, name) VALUES (v_department_id, 'BSCS', 'Bachelor of Science in Computer Science') RETURNING id INTO v_bscs_id;
    INSERT INTO accreditation_frameworks (name, description) VALUES ('PACUCOA', 'Philippine Association of Colleges and Universities Commission on Accreditation') RETURNING id INTO v_framework_id;

    INSERT INTO users (full_name, email, role, program_id, department_id) VALUES ('Sarah Faculty', 'sarah.faculty@sti.edu', 'faculty', v_bsit_id, v_department_id);
    INSERT INTO users (full_name, email, role, program_id, department_id) VALUES ('John Chair', 'john.chair@sti.edu', 'program_chair', v_bsit_id, v_department_id);
    INSERT INTO users (full_name, email, role, department_id) VALUES ('Admin QA', 'admin.qa@sti.edu', 'qa_admin', v_department_id) RETURNING id INTO v_qa_admin_id;
    INSERT INTO users (full_name, email, role, department_id) VALUES ('Committee Member', 'committee@sti.edu', 'committee', v_department_id);

    INSERT INTO accreditation_criteria (framework_id, code, title, category, weight, required_count, expected_document_type, created_by) VALUES
        (v_framework_id, 'IN-1', 'Faculty Qualifications', 'input', 1.0, 5, 'Diploma/Transcript', v_qa_admin_id),
        (v_framework_id, 'IN-2', 'Library Resources', 'input', 1.0, 1, 'Inventory Report', v_qa_admin_id),
        (v_framework_id, 'PR-1', 'Teaching Methodologies', 'process', 1.5, 3, 'Syllabus', v_qa_admin_id),
        (v_framework_id, 'PR-2', 'Student Consultation', 'process', 1.0, 2, 'Consultation Log', v_qa_admin_id),
        (v_framework_id, 'OU-1', 'Licensure Passing Rate', 'outcome', 2.0, 1, 'PRC Report', v_qa_admin_id),
        (v_framework_id, 'OU-2', 'Alumni Employment', 'outcome', 1.5, 1, 'Tracer Study', v_qa_admin_id);

    INSERT INTO readiness_scores (criterion_id, program_id, score, status)
    SELECT ac.id, p.id, 0, 'no_evidence'
    FROM accreditation_criteria ac CROSS JOIN programs p;
END $$;
