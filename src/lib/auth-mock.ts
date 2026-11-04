import { User, UserRole, Program, Department, AccreditationArea } from '@/lib/types';

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'c510148c-7113-4b31-9733-e7c2756ccc21',
    institution_id: 'inst-1',
    code: 'CICT',
    name: 'College of Information and Communications Technology',
  },
  {
    id: 'dept-cas',
    institution_id: 'inst-1',
    code: 'CAS',
    name: 'College of Arts and Sciences',
  },
  {
    id: 'dept-cba',
    institution_id: 'inst-1',
    code: 'CBA',
    name: 'College of Business and Accountancy',
  },
  {
    id: 'dept-coe',
    institution_id: 'inst-1',
    code: 'COE',
    name: 'College of Engineering',
  },
];

export const MOCK_PROGRAMS: Program[] = [
  {
    id: 'b700c9cb-ec83-4585-b479-faa40d1136af',
    department_id: 'dept-cict',
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    current_level_id: 'lvl-2',
    is_accreditation_active: true,
    departments: MOCK_DEPARTMENTS[0],
  },
  {
    id: '92ec3ae6-da28-4770-b08d-2d202b244fb9',
    department_id: 'dept-cict',
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    current_level_id: 'lvl-3',
    is_accreditation_active: true,
    departments: MOCK_DEPARTMENTS[0],
  },
  {
    id: 'prog-bsis',
    department_id: 'dept-cict',
    code: 'BSIS',
    name: 'Bachelor of Science in Information Systems',
    current_level_id: 'lvl-1',
    is_accreditation_active: true,
    departments: MOCK_DEPARTMENTS[0],
  },
  {
    id: 'prog-bsce',
    department_id: 'dept-cas',
    code: 'BSCE',
    name: 'Bachelor of Science in Civil Engineering',
    current_level_id: null,
    is_accreditation_active: false,
    departments: MOCK_DEPARTMENTS[1],
  },
  {
    id: 'prog-bsa',
    department_id: 'dept-cba',
    code: 'BSA',
    name: 'Bachelor of Science in Accountancy',
    current_level_id: 'lvl-3',
    is_accreditation_active: true,
    departments: MOCK_DEPARTMENTS[2],
  },
];

export const MOCK_AREAS: AccreditationArea[] = [
  { id: 'area-1', framework_id: 'fw-pacucoa', code: 'Area I', title: 'Philosophy and Objectives', created_at: '2026-01-01' },
  { id: 'area-2', framework_id: 'fw-pacucoa', code: 'Area II', title: 'Faculty', created_at: '2026-01-01' },
  { id: 'area-3', framework_id: 'fw-pacucoa', code: 'Area III', title: 'Curriculum and Instruction', created_at: '2026-01-01' },
  { id: 'area-4', framework_id: 'fw-pacucoa', code: 'Area IV', title: 'Library', created_at: '2026-01-01' },
  { id: 'area-5', framework_id: 'fw-pacucoa', code: 'Area V', title: 'Laboratories', created_at: '2026-01-01' },
  { id: 'area-6', framework_id: 'fw-pacucoa', code: 'Area VI', title: 'Physical Plant and Facilities', created_at: '2026-01-01' },
  { id: 'area-7', framework_id: 'fw-pacucoa', code: 'Area VII', title: 'Student Personnel Services', created_at: '2026-01-01' },
  { id: 'area-8', framework_id: 'fw-pacucoa', code: 'Area VIII', title: 'Social Orientation and Community Involvement', created_at: '2026-01-01' },
  { id: 'area-9', framework_id: 'fw-pacucoa', code: 'Area IX', title: 'Organization and Administration', created_at: '2026-01-01' },
  { id: 'area-10', framework_id: 'fw-pacucoa', code: 'Area X', title: 'Research', created_at: '2026-01-01' },
];

export const MOCK_USERS: Partial<Record<UserRole, User>> = {
  system_admin: {
    id: 'ea429155-6620-4598-8a80-91f38148f1a4',
    full_name: 'System Administrator',
    email: 'admin@sti.edu',
    role: 'system_admin',
    auth_user_id: 'ea429155-6620-4598-8a80-91f38148f1a4',
    institution_id: 'inst-1',
    department_id: 'c510148c-7113-4b31-9733-e7c2756ccc21',
    program_id: null,
    is_active: true,
    created_at: '2026-01-01',
  },
  qa: {
    id: '9cf23626-ca3f-4252-a736-289fdbcfcb76',
    full_name: 'Dr. Maria Santos (QA Admin)',
    email: 'qa@sti.edu',
    role: 'qa',
    auth_user_id: '9cf23626-ca3f-4252-a736-289fdbcfcb76',
    institution_id: 'inst-1',
    department_id: 'c510148c-7113-4b31-9733-e7c2756ccc21',
    program_id: null,
    is_active: true,
    created_at: '2026-01-01',
  },
  dean: {
    id: 'faa76ab1-a0bf-4f5e-a146-90569940b13f',
    full_name: 'Dr. Roberto Gomez (Dean CICT)',
    email: 'dean.cict@sti.edu',
    role: 'dean',
    auth_user_id: 'faa76ab1-a0bf-4f5e-a146-90569940b13f',
    institution_id: 'inst-1',
    department_id: 'c510148c-7113-4b31-9733-e7c2756ccc21',
    program_id: null,
    is_active: true,
    created_at: '2026-01-01',
  },
  program_head: {
    id: '0bd69a8b-3d8d-429d-ab0b-834f3712cb25',
    full_name: 'Engr. Clyde Taburada (BSCS Program Head)',
    email: 'head.bscs@sti.edu',
    role: 'program_head',
    auth_user_id: '103681cc-757c-4eb0-9a96-4efb7cb2b43f',
    institution_id: 'inst-1',
    department_id: 'c510148c-7113-4b31-9733-e7c2756ccc21',
    program_id: 'b700c9cb-ec83-4585-b479-faa40d1136af',
    is_active: true,
    created_at: '2026-01-01',
    programs: MOCK_PROGRAMS[0],
  },
  faculty: {
    id: '52595f0e-e245-4b30-bd0c-7ed86ce6b4f4',
    full_name: 'Prof. Sarah Jenkins',
    email: 'faculty.chair@sti.edu',
    role: 'faculty',
    auth_user_id: '52595f0e-e245-4b30-bd0c-7ed86ce6b4f4',
    institution_id: 'inst-1',
    department_id: 'c510148c-7113-4b31-9733-e7c2756ccc21',
    program_id: 'b700c9cb-ec83-4585-b479-faa40d1136af',
    is_active: true,
    created_at: '2026-01-01',
    programs: MOCK_PROGRAMS[0],
  },
  alumni_rep: {
    id: '8df51aa8-04c8-41d6-b4c4-aebed0b7e090',
    full_name: 'Mark Dizon (Alumni Rep)',
    email: 'alumni@sti.edu',
    role: 'alumni_rep',
    auth_user_id: '8df51aa8-04c8-41d6-b4c4-aebed0b7e090',
    institution_id: 'inst-1',
    department_id: 'c510148c-7113-4b31-9733-e7c2756ccc21',
    program_id: null,
    is_active: true,
    created_at: '2026-01-01',
  },
  student_rep: {
    id: '980e5bd3-0736-4aa2-b525-a0139cb9abb3',
    full_name: 'Andrea Torres (SSC President)',
    email: 'student@sti.edu',
    role: 'student_rep',
    auth_user_id: '980e5bd3-0736-4aa2-b525-a0139cb9abb3',
    institution_id: 'inst-1',
    department_id: 'c510148c-7113-4b31-9733-e7c2756ccc21',
    program_id: null,
    is_active: true,
    created_at: '2026-01-01',
  },
};

export const BYPASS_STORAGE_KEY = 'bypass_user';

export function getBypassUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BYPASS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setBypassUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(BYPASS_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(BYPASS_STORAGE_KEY);
  }
}
