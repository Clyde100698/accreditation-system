-- ============================================================================
-- RESTORE ALL INITIAL DATA: AREAS, CRITERIA, USERS & ASSIGNMENTS
-- ============================================================================
-- Run this in your Supabase SQL Editor to instantly restore all essential
-- PACUCOA areas, criteria, and role-based demo accounts after a clean/wipe.
-- ============================================================================

DO $$
DECLARE
    v_inst_id UUID;
    v_framework_id UUID;
    v_dept_cict_id UUID;
    v_dept_cas_id UUID;
    v_bsit_id UUID;
    v_bscs_id UUID;
    v_area_1_id UUID;
    v_area_2_id UUID;
    v_area_3_id UUID;
    v_area_4_id UUID;
    v_area_5_id UUID;
    v_area_6_id UUID;
    v_area_7_id UUID;
    v_area_8_id UUID;
    v_area_9_id UUID;
    v_area_10_id UUID;
    v_qa_id UUID;
    v_faculty_id UUID;
    v_chair_id UUID;
BEGIN
    -- 1. Ensure Institution exists
    SELECT id INTO v_inst_id FROM institutions LIMIT 1;
    IF v_inst_id IS NULL THEN
        INSERT INTO institutions (name) VALUES ('STI West Negros University')
        RETURNING id INTO v_inst_id;
    END IF;

    -- 2. Ensure Departments exist
    SELECT id INTO v_dept_cict_id FROM departments WHERE code = 'CICT' LIMIT 1;
    IF v_dept_cict_id IS NULL THEN
        INSERT INTO departments (institution_id, code, name)
        VALUES (v_inst_id, 'CICT', 'College of Information and Communications Technology')
        RETURNING id INTO v_dept_cict_id;
    END IF;

    SELECT id INTO v_dept_cas_id FROM departments WHERE code = 'CAS' LIMIT 1;
    IF v_dept_cas_id IS NULL THEN
        INSERT INTO departments (institution_id, code, name)
        VALUES (v_inst_id, 'CAS', 'College of Arts and Sciences')
        RETURNING id INTO v_dept_cas_id;
    END IF;

    -- 3. Ensure Programs exist
    SELECT id INTO v_bsit_id FROM programs WHERE code = 'BSIT' LIMIT 1;
    IF v_bsit_id IS NULL THEN
        INSERT INTO programs (department_id, code, name, is_accreditation_active)
        VALUES (v_dept_cict_id, 'BSIT', 'Bachelor of Science in Information Technology', true)
        RETURNING id INTO v_bsit_id;
    ELSE
        UPDATE programs SET is_accreditation_active = true WHERE id = v_bsit_id;
    END IF;

    SELECT id INTO v_bscs_id FROM programs WHERE code = 'BSCS' LIMIT 1;
    IF v_bscs_id IS NULL THEN
        INSERT INTO programs (department_id, code, name, is_accreditation_active)
        VALUES (v_dept_cict_id, 'BSCS', 'Bachelor of Science in Computer Science', false)
        RETURNING id INTO v_bscs_id;
    END IF;

    -- 4. Ensure PACUCOA Framework exists
    SELECT id INTO v_framework_id FROM accreditation_frameworks WHERE name = 'PACUCOA' LIMIT 1;
    IF v_framework_id IS NULL THEN
        INSERT INTO accreditation_frameworks (name, description)
        VALUES ('PACUCOA', 'Philippine Association of Colleges and Universities Commission on Accreditation')
        RETURNING id INTO v_framework_id;
    END IF;

    -- 5. Seed the 10 PACUCOA Areas
    DELETE FROM accreditation_areas WHERE framework_id = v_framework_id;

    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area I', 'Philosophy and Objectives') RETURNING id INTO v_area_1_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area II', 'Faculty') RETURNING id INTO v_area_2_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area III', 'Curriculum and Instruction') RETURNING id INTO v_area_3_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area IV', 'Library') RETURNING id INTO v_area_4_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area V', 'Laboratories') RETURNING id INTO v_area_5_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area VI', 'Physical Plant and Facilities') RETURNING id INTO v_area_6_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area VII', 'Student Personnel Services') RETURNING id INTO v_area_7_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area VIII', 'Social Orientation and Community Involvement') RETURNING id INTO v_area_8_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area IX', 'Organization and Administration') RETURNING id INTO v_area_9_id;
    INSERT INTO accreditation_areas (framework_id, code, title) VALUES (v_framework_id, 'Area X', 'Research') RETURNING id INTO v_area_10_id;

    -- 6. Seed PACUCOA Levels
    DELETE FROM accreditation_levels WHERE framework_id = v_framework_id;
    INSERT INTO accreditation_levels (framework_id, level_number, label, min_score_threshold) VALUES
        (v_framework_id, 1, 'Candidate Status', 1.0),
        (v_framework_id, 2, 'Level I - Accredited Status', 3.0),
        (v_framework_id, 3, 'Level II - Re-accredited Status', 3.5),
        (v_framework_id, 4, 'Level III - Re-accredited Status', 4.0),
        (v_framework_id, 5, 'Level IV - Highest Recognition', 4.5);

    -- 7. Seed Core User Accounts in public.users
    DELETE FROM users WHERE email IN ('admin@sti.edu', 'admin.qa@sti.edu', 'dean.cict@sti.edu', 'john.chair@sti.edu', 'sarah.faculty@sti.edu', 'observer@sti.edu');

    INSERT INTO users (full_name, email, role, institution_id, department_id)
    VALUES ('IT Administrator', 'admin@sti.edu', 'system_admin', v_inst_id, v_dept_cict_id);

    INSERT INTO users (full_name, email, role, institution_id, department_id)
    VALUES ('QA Administrator', 'admin.qa@sti.edu', 'qa', v_inst_id, v_dept_cict_id)
    RETURNING id INTO v_qa_id;

    INSERT INTO users (full_name, email, role, institution_id, department_id)
    VALUES ('Dean CICT', 'dean.cict@sti.edu', 'dean', v_inst_id, v_dept_cict_id);

    INSERT INTO users (full_name, email, role, institution_id, department_id, program_id)
    VALUES ('John Chair', 'john.chair@sti.edu', 'program_head', v_inst_id, v_dept_cict_id, v_bsit_id)
    RETURNING id INTO v_chair_id;

    INSERT INTO users (full_name, email, role, institution_id, department_id, program_id)
    VALUES ('Sarah Faculty', 'sarah.faculty@sti.edu', 'faculty', v_inst_id, v_dept_cict_id, v_bsit_id)
    RETURNING id INTO v_faculty_id;

    INSERT INTO users (full_name, email, role, institution_id, department_id, program_id)
    VALUES ('Stakeholder Observer', 'observer@sti.edu', 'observer', v_inst_id, v_dept_cict_id, v_bsit_id);

    -- 8. Seed PACUCOA Criteria
    DELETE FROM accreditation_criteria WHERE framework_id = v_framework_id;

    INSERT INTO accreditation_criteria (framework_id, area_id, code, title, category, weight, required_count, expected_document_type, created_by)
    VALUES
        (v_framework_id, v_area_1_id, 'C1.1', 'Philosophy, Vision, Mission, and Program Objectives Alignment', 'input', 1.0, 1, 'Vision/Mission Statement', v_qa_id),
        (v_framework_id, v_area_2_id, 'C2.1', 'Faculty Masteral Degree Qualifications & Official Transcripts', 'input', 2.0, 5, 'Diploma/Transcript', v_qa_id),
        (v_framework_id, v_area_2_id, 'C2.2', 'Faculty Professional Certifications & Industry Experience', 'input', 1.5, 3, 'Professional Certificate', v_qa_id),
        (v_framework_id, v_area_3_id, 'C3.1', 'Course Syllabi, Curriculum Mapping & OBE Learning Outcomes', 'process', 2.0, 3, 'Course Syllabus', v_qa_id),
        (v_framework_id, v_area_3_id, 'C3.2', 'Instructional Assessment, Rubrics & Student Evaluation Records', 'process', 1.5, 2, 'Grading Rubric', v_qa_id),
        (v_framework_id, v_area_4_id, 'C4.1', 'Library Holdings, Professional Journals & Online Research Databases', 'input', 1.0, 1, 'Library Inventory', v_qa_id),
        (v_framework_id, v_area_5_id, 'C5.1', 'IT Computer Laboratories, Hardware Specs & Software Licenses', 'input', 1.5, 2, 'Laboratory Specs', v_qa_id),
        (v_framework_id, v_area_10_id, 'C10.1', 'Faculty Research Publications & Citation Index Outputs', 'outcome', 2.0, 2, 'Research Publication', v_qa_id);

    -- 9. Seed Area Assignments (Assign Sarah Faculty to Area III & Area II for BSIT)
    DELETE FROM area_assignments WHERE program_id = v_bsit_id;

    INSERT INTO area_assignments (area_id, program_id, user_id, assignment_type, assigned_by)
    VALUES
        (v_area_3_id, v_bsit_id, v_faculty_id, 'member', v_chair_id),
        (v_area_2_id, v_bsit_id, v_faculty_id, 'member', v_chair_id),
        (v_area_3_id, v_bsit_id, v_chair_id, 'area_chair', v_qa_id);

    -- 10. Initialize Readiness Scores table
    DELETE FROM readiness_scores WHERE program_id = v_bsit_id;
    INSERT INTO readiness_scores (criterion_id, program_id, score, status)
    SELECT ac.id, v_bsit_id, 0, 'no_evidence'
    FROM accreditation_criteria ac;

END $$;
