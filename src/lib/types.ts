export type UserRole = 'system_admin' | 'qa' | 'dean' | 'program_head' | 'faculty' | 'observer' | 'alumni_rep' | 'student_rep';
export type EvidenceStatus = 'pending' | 'verified' | 'rejected';
export type ReadinessStatus = 'no_evidence' | 'weak' | 'sufficient';
export type AssignmentType = 'area_chair' | 'co_chair' | 'member';
export type CycleStatus = 'upcoming' | 'in_progress' | 'completed' | 'certified';
export type RecommendationStatus = 'open' | 'in_progress' | 'resolved';

export interface Institution {
  id: string;
  name: string;
}

export interface AccreditationLevel {
  id: string;
  framework_id: string;
  level_number: number;
  label: string;
  min_score_threshold: number | null;
  required_optional_criteria_count?: number;
  created_at: string;
}

export interface Department {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  institutions?: Institution;
}

export interface Program {
  id: string;
  department_id: string;
  code: string;
  name: string;
  current_level_id: string | null;
  is_accreditation_active?: boolean;
  departments?: Department;
  accreditation_levels?: AccreditationLevel | null;
}

export interface AccreditationFramework {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
}

export interface AccreditationArea {
  id: string;
  framework_id: string;
  code: string;
  title: string;
  weight?: number;
  display_order?: number;
  created_at: string;
  accreditation_frameworks?: AccreditationFramework;
}

export interface RatingScaleDefinitionItem {
  value: number;
  label: string;
  description?: string;
  min_pct?: number;
  max_pct?: number;
}

export interface RatingScale {
  id: string;
  framework_id?: string | null;
  name: string;
  description?: string | null;
  scale_definition: RatingScaleDefinitionItem[];
  created_at?: string;
  accreditation_frameworks?: AccreditationFramework;
}

export interface LevelSpecificCriterion {
  id: string;
  level_id: string;
  code: string;
  title: string;
  description?: string | null;
  is_mandatory: boolean;
  rating_scale_id?: string | null;
  created_at?: string;
  rating_scales?: RatingScale | null;
  accreditation_levels?: AccreditationLevel | null;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  auth_user_id: string | null;
  institution_id: string | null;
  program_id: string | null;
  department_id: string;
  is_active: boolean;
  created_at: string;
  programs?: Program | null;
}

export interface AccreditationCriterion {
  id: string;
  framework_id: string;
  parent_criterion_id?: string | null;
  code: string;
  title: string;
  weight: number;
  required_count: number;
  expected_document_type?: string | null;
  rating_axis?: 'adequacy' | 'effectiveness' | 'both' | 'single' | null;
  program_id?: string | null;
  area_id?: string | null;
  created_by?: string;
  created_at?: string;
  // Joins
  programs?: Program;
  accreditation_areas?: AccreditationArea;
}

export interface AccreditationCriterionNode extends AccreditationCriterion {
  children?: AccreditationCriterionNode[];
}

export interface EvidenceDocument {
  id: string;
  criterion_id: string;
  uploaded_by: string;
  program_id: string;
  file_url: string;
  storage_path?: string | null;
  document_type: string | null;
  effective_date: string | null;
  version: number;
  previous_version_id?: string | null;
  status: EvidenceStatus;
  reviewer_notes?: string | null;
  verified_by: string | null;
  verified_at: string | null;
  uploaded_at: string;
  accreditation_criteria?: AccreditationCriterion;
  programs?: Program;
  uploader?: User;
  verifier?: User;
}

export interface ReadinessScore {
  id: string;
  criterion_id: string;
  program_id: string;
  score: number;
  status: ReadinessStatus;
  last_computed_at?: string;
  calculated_at?: string;
  accreditation_criteria?: AccreditationCriterion;
  programs?: Program;
}

export interface Simulation {
  id: string;
  created_by: string;
  program_id: string;
  simulated_criteria_ids: string[];
  projected_score: number;
  created_at: string;
}

export interface AreaAssignment {
  id: string;
  area_id: string;
  program_id: string;
  user_id: string;
  assignment_type: AssignmentType;
  assigned_by: string;
  created_at: string;
  accreditation_areas?: AccreditationArea;
  users?: User;
  programs?: Program;
}

export interface PdfExtractionResult {
  matchedType: boolean;
  suggestedDate: string | null;
  extractedKeywords: string[];
  isScanned: boolean;
  info?: string | null;
  warning?: string | null;
  isExpiredRecency?: boolean;
}

export interface AccreditationCycle {
  id: string;
  program_id: string;
  name?: string;
  target_level: string;
  target_date: string | null;
  status: CycleStatus;
  created_at: string;
  created_by?: string | null;
  certified_by?: string | null;
  certified_at?: string | null;
  programs?: Program;
  certifier?: User;
}

export interface ComplianceAction {
  id: string;
  recommendation_id: string;
  action_number: string;
  action_taken: string;
  team_verification: string;
  linked_evidence_id?: string | null;
  created_by?: string | null;
  created_at: string;
  evidence_documents?: EvidenceDocument | null;
  creator?: User | null;
}

export interface AccreditationRecommendation {
  id: string;
  cycle_id?: string;
  area_id: string;
  program_id: string;
  item_number?: number | null;
  opportunity_for_improvement?: string;
  description?: string;
  recommendation_text: string;
  action_plan?: string;
  responsible_person?: string;
  target_date?: string;
  priority?: 'high' | 'medium' | 'low';
  status: RecommendationStatus;
  assigned_to?: string | null;
  created_by?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  accreditation_cycles?: AccreditationCycle;
  accreditation_areas?: AccreditationArea;
  programs?: Program;
  compliance_actions?: ComplianceAction[];
  assignee?: User;
  creator?: User;
  resolver?: User;
}

export type AuditAction = 
  | 'evidence_uploaded' 
  | 'evidence_verified' 
  | 'evidence_rejected' 
  | 'criterion_created' 
  | 'criterion_edited' 
  | 'criterion_deleted' 
  | 'area_assigned' 
  | 'area_assignment_removed' 
  | 'simulation_run'
  | 'accreditation_scope_updated'
  | 'user_created'
  | 'user_updated'
  | 'program_created'
  | 'program_updated'
  | 'department_created'
  | 'framework_created'
  | 'framework_updated'
  | 'framework_deleted'
  | 'area_created'
  | 'area_updated'
  | 'area_deleted'
  | 'level_created'
  | 'level_updated'
  | 'level_deleted'
  | 'level_criterion_created'
  | 'level_criterion_updated'
  | 'level_criterion_deleted'
  | 'rating_scale_created'
  | 'rating_scale_updated'
  | 'rating_scale_deleted'
  | 'cycle_created'
  | 'cycle_certified'
  | 'recommendation_created'
  | 'compliance_action_created';

export type AuditEntityType = 
  | 'evidence_documents' 
  | 'accreditation_criteria' 
  | 'area_assignments' 
  | 'simulations'
  | 'programs'
  | 'users'
  | 'departments'
  | 'accreditation_frameworks'
  | 'accreditation_areas'
  | 'accreditation_levels'
  | 'level_specific_criteria'
  | 'rating_scales'
  | 'accreditation_cycles'
  | 'accreditation_recommendations'
  | 'compliance_actions';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction | string;
  entity_type: AuditEntityType | string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joins
  users?: User | null;
}
