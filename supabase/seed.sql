-- ====================================================================
-- ACCREDITATION SYSTEM: MASTER SEED DATA
-- PACUCOA 10 Areas, Programs, Criteria Hierarchy, Roles, and Samples
-- ====================================================================

-- 1. INSTITUTIONS
INSERT INTO institutions (id, name)
VALUES ('inst-1', 'STI West Negros University')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. FRAMEWORKS
INSERT INTO accreditation_frameworks (id, name, code, description)
VALUES ('fw-pacucoa', 'PACUCOA Accreditation Instrument', 'PACUCOA', 'Philippine Association of Colleges and Universities Commission on Accreditation')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. ACCREDITATION LEVELS
INSERT INTO accreditation_levels (id, framework_id, level_number, label, min_score_threshold)
VALUES 
  ('lvl-1', 'fw-pacucoa', 1, 'Candidate Status', 1.0),
  ('lvl-2', 'fw-pacucoa', 2, 'Level I - Accredited Status', 3.0),
  ('lvl-3', 'fw-pacucoa', 3, 'Level II - Re-accredited Status', 3.5),
  ('lvl-4', 'fw-pacucoa', 4, 'Level III - Re-accredited Status', 4.0),
  ('lvl-5', 'fw-pacucoa', 5, 'Level IV - Highest Recognition', 4.5)
ON CONFLICT (id) DO NOTHING;

-- 4. DEPARTMENTS
INSERT INTO departments (id, institution_id, code, name)
VALUES 
  ('dept-cict', 'inst-1', 'CICT', 'College of Information and Communications Technology'),
  ('dept-cas', 'inst-1', 'CAS', 'College of Arts and Sciences'),
  ('dept-cba', 'inst-1', 'CBA', 'College of Business and Accountancy'),
  ('dept-coe', 'inst-1', 'COE', 'College of Engineering')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. PROGRAMS
INSERT INTO programs (id, department_id, code, name, current_level_id, is_accreditation_active)
VALUES 
  ('prog-bsit', 'dept-cict', 'BSIT', 'Bachelor of Science in Information Technology', 'lvl-3', true),
  ('prog-bscs', 'dept-cict', 'BSCS', 'Bachelor of Science in Computer Science', 'lvl-2', true),
  ('prog-bsis', 'dept-cict', 'BSIS', 'Bachelor of Science in Information Systems', 'lvl-1', true),
  ('prog-bsce', 'dept-cas', 'BSCE', 'Bachelor of Science in Civil Engineering', NULL, false),
  ('prog-bsa', 'dept-cba', 'BSA', 'Bachelor of Science in Accountancy', 'lvl-3', true)
ON CONFLICT (id) DO UPDATE SET is_accreditation_active = EXCLUDED.is_accreditation_active;

-- 6. ACCREDITATION AREAS (PACUCOA 10 AREAS)
INSERT INTO accreditation_areas (id, framework_id, code, title)
VALUES 
  ('area-1', 'fw-pacucoa', 'Area I', 'Philosophy and Objectives'),
  ('area-2', 'fw-pacucoa', 'Area II', 'Faculty'),
  ('area-3', 'fw-pacucoa', 'Area III', 'Curriculum and Instruction'),
  ('area-4', 'fw-pacucoa', 'Area IV', 'Library'),
  ('area-5', 'fw-pacucoa', 'Area V', 'Laboratories'),
  ('area-6', 'fw-pacucoa', 'Area VI', 'Physical Plant and Facilities'),
  ('area-7', 'fw-pacucoa', 'Area VII', 'Student Personnel Services'),
  ('area-8', 'fw-pacucoa', 'Area VIII', 'Social Orientation and Community Involvement'),
  ('area-9', 'fw-pacucoa', 'Area IX', 'Organization and Administration'),
  ('area-10', 'fw-pacucoa', 'Area X', 'Research')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 7. CRITERIA HIERARCHY
-- Area I
INSERT INTO accreditation_criteria (id, framework_id, area_id, code, title, category, weight, required_count, expected_document_type, parent_criterion_id)
VALUES 
  ('crit-1-param', 'fw-pacucoa', 'area-1', 'C1.0', 'Parameter A: Institutional Vision, Mission, and Program Objectives', 'input', 1.0, 0, NULL, NULL),
  ('crit-1-1', 'fw-pacucoa', 'area-1', 'C1.1', 'Institutional Philosophy, Vision, Mission, and Program Objectives Alignment', 'input', 1.0, 1, 'Vision/Mission Statement', 'crit-1-param'),
  ('crit-1-2', 'fw-pacucoa', 'area-1', 'C1.2', 'Stakeholder Awareness, Dissemination, and Acceptance of VMGO', 'process', 1.0, 2, 'Survey / Stakeholder Minutes', 'crit-1-param')
ON CONFLICT (id) DO NOTHING;

-- Area II
INSERT INTO accreditation_criteria (id, framework_id, area_id, code, title, category, weight, required_count, expected_document_type, parent_criterion_id)
VALUES 
  ('crit-2-param', 'fw-pacucoa', 'area-2', 'C2.0', 'Parameter A: Faculty Academic Qualifications and Professional Licenses', 'input', 1.0, 0, NULL, NULL),
  ('crit-2-1', 'fw-pacucoa', 'area-2', 'C2.1', 'Faculty Masteral Degree Diplomas and Official Transcript of Records', 'input', 2.0, 5, 'Diploma/Transcript', 'crit-2-param'),
  ('crit-2-2', 'fw-pacucoa', 'area-2', 'C2.2', 'Professional Board Licenses and Recognized Industry Certifications', 'input', 1.5, 3, 'Professional Certificate', 'crit-2-param'),
  ('crit-2-3', 'fw-pacucoa', 'area-2', 'C2.3', 'Faculty Continuous Professional Development and Industry Immersion Records', 'process', 1.5, 3, 'Faculty Dev Plan', 'crit-2-param')
ON CONFLICT (id) DO NOTHING;

-- Area III
INSERT INTO accreditation_criteria (id, framework_id, area_id, code, title, category, weight, required_count, expected_document_type, parent_criterion_id)
VALUES 
  ('crit-3-param', 'fw-pacucoa', 'area-3', 'C3.0', 'Parameter B: Instructional Delivery and Outcomes-Based Education', 'process', 1.0, 0, NULL, NULL),
  ('crit-3-1', 'fw-pacucoa', 'area-3', 'C3.1', 'Course Syllabi, Curriculum Mapping Matrix & OBE Learning Outcomes', 'process', 2.5, 5, 'Course Syllabus', 'crit-3-param'),
  ('crit-3-2', 'fw-pacucoa', 'area-3', 'C3.2', 'Instructional Assessment Rubrics and Table of Specifications', 'process', 1.5, 3, 'Assessment Rubric', 'crit-3-param'),
  ('crit-3-3', 'fw-pacucoa', 'area-3', 'C3.3', 'Industry Internship and Practicum Memoranda of Agreement', 'outcome', 2.0, 4, 'MOA / Practicum Log', 'crit-3-param')
ON CONFLICT (id) DO NOTHING;

-- Area IV
INSERT INTO accreditation_criteria (id, framework_id, area_id, code, title, category, weight, required_count, expected_document_type, parent_criterion_id)
VALUES 
  ('crit-4-1', 'fw-pacucoa', 'area-4', 'C4.1', 'Library Holdings, Professional Journals & Scopus Database Subscriptions', 'input', 1.0, 2, 'Library Inventory', NULL),
  ('crit-4-2', 'fw-pacucoa', 'area-4', 'C4.2', 'Library Usage Analytics, Borrowing Statistics and Virtual Library Orientations', 'process', 1.0, 2, 'Utilization Report', NULL)
ON CONFLICT (id) DO NOTHING;

-- Area V
INSERT INTO accreditation_criteria (id, framework_id, area_id, code, title, category, weight, required_count, expected_document_type, parent_criterion_id)
VALUES 
  ('crit-5-1', 'fw-pacucoa', 'area-5', 'C5.1', 'IT Computer Laboratories Hardware Specifications and Licensed Software', 'input', 1.5, 2, 'Lab Specs', NULL),
  ('crit-5-2', 'fw-pacucoa', 'area-5', 'C5.2', 'Preventive Maintenance Logs, Lab Safety Inspection Certificates & Rules', 'process', 1.0, 2, 'Maintenance Log', NULL)
ON CONFLICT (id) DO NOTHING;

-- Area VI to X
INSERT INTO accreditation_criteria (id, framework_id, area_id, code, title, category, weight, required_count, expected_document_type, parent_criterion_id)
VALUES 
  ('crit-6-1', 'fw-pacucoa', 'area-6', 'C6.1', 'Building Safety Compliance, Fire Safety Clearance & Accessibility Features', 'input', 1.0, 2, 'Safety Certificate', NULL),
  ('crit-7-1', 'fw-pacucoa', 'area-7', 'C7.1', 'Guidance and Counseling Center Psychological Testing and Career Tracking', 'process', 1.5, 2, 'Guidance Report', NULL),
  ('crit-8-1', 'fw-pacucoa', 'area-8', 'C8.1', 'Community Extension Projects, Barangay Outreach Programs & Service MOAs', 'outcome', 2.0, 3, 'Community Extension MOA', NULL),
  ('crit-9-1', 'fw-pacucoa', 'area-9', 'C9.1', 'Administrative Manual, Organizational Hierarchy and Succession Governance', 'input', 1.0, 1, 'Administrative Manual', NULL),
  ('crit-10-1', 'fw-pacucoa', 'area-10', 'C10.1', 'Faculty Research Publications in Indexed Journals and Citation Outputs', 'outcome', 2.0, 2, 'Research Publication', NULL),
  ('crit-10-2', 'fw-pacucoa', 'area-10', 'C10.2', 'Research Dissemination Grants, Patent Applications and Copyright Filings', 'outcome', 1.5, 2, 'Patent / Research Grant', NULL)
ON CONFLICT (id) DO NOTHING;

-- 8. USERS
INSERT INTO users (id, full_name, email, role, auth_user_id, institution_id, department_id, program_id)
VALUES 
  ('user-admin', 'IT Administrator', 'admin@sti.edu', 'system_admin', 'user-admin', 'inst-1', 'dept-cict', NULL),
  ('user-qa', 'Dr. Maria Santos (QA Admin)', 'admin.qa@sti.edu', 'qa', 'user-qa', 'inst-1', 'dept-cict', NULL),
  ('user-dean', 'Dr. Roberto Gomez (Dean CICT)', 'dean.cict@sti.edu', 'dean', 'user-dean', 'inst-1', 'dept-cict', NULL),
  ('user-chair', 'Engr. John Chair (BSIT Head)', 'john.chair@sti.edu', 'program_head', 'user-chair', 'inst-1', 'dept-cict', 'prog-bsit'),
  ('user-faculty', 'Prof. Sarah Jenkins', 'sarah.faculty@sti.edu', 'faculty', 'user-faculty', 'inst-1', 'dept-cict', 'prog-bsit'),
  ('user-faculty2', 'Prof. Alex Rivera', 'alex.faculty@sti.edu', 'faculty', 'user-faculty2', 'inst-1', 'dept-cict', 'prog-bsit'),
  ('user-alumni', 'Mark Dizon (Alumni Rep)', 'alumni@sti.edu', 'alumni_rep', 'user-alumni', 'inst-1', 'dept-cict', NULL),
  ('user-student', 'Andrea Torres (SSC President)', 'student@sti.edu', 'student_rep', 'user-student', 'inst-1', 'dept-cict', NULL)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 9. AREA ASSIGNMENTS
INSERT INTO area_assignments (id, area_id, program_id, user_id, assignment_type, assigned_by)
VALUES 
  ('assign-1', 'area-3', 'prog-bsit', 'user-chair', 'area_chair', 'user-qa'),
  ('assign-2', 'area-3', 'prog-bsit', 'user-faculty', 'member', 'user-chair'),
  ('assign-3', 'area-2', 'prog-bsit', 'user-faculty', 'member', 'user-chair'),
  ('assign-4', 'area-10', 'prog-bsit', 'user-faculty2', 'area_chair', 'user-chair'),
  ('assign-5', 'area-8', 'prog-bsit', 'user-faculty2', 'member', 'user-chair')
ON CONFLICT (id) DO NOTHING;

-- 10. SAMPLE EVIDENCE DOCUMENTS
INSERT INTO evidence_documents (id, criterion_id, uploaded_by, program_id, file_url, document_type, effective_date, status, version, reviewer_notes, verified_by, verified_at)
VALUES 
  ('ev-1', 'crit-3-1', 'user-faculty', 'prog-bsit', 'https://placehold.co/600x800/png?text=IT201+Data+Structures+OBE+Syllabus', 'Course Syllabus', '2026-08-15', 'verified', 1, 'Approved. Fully complies with PACUCOA standard Area III OBE outcomes and rubric matrix.', 'user-qa', '2026-08-20T10:00:00Z'),
  ('ev-2', 'crit-2-1', 'user-chair', 'prog-bsit', 'https://placehold.co/600x800/png?text=Faculty+MSIT+Diplomas', 'Diploma/Transcript', '2026-07-10', 'verified', 1, 'Verified against official CHED masteral transcript records.', 'user-qa', '2026-08-21T14:15:00Z'),
  ('ev-3', 'crit-5-1', 'user-chair', 'prog-bsit', 'https://placehold.co/600x800/png?text=IT+Computer+Laboratories+Hardware+Specifications', 'Lab Specs', '2026-06-01', 'verified', 1, 'Inspected and verified. All 45 terminals meet PACUCOA specs.', 'user-qa', '2026-08-25T11:00:00Z'),
  ('ev-4', 'crit-6-1', 'user-admin', 'prog-bsit', 'https://placehold.co/600x800/png?text=Campus+Fire+Safety+Clearance+2026', 'Safety Certificate', '2026-01-15', 'verified', 1, 'BFP compliance certified and disability ramps inspected.', 'user-qa', '2026-08-26T09:30:00Z'),
  ('ev-5', 'crit-3-1', 'user-faculty', 'prog-bsit', 'https://placehold.co/600x800/png?text=CS302+Web+Systems+and+Technologies+Syllabus', 'Course Syllabus', '2026-09-01', 'pending', 1, NULL, NULL, NULL),
  ('ev-6', 'crit-10-1', 'user-faculty2', 'prog-bsit', 'https://placehold.co/600x800/png?text=IEEE+Access+Journal+Publication+2026', 'Research Publication', '2026-08-30', 'pending', 1, NULL, NULL, NULL),
  ('ev-7', 'crit-8-1', 'user-faculty2', 'prog-bsit', 'https://placehold.co/600x800/png?text=Barangay+Granada+Digital+Literacy+Extension+MOA', 'Community Extension MOA', '2026-09-05', 'pending', 1, NULL, NULL, NULL),
  ('ev-8', 'crit-2-2', 'user-faculty', 'prog-bsit', 'https://placehold.co/600x800/png?text=Industry+Certification+Cisco+CCNA', 'Professional Certificate', '2026-05-12', 'rejected', 1, 'Returned for revision: Missing certification validity expiration date and issuing authority stamp.', 'user-qa', '2026-09-02T16:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 11. READINESS SCORES
INSERT INTO readiness_scores (id, criterion_id, program_id, score, status)
VALUES 
  ('score-1', 'crit-1-1', 'prog-bsit', 3.8, 'sufficient'),
  ('score-2', 'crit-1-2', 'prog-bsit', 3.5, 'sufficient'),
  ('score-3', 'crit-2-1', 'prog-bsit', 4.2, 'sufficient'),
  ('score-4', 'crit-2-2', 'prog-bsit', 2.5, 'weak'),
  ('score-5', 'crit-2-3', 'prog-bsit', 3.5, 'sufficient'),
  ('score-6', 'crit-3-1', 'prog-bsit', 4.0, 'sufficient'),
  ('score-7', 'crit-3-2', 'prog-bsit', 3.5, 'sufficient'),
  ('score-8', 'crit-3-3', 'prog-bsit', 3.2, 'sufficient'),
  ('score-9', 'crit-4-1', 'prog-bsit', 3.4, 'sufficient'),
  ('score-10', 'crit-4-2', 'prog-bsit', 3.0, 'sufficient'),
  ('score-11', 'crit-5-1', 'prog-bsit', 4.5, 'sufficient'),
  ('score-12', 'crit-5-2', 'prog-bsit', 3.8, 'sufficient'),
  ('score-13', 'crit-6-1', 'prog-bsit', 4.0, 'sufficient'),
  ('score-14', 'crit-7-1', 'prog-bsit', 3.2, 'sufficient'),
  ('score-15', 'crit-8-1', 'prog-bsit', 3.0, 'sufficient'),
  ('score-16', 'crit-9-1', 'prog-bsit', 3.8, 'sufficient'),
  ('score-17', 'crit-10-1', 'prog-bsit', 2.2, 'weak'),
  ('score-18', 'crit-10-2', 'prog-bsit', 2.0, 'weak')
ON CONFLICT (id) DO NOTHING;

-- 12. ACCREDITATION CYCLES
INSERT INTO accreditation_cycles (id, program_id, target_level, target_date, status)
VALUES 
  ('cycle-1', 'prog-bsit', 'Level III', '2026-11-20', 'in_progress'),
  ('cycle-2', 'prog-bscs', 'Level II', '2027-03-15', 'upcoming'),
  ('cycle-3', 'prog-bsa', 'Level III', '2026-12-05', 'in_progress')
ON CONFLICT (id) DO NOTHING;

-- 13. RECOMMENDATIONS
INSERT INTO accreditation_recommendations (id, program_id, area_id, status, priority, recommendation_text, action_plan, responsible_person, target_date)
VALUES 
  ('rec-1', 'prog-bsit', 'area-10', 'open', 'high', 'Increase faculty peer-reviewed research publications in Scopus or Web of Science indexed journals.', 'Provide institutional research incentive grants of 50,000 PHP per indexed publication.', 'Research Director & Dean', '2026-12-31'),
  ('rec-2', 'prog-bsit', 'area-5', 'in_progress', 'medium', 'Upgrade Cisco Networking Laboratory switches to Managed Gigabit PoE equipment.', 'Procurement submitted to university purchasing department for Q3 delivery.', 'Laboratory Custodian', '2026-10-15'),
  ('rec-3', 'prog-bsit', 'area-3', 'resolved', 'low', 'Align all prerequisite course codes in the revised 2026-2027 curriculum mapping matrix.', 'Completed and verified by Curriculum Committee on August 15, 2026.', 'Program Head', '2026-08-15'),
  ('rec-4', 'prog-bsit', 'area-2', 'open', 'high', 'Ensure at least 70% of full-time IT faculty hold aligned Master degrees (MSIT/MSCS).', 'Enroll remaining full-time faculty in university-sponsored thesis completion grants.', 'Dean & Human Resource Office', '2027-01-30')
ON CONFLICT (id) DO NOTHING;
