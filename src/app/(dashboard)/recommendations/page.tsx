'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  AccreditationCycle, 
  AccreditationRecommendation, 
  ComplianceAction,
  AccreditationArea, 
  AccreditationLevel, 
  AccreditationCriterion,
  EvidenceDocument,
  ReadinessScore,
  Program, 
  CycleStatus 
} from '@/lib/types';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { DocumentViewer } from '@/components/ui/DocumentViewer';
import { openEvidenceDocument } from '@/lib/evidence-service';
import { showToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { logAuditEvent } from '@/lib/audit';
import { calculateReadinessScores } from '@/lib/scoring';
import { filterCriteriaForProgram, loadExclusionMap, ExclusionMap } from '@/lib/program-criteria';
import { 
  Check, 
  AlertCircle, 
  Plus, 
  Calendar, 
  FileText, 
  Target, 
  Clock, 
  Award, 
  ShieldCheck, 
  Building2, 
  Search, 
  ExternalLink, 
  Paperclip,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Eye,
  Play,
  Trash2,
  ListChecks,
} from 'lucide-react';

export default function RecommendationsAndCyclesPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AccreditationRecommendation[]>([]);
  const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [areas, setAreas] = useState<AccreditationArea[]>([]);
  const [levels, setLevels] = useState<AccreditationLevel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'cycles' | 'recommendations'>('recommendations');

  // Resolution confirmation
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);
  const [resolveTargetId, setResolveTargetId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  // Cycle status update loading
  const [updatingCycleId, setUpdatingCycleId] = useState<string | null>(null);

  // QA Institutional Certification State
  const [allCriteria, setAllCriteria] = useState<AccreditationCriterion[]>([]);
  const [allVerifiedEvidence, setAllVerifiedEvidence] = useState<EvidenceDocument[]>([]);
  const [allReadinessScores, setAllReadinessScores] = useState<ReadinessScore[]>([]);
  const [exclusionMap, setExclusionMap] = useState<ExclusionMap>(new Map());
  const [usersMap, setUsersMap] = useState<Record<string, { full_name: string; email: string }>>({});
  const [certifyingCycle, setCertifyingCycle] = useState<AccreditationCycle | null>(null);
  const [certifyingLoading, setCertifyingLoading] = useState(false);
  const [outstandingModalCycle, setOutstandingModalCycle] = useState<{
    cycle: AccreditationCycle;
    outstanding: { code: string; title: string; status: string }[];
  } | null>(null);

  // All uploaded evidence documents for linking in Team Verification
  const [evidenceForLinking, setEvidenceForLinking] = useState<EvidenceDocument[]>([]);
  const [previewEvidenceDoc, setPreviewEvidenceDoc] = useState<EvidenceDocument | null>(null);

  // Create Cycle Modal State
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [creatingCycle, setCreatingCycle] = useState(false);
  const [cycleForm, setCycleForm] = useState<{
    program_id: string;
    name: string;
    target_level: string;
    target_date: string;
    status: CycleStatus;
  }>({
    program_id: '',
    name: '',
    target_level: 'Level I - Accredited Status',
    target_date: '',
    status: 'in_progress',
  });

  // Modal 1: Create Recommendation / Opportunity State
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [creatingRec, setCreatingRec] = useState(false);
  const [recForm, setRecForm] = useState<{
    program_id: string;
    cycle_id: string;
    area_id: string;
    item_number: number;
    opportunity_for_improvement: string;
    recommendation_text: string;
  }>({
    program_id: '',
    cycle_id: '',
    area_id: '',
    item_number: 1,
    opportunity_for_improvement: '',
    recommendation_text: '',
  });

  // Modal 2: Add Compliance Action Taken State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [creatingAction, setCreatingAction] = useState(false);
  const [targetRecForAction, setTargetRecForAction] = useState<AccreditationRecommendation | null>(null);
  const [actionForm, setActionForm] = useState<{
    action_number: string;
    action_taken: string;
    team_verification: string;
    linked_evidence_id: string;
  }>({
    action_number: '',
    action_taken: '',
    team_verification: '',
    linked_evidence_id: '',
  });

  // Modal 3: Attach / Change Evidence File directly to an Action
  const [isAttachFileModalOpen, setIsAttachFileModalOpen] = useState(false);
  const [targetActionForFile, setTargetActionForFile] = useState<{
    action: ComplianceAction;
    rec: AccreditationRecommendation;
  } | null>(null);
  const [selectedEvidenceIdToAttach, setSelectedEvidenceIdToAttach] = useState<string>('');
  const [evidenceSearchTerm, setEvidenceSearchTerm] = useState<string>('');
  const [evidenceAreaFilter, setEvidenceAreaFilter] = useState<string>('all');
  const [attachingFile, setAttachingFile] = useState(false);

  // Full-Height Matrix View & Collapsible Document Banner
  const [isFullHeight, setIsFullHeight] = useState(false);
  const [showDocBanner, setShowDocBanner] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [
        { data: cyclesData },
        { data: programsData },
        { data: areasData },
        { data: levelsData },
        { data: criteriaData },
        { data: verifiedEvidenceData },
        { data: allEvidenceData },
        { data: scoresData },
        { data: usersData },
        { data: recsData },
        exclusionRes,
      ] = await Promise.all([
        supabase.from('accreditation_cycles').select('*, programs(*)').order('created_at', { ascending: false }),
        supabase.from('programs').select('*, departments(*, institutions(*))').order('code'),
        supabase.from('accreditation_areas').select('*').order('display_order'),
        supabase.from('accreditation_levels').select('*').order('level_number'),
        supabase.from('accreditation_criteria').select('*, accreditation_areas(*)').order('code'),
        supabase.from('evidence_documents').select('id, criterion_id, program_id, status, document_type, effective_date').eq('status', 'verified'),
        supabase.from('evidence_documents').select('*, accreditation_criteria(code, title, area_id)').order('uploaded_at', { ascending: false }),
        supabase.from('readiness_scores').select('criterion_id, program_id, score, status'),
        supabase.from('users').select('id, full_name, email'),
        supabase.from('accreditation_recommendations').select(`
          *,
          accreditation_cycles(*),
          accreditation_areas(*),
          programs(*, departments(*, institutions(*))),
          compliance_actions(
            *,
            evidence_documents(*),
            creator:created_by(full_name, email)
          )
        `).order('item_number', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }),
        loadExclusionMap(supabase),
      ]);

      if (exclusionRes?.map) setExclusionMap(exclusionRes.map);

      if (cyclesData) setCycles(cyclesData as AccreditationCycle[]);
      if (programsData) {
        setPrograms(programsData as Program[]);
        if (user?.program_id && selectedProgram === 'all') {
          setSelectedProgram(user.program_id);
        }
      }
      if (areasData) setAreas(areasData as AccreditationArea[]);
      if (levelsData) setLevels(levelsData as AccreditationLevel[]);
      if (criteriaData) setAllCriteria(criteriaData as AccreditationCriterion[]);
      if (verifiedEvidenceData) setAllVerifiedEvidence(verifiedEvidenceData as EvidenceDocument[]);
      if (allEvidenceData) setEvidenceForLinking(allEvidenceData as EvidenceDocument[]);
      if (scoresData) setAllReadinessScores(scoresData as ReadinessScore[]);
      if (usersData) {
        const uMap: Record<string, { full_name: string; email: string }> = {};
        usersData.forEach((u) => { uMap[u.id] = { full_name: u.full_name || 'User', email: u.email || '' }; });
        setUsersMap(uMap);
      }
      if (recsData && recsData.length > 0) {
        setRecommendations(recsData as AccreditationRecommendation[]);
      } else {
        const { getMockDatabase } = await import('@/lib/mock-data');
        const db = getMockDatabase();
        setRecommendations(db.accreditation_recommendations as AccreditationRecommendation[]);
        if (!cyclesData || cyclesData.length === 0) {
          setCycles(db.accreditation_cycles as AccreditationCycle[]);
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [user, selectedProgram, supabase]);

  useEffect(() => {
    if (!user) return;
    fetchData(true);
  }, [user, fetchData]);

  // Escape key listener for exiting Full Height matrix view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullHeight) {
        setIsFullHeight(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullHeight]);

  // QA Institutional Certification Eligibility Check
  const getOutstandingCriteria = useCallback((cycle: AccreditationCycle) => {
    const applicableCriteria = filterCriteriaForProgram(allCriteria, cycle.program_id, exclusionMap);
    const parentIds = new Set(applicableCriteria.map(c => c.parent_criterion_id).filter(Boolean));
    const leafCriteria = applicableCriteria.filter(c => !parentIds.has(c.id));
    const leafIds = new Set(leafCriteria.map(c => c.id));

    // 1. Check if readiness_scores exist for this program
    const programScores = allReadinessScores.filter(s => s.program_id === cycle.program_id && leafIds.has(s.criterion_id));
    if (programScores.length > 0) {
      const nonSufficient = programScores.filter(s => s.status !== 'sufficient');
      return nonSufficient.map(s => {
        const crit = leafCriteria.find(c => c.id === s.criterion_id);
        return {
          code: crit?.code || 'Criterion',
          title: crit?.title || 'Criteria Item',
          status: s.status,
        };
      });
    }

    // 2. Otherwise calculate readiness dynamically from verified evidence
    const progEvidence = allVerifiedEvidence.filter(e => e.program_id === cycle.program_id);
    const calculated = calculateReadinessScores(applicableCriteria, progEvidence, cycle.program_id);
    const nonSufficient = calculated.filter(c => c.status !== 'sufficient' && leafIds.has(c.criterion_id || ''));
    return nonSufficient.map(s => {
      const crit = leafCriteria.find(c => c.id === s.criterion_id);
      return {
        code: crit?.code || 'Criterion',
        title: crit?.title || 'Criteria Item',
        status: s.status || 'no_evidence',
      };
    });
  }, [allCriteria, allReadinessScores, allVerifiedEvidence, exclusionMap]);

  // QA Certify Cycle Action
  const handleCertifyCycle = async () => {
    if (!user || user.role !== 'qa' || !certifyingCycle) return;
    const outstanding = getOutstandingCriteria(certifyingCycle);
    if (outstanding.length > 0) {
      showToast('error', `Cannot certify: ${outstanding.length} criteria are still outstanding.`);
      setOutstandingModalCycle({ cycle: certifyingCycle, outstanding });
      setCertifyingCycle(null);
      return;
    }

    setCertifyingLoading(true);
    try {
      const { error } = await supabase
        .from('accreditation_cycles')
        .update({
          status: 'certified',
          certified_by: user.id,
          certified_at: new Date().toISOString(),
        })
        .eq('id', certifyingCycle.id);

      if (error) throw error;

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'cycle_certified',
        entityType: 'accreditation_cycles',
        entityId: certifyingCycle.id,
        metadata: {
          cycle_name: certifyingCycle.name,
          program_id: certifyingCycle.program_id,
          program_code: certifyingCycle.programs?.code,
          target_level: certifyingCycle.target_level,
          certified_by: user.id,
          certified_at: new Date().toISOString(),
        },
      });

      showToast('success', `Accreditation cycle [${certifyingCycle.name}] has been officially certified by QA!`);
      setCycles(prev => prev.map(c => c.id === certifyingCycle.id ? {
        ...c,
        status: 'certified',
        certified_by: user.id,
        certified_at: new Date().toISOString(),
      } : c));
      setCertifyingCycle(null);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to certify cycle');
    } finally {
      setCertifyingLoading(false);
    }
  };

  // Advance / Update Cycle Status
  const handleUpdateCycleStatus = async (cycleId: string, newStatus: CycleStatus) => {
    setUpdatingCycleId(cycleId);
    try {
      const { error } = await supabase
        .from('accreditation_cycles')
        .update({ status: newStatus })
        .eq('id', cycleId);

      if (error) throw error;

      setCycles(prev => prev.map(c => c.id === cycleId ? { ...c, status: newStatus } : c));
      showToast('success', `Cycle status updated to ${newStatus.replace('_', ' ')}.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update cycle status');
    } finally {
      setUpdatingCycleId(null);
    }
  };

  // Open Resolve Confirm Modal
  const openResolveConfirm = (id: string) => {
    setResolveTargetId(id);
    setResolveConfirmOpen(true);
  };

  // Mark Recommendation as Resolved / Unresolved
  const handleResolve = async () => {
    if (!user || !resolveTargetId) return;
    setResolving(true);
    try {
      const targetRec = recommendations.find(r => r.id === resolveTargetId);
      const newStatus = targetRec?.status === 'resolved' ? 'open' : 'resolved';
      const resolvedAt = newStatus === 'resolved' ? new Date().toISOString() : null;
      const resolvedBy = newStatus === 'resolved' ? user.id : null;

      const { error } = await supabase
        .from('accreditation_recommendations')
        .update({
          status: newStatus,
          resolved_by: resolvedBy,
          resolved_at: resolvedAt,
        })
        .eq('id', resolveTargetId);

      if (error) throw error;

      showToast('success', newStatus === 'resolved' ? 'Opportunity marked as fully resolved.' : 'Opportunity reopened.');
      setRecommendations(prev =>
        prev.map(r => (r.id === resolveTargetId ? { ...r, status: newStatus, resolved_at: resolvedAt } : r))
      );
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update recommendation status');
    } finally {
      setResolving(false);
      setResolveConfirmOpen(false);
      setResolveTargetId(null);
    }
  };

  // Open Create Cycle Modal
  const openNewCycleModal = () => {
    const defaultProg = selectedProgram !== 'all' ? selectedProgram : programs[0]?.id || '';
    setCycleForm({
      program_id: defaultProg,
      name: '',
      target_level: levels[1]?.label || 'Level I - Accredited Status',
      target_date: '',
      status: 'in_progress',
    });
    setIsCycleModalOpen(true);
  };

  // Submit New Cycle
  const handleSaveCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!cycleForm.program_id) {
      showToast('error', 'Please select a program.');
      return;
    }
    if (!cycleForm.name.trim()) {
      showToast('error', 'Please enter a cycle name.');
      return;
    }

    setCreatingCycle(true);
    try {
      const { data: newCycle, error } = await supabase
        .from('accreditation_cycles')
        .insert({
          program_id: cycleForm.program_id,
          name: cycleForm.name.trim(),
          target_level: cycleForm.target_level,
          target_date: cycleForm.target_date || null,
          status: cycleForm.status,
          created_by: user.id,
        })
        .select('*, programs(*)')
        .single();

      if (error) throw error;

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'cycle_created',
        entityType: 'accreditation_cycles',
        entityId: newCycle.id,
        metadata: {
          program_id: cycleForm.program_id,
          name: cycleForm.name.trim(),
          target_level: cycleForm.target_level,
          status: cycleForm.status,
        },
      });

      showToast('success', `Accreditation cycle [${cycleForm.name}] created successfully!`);
      setIsCycleModalOpen(false);
      setActiveTab('cycles');
      setCycles(prev => [newCycle as AccreditationCycle, ...prev]);
      fetchData(false);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create cycle');
    } finally {
      setCreatingCycle(false);
    }
  };

  // Open Modal 1: Create Recommendation / Opportunity
  const openNewRecModal = (presetCycleId?: string) => {
    const defaultProg = selectedProgram !== 'all' ? selectedProgram : programs[0]?.id || '';
    const availableCycles = cycles.filter(c => !defaultProg || c.program_id === defaultProg);
    const defaultCycle = presetCycleId || (availableCycles[0]?.id || cycles[0]?.id || '');
    
    // Auto-calculate next item number
    const existingItems = recommendations.filter(r => 
      (!defaultProg || r.program_id === defaultProg) &&
      (!defaultCycle || r.cycle_id === defaultCycle)
    ).map(r => r.item_number || 0);
    const nextItemNumber = existingItems.length > 0 ? Math.max(...existingItems) + 1 : 1;

    setRecForm({
      program_id: defaultProg,
      cycle_id: defaultCycle,
      area_id: areas[0]?.id || '',
      item_number: nextItemNumber,
      opportunity_for_improvement: '',
      recommendation_text: '',
    });
    setIsRecModalOpen(true);
  };

  // Submit Modal 1: Create Recommendation / Opportunity
  const handleSaveRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!recForm.program_id) return showToast('error', 'Please select an academic program.');
    if (!recForm.cycle_id) return showToast('error', 'Please select an accreditation cycle.');
    if (!recForm.area_id) return showToast('error', 'Please select an accreditation area.');
    if (!recForm.opportunity_for_improvement.trim()) return showToast('error', 'Please enter the Opportunity for Improvement.');
    if (!recForm.recommendation_text.trim()) return showToast('error', 'Please enter the Recommendation text.');

    setCreatingRec(true);
    try {
      const payload = {
        program_id: recForm.program_id,
        cycle_id: recForm.cycle_id,
        area_id: recForm.area_id,
        item_number: Number(recForm.item_number) || 1,
        opportunity_for_improvement: recForm.opportunity_for_improvement.trim(),
        recommendation_text: recForm.recommendation_text.trim(),
        status: 'open' as const,
        created_by: user.id,
      };

      const { data: newRec, error } = await supabase
        .from('accreditation_recommendations')
        .insert(payload)
        .select(`
          *,
          accreditation_cycles(*),
          accreditation_areas(*),
          programs(*, departments(*, institutions(*))),
          compliance_actions(*)
        `)
        .single();

      if (error) throw error;

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'recommendation_created',
        entityType: 'accreditation_recommendations',
        entityId: newRec.id,
        metadata: {
          item_number: payload.item_number,
          program_id: payload.program_id,
          cycle_id: payload.cycle_id,
          area_id: payload.area_id,
        },
      });

      showToast('success', `Opportunity Item ${payload.item_number} added to the compliance report!`);
      setIsRecModalOpen(false);
      setActiveTab('recommendations');
      setRecommendations(prev => [...prev, { ...newRec, compliance_actions: [] } as AccreditationRecommendation]);
      fetchData(false);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save recommendation');
    } finally {
      setCreatingRec(false);
    }
  };

  // Open Modal 2: Add Compliance Action Taken
  const openNewActionModal = (rec: AccreditationRecommendation) => {
    setTargetRecForAction(rec);
    const existingActions = rec.compliance_actions || [];
    const itemNum = rec.item_number || 1;
    const subNum = existingActions.length + 1;
    const defaultActionNumber = `${itemNum}.${subNum}`;

    setActionForm({
      action_number: defaultActionNumber,
      action_taken: '',
      team_verification: '',
      linked_evidence_id: '',
    });
    setIsActionModalOpen(true);
  };

  // Submit Modal 2: Add Compliance Action Taken
  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetRecForAction) return;
    if (!actionForm.action_number.trim()) return showToast('error', 'Please provide an action sub-number (e.g. 1.1).');
    if (!actionForm.action_taken.trim()) return showToast('error', 'Please enter the Action Taken description.');
    if (!actionForm.team_verification.trim()) return showToast('error', 'Please enter the Team Verification evidence description.');

    setCreatingAction(true);
    try {
      const payload = {
        recommendation_id: targetRecForAction.id,
        action_number: actionForm.action_number.trim(),
        action_taken: actionForm.action_taken.trim(),
        team_verification: actionForm.team_verification.trim(),
        linked_evidence_id: actionForm.linked_evidence_id || null,
        created_by: user.id,
      };

      const { data: newAction, error } = await supabase
        .from('compliance_actions')
        .insert(payload)
        .select(`
          *,
          evidence_documents(*),
          creator:created_by(full_name, email)
        `)
        .single();

      if (error) throw error;

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'compliance_action_created',
        entityType: 'compliance_actions',
        entityId: newAction.id,
        metadata: {
          recommendation_id: targetRecForAction.id,
          action_number: payload.action_number,
          linked_evidence_id: payload.linked_evidence_id,
        },
      });

      showToast('success', `Action Taken ${payload.action_number} recorded with team verification!`);
      setIsActionModalOpen(false);

      // Optimistically update recommendation actions in local state
      setRecommendations(prev => prev.map(r => {
        if (r.id === targetRecForAction.id) {
          const currentActions = r.compliance_actions || [];
          return {
            ...r,
            compliance_actions: [...currentActions, newAction as ComplianceAction],
          };
        }
        return r;
      }));

      fetchData(false);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save compliance action');
    } finally {
      setCreatingAction(false);
      setTargetRecForAction(null);
    }
  };

  // Helper functions for evidence files
  const cleanFileName = (url: string) => {
    if (!url) return 'Evidence Document';
    try {
      let target = url;
      // Extract from SharePoint/OneDrive/Stream ?id= query param if present
      if (target.includes('?id=') || target.includes('&id=')) {
        const match = target.match(/[?&]id=([^&]+)/);
        if (match && match[1]) {
          target = decodeURIComponent(match[1]);
        }
      } else {
        target = target.split('?')[0].split('#')[0];
      }
      const raw = decodeURIComponent(target.split('/').filter(Boolean).pop() || '');
      // Strip leading timestamp and index prefixes (e.g. 1791542344523_0_1.1_Memorandum... -> 1.1 Memorandum...)
      const stripped = raw.replace(/^\d+_\d+_/, '').replace(/^[\d]{10,}_/, '').replace(/_/g, ' ').trim();
      if (stripped.length > 50) {
        return stripped.slice(0, 47) + '...';
      }
      return stripped || 'Evidence Document';
    } catch {
      const fallback = url.split('/').pop()?.split('?')[0] || 'Evidence Document';
      return fallback.length > 50 ? fallback.slice(0, 47) + '...' : fallback;
    }
  };

  const isStreamOrVideo = (url: string) => {
    const u = url.toLowerCase();
    return u.includes('.mp4') || u.includes('stream.aspx') || u.includes('sharepoint');
  };

  // Open Modal 3: Attach Evidence File directly to an action
  const openAttachFileModal = (action: ComplianceAction, rec: AccreditationRecommendation) => {
    setTargetActionForFile({ action, rec });
    setSelectedEvidenceIdToAttach(action.linked_evidence_id || '');
    setEvidenceSearchTerm('');
    setEvidenceAreaFilter(rec.area_id || 'all');
    setIsAttachFileModalOpen(true);
  };

  // Submit Modal 3: Attach or Detach Evidence File
  const handleAttachEvidence = async (newEvidenceId: string | null) => {
    if (!user || !targetActionForFile) return;
    setAttachingFile(true);
    try {
      const { error } = await supabase
        .from('compliance_actions')
        .update({ linked_evidence_id: newEvidenceId })
        .eq('id', targetActionForFile.action.id);

      if (error) throw error;

      const attachedDoc = newEvidenceId ? evidenceForLinking.find(e => e.id === newEvidenceId) : null;

      await logAuditEvent(supabase, {
        userId: user.id,
        action: newEvidenceId ? 'compliance_action_file_attached' : 'compliance_action_file_detached',
        entityType: 'compliance_actions',
        entityId: targetActionForFile.action.id,
        metadata: {
          recommendation_id: targetActionForFile.rec.id,
          action_number: targetActionForFile.action.action_number,
          linked_evidence_id: newEvidenceId,
          file_url: attachedDoc?.file_url,
        },
      });

      showToast(
        'success',
        newEvidenceId
          ? `Evidence file attached to Action ${targetActionForFile.action.action_number}!`
          : `Attachment removed from Action ${targetActionForFile.action.action_number}.`
      );

      // Optimistically update local recommendations state
      setRecommendations(prev => prev.map(r => {
        if (r.id === targetActionForFile.rec.id) {
          return {
            ...r,
            compliance_actions: (r.compliance_actions || []).map(a => {
              if (a.id === targetActionForFile.action.id) {
                return {
                  ...a,
                  linked_evidence_id: newEvidenceId || null,
                  evidence_documents: attachedDoc || null,
                };
              }
              return a;
            }),
          };
        }
        return r;
      }));

      setIsAttachFileModalOpen(false);
      setTargetActionForFile(null);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to attach evidence file');
    } finally {
      setAttachingFile(false);
    }
  };

  // Filtered lists
  const filteredCycles = cycles.filter((c) => selectedProgram === 'all' || c.program_id === selectedProgram);

  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      if (selectedProgram !== 'all' && r.program_id !== selectedProgram) return false;
      if (selectedCycle !== 'all' && r.cycle_id !== selectedCycle) return false;
      if (selectedArea !== 'all' && r.area_id !== selectedArea) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const opp = (r.opportunity_for_improvement || r.description || '').toLowerCase();
      const recText = (r.recommendation_text || '').toLowerCase();
      const areaCode = (r.accreditation_areas?.code || '').toLowerCase();
      const actions = (r.compliance_actions || []).map(a => `${a.action_number} ${a.action_taken} ${a.team_verification}`.toLowerCase()).join(' ');
      return opp.includes(q) || recText.includes(q) || areaCode.includes(q) || actions.includes(q);
    });
  }, [recommendations, selectedProgram, selectedCycle, selectedArea, searchQuery]);

  // Derived active metadata for PACUCOA report header
  const activeProgObj = programs.find(p => p.id === (selectedProgram !== 'all' ? selectedProgram : recommendations[0]?.program_id || programs[0]?.id));
  const activeInstitutionName = activeProgObj?.departments?.institutions?.name || 'STI West Negros University';
  const activeCollegeName = activeProgObj?.departments?.name || 'College of Information and Communications Technology (CICT)';
  const activeProgramCode = activeProgObj?.code || 'BSCS';
  const activeProgramName = activeProgObj?.name || 'Bachelor of Science in Computer Science';
  
  const activeCycleObj = cycles.find(c => c.id === (selectedCycle !== 'all' ? selectedCycle : recommendations[0]?.cycle_id || cycles[0]?.id));
  const activeVisitType = activeCycleObj?.target_level || 'Level I Accreditation Visit';

  const activeAreaObj = areas.find(a => a.id === selectedArea);
  const activeAreaLabel = activeAreaObj ? `${activeAreaObj.code}: ${activeAreaObj.title}` : 'All Evaluated Areas';

  const canManageCycles = ['qa'].includes(user?.role as string);
  const canManageRecs = ['qa', 'program_head'].includes(user?.role as string);

  if (user && ['alumni_rep', 'student_rep', 'system_admin'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <ListChecks className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-800">Access Restricted</p>
        <p className="text-sm mt-1 max-w-md text-center text-gray-500">
          {user.role === 'system_admin'
            ? 'System Administrators manage IT infrastructure and user accounts and do not access evaluation workflows.'
            : 'Representatives have read-only access to readiness summaries only. Access to compliance recommendations and exhibits is restricted.'}
        </p>
      </div>
    );
  }

  if (loading && !recommendations.length && !cycles.length) {
    return (
      <div className="space-y-4">
        <TableSkeleton rows={8} cols={4} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Top Header & Program Switcher */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Accreditation Cycles & Compliance Reports</h1>
          <p className="text-xs text-gray-500">Official PACUCOA post-visit compliance matrix & institutional cycle certification.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {['qa', 'dean', 'observer', 'system_admin'].includes(user?.role as string) && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-semibold text-gray-600">Program:</span>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-gray-900 focus:ring-0 p-0 cursor-pointer"
              >
                <option value="all">All Programs</option>
                {programs.map((p) => {
                  const isActive = p.is_accreditation_active !== false;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.code} {!isActive ? '(Out of Cycle)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {canManageCycles && (
            <Button
              variant="outline"
              size="sm"
              onClick={openNewCycleModal}
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary" />
              New Cycle
            </Button>
          )}

          {canManageRecs && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => openNewRecModal()}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Opportunity / Recommendation
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Selector: Compliance Report vs Cycles */}
      <div className="shrink-0 flex items-center bg-gray-100 p-1 rounded-xl gap-1 w-fit border border-gray-200/80">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'recommendations'
              ? 'bg-white text-gray-900 shadow-2xs font-bold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>PACUCOA Compliance Report</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
            activeTab === 'recommendations' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {filteredRecs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cycles')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'cycles'
              ? 'bg-white text-gray-900 shadow-2xs font-bold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>Accreditation Cycles</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
            activeTab === 'cycles' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {filteredCycles.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PACUCOA COMPLIANCE REPORT MATRIX (4-COLUMN REAL PACUCOA FORMAT)      */}
      {/* ========================================================================= */}
      {activeTab === 'recommendations' && (
        <div className="flex-1 min-h-0 flex flex-col space-y-2.5 overflow-hidden">
          {/* Official Document Header Banner (Collapsible to save ~130px vertical space) */}
          {showDocBanner ? (
            <div className="shrink-0 bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                        Philippine Accrediting Association of Colleges and Universities (PACUCOA)
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        Official Format
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">Post-Visit Institutional Compliance & Improvement Matrix</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold tracking-wide">
                    STI West Negros University • CICT
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDocBanner(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Collapse details header"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-gray-50/80 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">Institution & College</span>
                  <span className="font-semibold text-gray-900 truncate block mt-0.5" title={`${activeInstitutionName} • ${activeCollegeName}`}>
                    {activeInstitutionName} • {activeCollegeName}
                  </span>
                </div>
                <div className="bg-gray-50/80 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">Program</span>
                  <span className="font-semibold text-primary truncate block mt-0.5">
                    [{activeProgramCode}] {activeProgramName}
                  </span>
                </div>
                <div className="bg-gray-50/80 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">Type of Visit</span>
                  <span className="font-semibold text-gray-900 truncate block mt-0.5">
                    {activeVisitType}
                  </span>
                </div>
                <div className="bg-gray-50/80 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">Focus Area</span>
                  <span className="font-semibold text-gray-900 truncate block mt-0.5">
                    {activeAreaLabel}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="shrink-0 bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-md bg-primary/10 text-primary shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-xs text-gray-900 truncate">
                    PACUCOA Post-Visit Compliance & Improvement Matrix
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    Official Format
                  </span>
                  <span className="hidden md:inline text-gray-300">•</span>
                  <span className="hidden md:inline text-[11px] text-gray-500 font-medium truncate">
                    {activeInstitutionName} • [{activeProgramCode}] {activeProgramName} • {activeVisitType}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDocBanner(true)}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                title="Expand institutional details"
              >
                <span>Details</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="shrink-0 bg-white rounded-xl border border-gray-200 px-3.5 py-2 flex flex-col md:flex-row gap-2.5 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search opportunities, recommendations, actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-transparent text-gray-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Cycle Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Cycle:</span>
                <select
                  value={selectedCycle}
                  onChange={(e) => setSelectedCycle(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-gray-800 focus:ring-0 p-0 cursor-pointer"
                >
                  <option value="all">All Cycles</option>
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Area Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Area:</span>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-gray-800 focus:ring-0 p-0 cursor-pointer"
                >
                  <option value="all">All Areas</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.code}: {a.title}</option>
                  ))}
                </select>
              </div>

              {/* Full Height Toggle Button */}
              <Button
                variant={isFullHeight ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIsFullHeight(!isFullHeight)}
                className="!py-1 !px-2.5 !text-xs font-semibold flex items-center gap-1.5 ml-auto md:ml-0"
                title={isFullHeight ? 'Exit Full Height (Esc)' : 'Expand table to full screen height'}
              >
                {isFullHeight ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Exit Full Height</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-primary" />
                    <span>Full Height</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 4-Column Table */}
          {filteredRecs.length === 0 ? (
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
              <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-800">No Compliance Recommendations</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto mb-3">
                No opportunities for improvement are recorded for the selected program and cycle.
              </p>
              {canManageRecs && (
                <Button variant="primary" size="sm" onClick={() => openNewRecModal()}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add First Opportunity & Recommendation
                </Button>
              )}
            </div>
          ) : (
            <div className={
              isFullHeight 
                ? "fixed inset-2 sm:inset-3 z-50 bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden animate-in fade-in duration-150"
                : "flex-1 min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col"
            }>
              {/* Full Height Top Command Bar (Clean Light Theme) */}
              {isFullHeight && (
                <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      4C
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xs font-bold text-gray-900 tracking-wide uppercase flex items-center gap-2 truncate">
                        PACUCOA Post-Visit Compliance Matrix
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold shrink-0">
                          Full Height View
                        </span>
                      </h2>
                      <p className="text-[11px] text-gray-500 truncate">
                        {activeInstitutionName} • [{activeProgramCode}] {activeProgramName} • {filteredRecs.length} Opportunities
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canManageRecs && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => openNewRecModal()}
                        className="!py-1 !px-2.5 !text-xs font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Opportunity
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFullHeight(false)}
                      className="!py-1 !px-2.5 !text-xs font-semibold text-gray-700 border-gray-300 hover:bg-gray-100 flex items-center gap-1.5"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Exit Full Height (Esc)</span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-left border-collapse table-fixed text-xs">
                  <thead className="sticky top-0 bg-primary border-b border-primary/20 z-10 text-[11px] font-bold text-white uppercase tracking-wider select-none shadow-xs">
                    <tr className="bg-primary text-white">
                      <th className="px-4 py-2.5 border-r border-white/20 w-[28%] text-white font-bold">
                        1. Opportunities for Improvement
                      </th>
                      <th className="px-4 py-2.5 border-r border-white/20 w-[28%] text-white font-bold">
                        2. Recommendations
                      </th>
                      <th className="px-4 py-2.5 border-r border-white/20 w-[24%] text-white font-bold">
                        3. Actions Taken (Sub-numbered)
                      </th>
                      <th className="px-4 py-2.5 w-[20%] text-white font-bold">
                        4. Team Verification
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecs.map((rec, rIdx) => {
                      const actions = rec.compliance_actions || [];
                      const itemNum = rec.item_number || rIdx + 1;
                      const isResolved = rec.status === 'resolved';

                      if (actions.length === 0) {
                        return (
                          <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-200">
                            {/* Col 1: Opportunity */}
                            <td className="px-4 py-3.5 border-r border-gray-200 align-top">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-bold text-xs shrink-0">
                                    {itemNum}
                                  </span>
                                  <StatusBadge status={rec.status} />
                                </div>

                                <p className="text-gray-900 font-semibold text-xs leading-relaxed">
                                  {rec.opportunity_for_improvement || rec.description}
                                </p>

                                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                                    {rec.accreditation_areas?.code || 'Area'}
                                  </span>
                                  <span>•</span>
                                  <span className="text-gray-600 truncate max-w-[140px]" title={rec.accreditation_cycles?.name}>
                                    {rec.accreditation_cycles?.name}
                                  </span>
                                </div>

                                {canManageRecs && (
                                  <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-gray-100">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="!py-0.5 !px-2 !text-[11px]"
                                      onClick={() => openNewActionModal(rec)}
                                    >
                                      <Plus className="w-3 h-3 mr-1 text-primary" />
                                      Add Action
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="!py-0.5 !px-2 !text-[11px]"
                                      onClick={() => openResolveConfirm(rec.id)}
                                    >
                                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                      {isResolved ? 'Reopen' : 'Resolve'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Col 2: Recommendation */}
                            <td className="px-4 py-3.5 border-r border-gray-200 align-top">
                              <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-gray-800 text-xs leading-relaxed">
                                {rec.recommendation_text || rec.description || 'No specific recommendation text provided.'}
                              </div>
                            </td>

                            {/* Col 3: Empty Actions */}
                            <td className="px-4 py-3.5 border-r border-gray-200 align-top text-gray-400 italic">
                              <div className="flex flex-col items-start gap-2">
                                <span>No actions taken recorded yet.</span>
                                {canManageRecs && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openNewActionModal(rec)}
                                    className="!text-[11px] !py-0.5 !px-2"
                                  >
                                    <Plus className="w-3 h-3 mr-1 text-primary" />
                                    Add Action {itemNum}.1
                                  </Button>
                                )}
                              </div>
                            </td>

                            {/* Col 4: Empty Verification */}
                            <td className="px-4 py-3.5 align-top text-gray-400">—</td>
                          </tr>
                        );
                      }

                      return actions.map((act, aIdx) => (
                        <tr 
                          key={act.id} 
                          className={`hover:bg-gray-50/40 transition-colors ${
                            aIdx === actions.length - 1 ? 'border-b border-gray-200' : 'border-b border-gray-100'
                          }`}
                        >
                          {aIdx === 0 && (
                            <>
                              {/* Col 1: Opportunity (spans all actions) */}
                              <td 
                                rowSpan={actions.length} 
                                className="px-4 py-3.5 border-r border-gray-200 align-top bg-white"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-bold text-xs shrink-0">
                                      {itemNum}
                                    </span>
                                    <StatusBadge status={rec.status} />
                                  </div>

                                  <p className="text-gray-900 font-semibold text-xs leading-relaxed">
                                    {rec.opportunity_for_improvement || rec.description}
                                  </p>

                                  <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                                      {rec.accreditation_areas?.code || 'Area'}
                                    </span>
                                    <span>•</span>
                                    <span className="text-gray-600 truncate max-w-[140px]" title={rec.accreditation_cycles?.name}>
                                      {rec.accreditation_cycles?.name}
                                    </span>
                                  </div>

                                  {canManageRecs && (
                                    <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-gray-100">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="!py-0.5 !px-2 !text-[11px]"
                                        onClick={() => openNewActionModal(rec)}
                                      >
                                        <Plus className="w-3 h-3 mr-1 text-primary" />
                                        Add Action
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="!py-0.5 !px-2 !text-[11px]"
                                        onClick={() => openResolveConfirm(rec.id)}
                                      >
                                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                        {isResolved ? 'Reopen' : 'Resolve'}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Col 2: Recommendation (spans all actions) */}
                              <td 
                                rowSpan={actions.length} 
                                className="px-4 py-3.5 border-r border-gray-200 align-top bg-white"
                              >
                                <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200/80 text-gray-800 text-xs leading-relaxed">
                                  {rec.recommendation_text || rec.description || 'No specific recommendation text provided.'}
                                </div>
                              </td>
                            </>
                          )}

                          {/* Col 3: Action Taken */}
                          <td className="px-4 py-3.5 border-r border-gray-200 align-top">
                            <div className="flex items-start gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold text-[11px] border border-primary/20 shrink-0 mt-0.5">
                                {act.action_number}
                              </span>
                              <span className="font-medium text-gray-900 leading-relaxed">{act.action_taken}</span>
                            </div>
                          </td>

                          {/* Col 4: Team Verification */}
                          <td className="px-4 py-3.5 align-top">
                            <div className="space-y-2">
                              <p className="font-normal text-gray-700 leading-relaxed text-xs">
                                {act.team_verification}
                              </p>

                              {/* Attached Evidence File Card */}
                              {act.evidence_documents ? (
                                <div className="pt-2">
                                  <div className="p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-lg group transition-all space-y-2">
                                    <div className="flex items-start gap-2 min-w-0">
                                      {isStreamOrVideo(act.evidence_documents.file_url) ? (
                                        <span className="p-1.5 rounded-md bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                                          <Play className="w-3.5 h-3.5 fill-current" />
                                        </span>
                                      ) : act.evidence_documents.file_url.toLowerCase().endsWith('.pdf') ? (
                                        <span className="p-1.5 rounded-md bg-red-100 text-red-700 shrink-0 mt-0.5">
                                          <FileText className="w-3.5 h-3.5" />
                                        </span>
                                      ) : (
                                        <span className="p-1.5 rounded-md bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                                          <Paperclip className="w-3.5 h-3.5" />
                                        </span>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2" title={cleanFileName(act.evidence_documents.file_url)}>
                                          {cleanFileName(act.evidence_documents.file_url)}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium mt-0.5">
                                          <span className="truncate">{act.evidence_documents.document_type || 'Verified Exhibit'}</span>
                                          {act.evidence_documents.effective_date && (
                                            <>
                                              <span>•</span>
                                              <span>{act.evidence_documents.effective_date}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewEvidenceDoc(act.evidence_documents!)}
                                        className="px-2.5 py-1 bg-white border border-gray-300 hover:border-primary text-gray-700 hover:text-primary rounded text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                        title="Preview document inline"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-primary" />
                                        <span>View Preview</span>
                                      </button>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => openEvidenceDocument(act.evidence_documents!)}
                                          className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-200/60 transition-colors"
                                          title="Open file in new tab"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </button>

                                        {canManageRecs && (
                                          <button
                                            type="button"
                                            onClick={() => openAttachFileModal(act, rec)}
                                            className="px-2 py-0.5 text-[11px] font-medium text-gray-500 hover:text-primary hover:bg-white rounded transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                                            title="Change or replace attached file"
                                          >
                                            Change
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                canManageRecs && (
                                  <div className="pt-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openAttachFileModal(act, rec)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 text-primary rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                      <Paperclip className="w-3.5 h-3.5" />
                                      <span>+ Attach Related File</span>
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACCREDITATION CYCLES                                               */}
      {/* ========================================================================= */}
      {activeTab === 'cycles' && (
        filteredCycles.length === 0 ? (
          <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-700">No Accreditation Cycles Found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto mb-4">
              There are no accreditation cycles recorded for the selected program.
            </p>
            {canManageCycles && (
              <Button variant="primary" size="sm" onClick={openNewCycleModal}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create Accreditation Cycle
              </Button>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
            {filteredCycles.map((cycle) => (
              <div 
                key={cycle.id} 
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-300 transition-colors shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">
                      {cycle.programs?.code || 'All Programs'}
                    </span>
                    <StatusBadge status={cycle.status} />
                    <span className="text-[11px] text-gray-400 font-medium">
                      Created {new Date(cycle.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
                    {cycle.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-2">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                      <Target className="w-4 h-4 text-primary" />
                      Target: {cycle.target_level}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {cycle.target_date 
                        ? `Target Visit: ${new Date(cycle.target_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}` 
                        : 'No Target Date Set'}
                    </span>
                  </div>

                  {cycle.status === 'certified' && (
                    <div className="mt-2.5 px-3 py-2 bg-indigo-50 border border-indigo-200/80 rounded-lg flex items-center gap-2 text-xs text-indigo-900">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="font-bold">Institutionally Certified by QA</span>
                        {cycle.certified_at && (
                          <span className="text-indigo-700 ml-1">
                            on {new Date(cycle.certified_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        )}
                        {cycle.certified_by && usersMap[cycle.certified_by] && (
                          <span className="text-indigo-600 ml-1">
                            ({usersMap[cycle.certified_by].full_name})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  {/* QA Institutional Certification Action */}
                  {user?.role === 'qa' && cycle.status !== 'certified' && (() => {
                    const outstanding = getOutstandingCriteria(cycle);
                    const isReady = outstanding.length === 0;

                    return (
                      <div className="relative group">
                        <Button
                          variant={isReady ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => {
                            if (!isReady) {
                              setOutstandingModalCycle({ cycle, outstanding });
                            } else {
                              setCertifyingCycle(cycle);
                            }
                          }}
                          className={isReady 
                            ? "text-xs font-semibold shadow-xs" 
                            : "text-xs font-semibold text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                          }
                        >
                          <Award className="w-3.5 h-3.5 mr-1" />
                          Certify Cycle
                        </Button>

                        {!isReady && (
                          <div className="hidden group-hover:block absolute right-0 top-full mt-1.5 z-40 w-72 p-3 bg-gray-900 text-white rounded-xl shadow-xl pointer-events-none">
                            <p className="font-bold text-amber-300 text-xs flex items-center gap-1.5 mb-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {outstanding.length} Criteria Outstanding
                            </p>
                            <p className="text-[11px] text-gray-300 leading-snug mb-2">
                              Institutional certification requires all criteria under this program to be Sufficient.
                            </p>
                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                              {outstanding.slice(0, 4).map((o, idx) => (
                                <div key={idx} className="text-[10px] text-gray-200 truncate">
                                  • <span className="font-mono text-amber-200">[{o.code}]</span> {o.title}
                                </div>
                              ))}
                              {outstanding.length > 4 && (
                                <p className="text-[10px] text-gray-400 italic">
                                  + {outstanding.length - 4} more (click button to view all)
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {canManageCycles && cycle.status !== 'certified' && (
                    <select
                      value={cycle.status}
                      disabled={updatingCycleId === cycle.id}
                      onChange={(e) => handleUpdateCycleStatus(cycle.id, e.target.value as CycleStatus)}
                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}

                  {canManageRecs && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openNewRecModal(cycle.id)}
                      className="text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Opportunity
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* RESOLVE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={resolveConfirmOpen}
        onClose={() => { setResolveConfirmOpen(false); setResolveTargetId(null); }}
        onConfirm={handleResolve}
        title="Update Resolution Status?"
        message="Toggle the status of this opportunity between Resolved and Open."
        confirmLabel="Confirm"
        variant="primary"
        loading={resolving}
      />

      {/* CREATE CYCLE MODAL */}
      <Modal
        isOpen={isCycleModalOpen}
        onClose={() => setIsCycleModalOpen(false)}
        title="Create Accreditation Cycle"
      >
        <form onSubmit={handleSaveCycle} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Academic Program
            </label>
            <select
              value={cycleForm.program_id}
              onChange={(e) => setCycleForm({ ...cycleForm, program_id: e.target.value })}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Select Program --</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Cycle Name
            </label>
            <input
              type="text"
              required
              value={cycleForm.name}
              onChange={(e) => setCycleForm({ ...cycleForm, name: e.target.value })}
              placeholder="e.g. BSCS Level II Re-accreditation (2026-2027)"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Level
              </label>
              <select
                value={cycleForm.target_level}
                onChange={(e) => setCycleForm({ ...cycleForm, target_level: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {levels.length > 0 ? (
                  levels.map((l) => (
                    <option key={l.id} value={l.label}>
                      {l.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Candidate Status">Candidate Status</option>
                    <option value="Level I - Accredited Status">Level I - Accredited Status</option>
                    <option value="Level II - Re-accredited Status">Level II - Re-accredited Status</option>
                    <option value="Level III - Re-accredited Status">Level III - Re-accredited Status</option>
                    <option value="Level IV - Re-accredited Status">Level IV - Re-accredited Status</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Visit Date
              </label>
              <input
                type="date"
                value={cycleForm.target_date}
                onChange={(e) => setCycleForm({ ...cycleForm, target_date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Initial Status
            </label>
            <select
              value={cycleForm.status}
              onChange={(e) => setCycleForm({ ...cycleForm, status: e.target.value as CycleStatus })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="upcoming">Upcoming</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCycleModalOpen(false)}
              disabled={creatingCycle}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creatingCycle}
            >
              Create Cycle
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* FORM 1: CREATE OPPORTUNITY / RECOMMENDATION MODAL                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        title="Add PACUCOA Opportunity & Recommendation"
        size="3xl"
      >
        <form onSubmit={handleSaveRecommendation} className="space-y-6 p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Program
              </label>
              <select
                value={recForm.program_id}
                onChange={(e) => {
                  const pid = e.target.value;
                  const availCycles = cycles.filter(c => c.program_id === pid);
                  setRecForm({
                    ...recForm,
                    program_id: pid,
                    cycle_id: availCycles[0]?.id || '',
                  });
                }}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select Program --</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Accreditation Cycle
              </label>
              <select
                value={recForm.cycle_id}
                onChange={(e) => setRecForm({ ...recForm, cycle_id: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select Cycle --</option>
                {cycles
                  .filter(c => !recForm.program_id || c.program_id === recForm.program_id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Item Number
              </label>
              <input
                type="number"
                min="1"
                required
                value={recForm.item_number}
                onChange={(e) => setRecForm({ ...recForm, item_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Item Number
              </label>
              <input
                type="number"
                min="1"
                required
                value={recForm.item_number}
                onChange={(e) => setRecForm({ ...recForm, item_number: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Accreditation Area
              </label>
              <select
                value={recForm.area_id}
                onChange={(e) => setRecForm({ ...recForm, area_id: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select Area --</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.code}] {a.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              1. Opportunity for Improvement (Identified Gap)
            </label>
            <textarea
              rows={3}
              required
              value={recForm.opportunity_for_improvement}
              onChange={(e) => setRecForm({ ...recForm, opportunity_for_improvement: e.target.value })}
              placeholder="e.g. The College of Information and Communications Technology has not established a formalized periodic review of Program Educational Objectives (PEOs) involving industry partners."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm leading-relaxed text-gray-900 focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              2. PACUCOA Recommendation
            </label>
            <textarea
              rows={3}
              required
              value={recForm.recommendation_text}
              onChange={(e) => setRecForm({ ...recForm, recommendation_text: e.target.value })}
              placeholder="e.g. Convene an Industry Advisory Board annually and institutionalize periodic stakeholder feedback for PEO review and realignment."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm leading-relaxed text-gray-900 focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRecModalOpen(false)}
              disabled={creatingRec}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creatingRec}
              className="!bg-indigo-600 hover:!bg-indigo-700 text-white"
            >
              Save Opportunity & Recommendation
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* FORM 2: ADD COMPLIANCE ACTION TAKEN & TEAM VERIFICATION MODAL              */}
      {/* ========================================================================= */}
      {isActionModalOpen && targetRecForAction && (
        <Modal
          isOpen={isActionModalOpen}
          onClose={() => { setIsActionModalOpen(false); setTargetRecForAction(null); }}
          title={`Add Action Taken — Item ${targetRecForAction.item_number || 1}`}
          size="lg"
        >
          <form onSubmit={handleSaveAction} className="space-y-4">
            {/* Context Summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p className="text-gray-500 font-bold uppercase text-[10px]">Responding To Opportunity:</p>
              <p className="text-gray-900 font-semibold text-xs leading-relaxed">
                {targetRecForAction.opportunity_for_improvement || targetRecForAction.description}
              </p>
              <p className="text-indigo-900 text-[11px] font-medium pt-1">
                <strong>Recommendation:</strong> {targetRecForAction.recommendation_text}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 min-w-0 max-w-full">
              <div className="min-w-0">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Action #
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1.1"
                  value={actionForm.action_number}
                  onChange={(e) => setActionForm({ ...actionForm, action_number: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-3 min-w-0 max-w-full">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Link Uploaded Evidence Document (Optional)
                </label>
                <select
                  value={actionForm.linked_evidence_id}
                  onChange={(e) => setActionForm({ ...actionForm, linked_evidence_id: e.target.value })}
                  className="w-full max-w-full truncate px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- No Linked Document Attached --</option>
                  {evidenceForLinking
                    .filter(e => !targetRecForAction.program_id || e.program_id === targetRecForAction.program_id)
                    .map((ev) => (
                      <option key={ev.id} value={ev.id} title={cleanFileName(ev.file_url)}>
                        [{ev.accreditation_criteria?.code || 'Doc'}] {ev.document_type || 'Evidence'} — {cleanFileName(ev.file_url)} ({ev.effective_date || 'No Date'})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Tie this action directly to a verifiable file stored in the Evidence Repository.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                3. Action Taken Description
              </label>
              <textarea
                rows={3}
                required
                value={actionForm.action_taken}
                onChange={(e) => setActionForm({ ...actionForm, action_taken: e.target.value })}
                placeholder="e.g. Conducted an Industry Advisory Board consultation on October 14, 2025 with regional software development partners to evaluate curriculum alignment with industry demands."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                4. Team Verification (Verifying Evidence Documented)
              </label>
              <textarea
                rows={2}
                required
                value={actionForm.team_verification}
                onChange={(e) => setActionForm({ ...actionForm, team_verification: e.target.value })}
                placeholder="e.g. Minutes of Meeting, IAB Attendance Sheets, and Approved PEO Revision Resolution from the Academic Council."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsActionModalOpen(false); setTargetRecForAction(null); }}
                disabled={creatingAction}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={creatingAction}
                className="!bg-indigo-600 hover:!bg-indigo-700 text-white"
              >
                Save Action Taken & Verification
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* INLINE DOCUMENT PREVIEW MODAL FOR LINKED EVIDENCE                          */}
      {/* ========================================================================= */}
      {previewEvidenceDoc && (
        <Modal
          isOpen={!!previewEvidenceDoc}
          onClose={() => setPreviewEvidenceDoc(null)}
          title={`Document Verification: ${previewEvidenceDoc.document_type || 'Evidence File'}`}
          size="5xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-gray-500">Document Type:</span>{' '}
                <strong className="text-gray-900">{previewEvidenceDoc.document_type || 'Compliance Evidence'}</strong>
              </div>
              <div>
                <span className="text-gray-500">Effective Date:</span>{' '}
                <strong className="text-gray-800">{previewEvidenceDoc.effective_date || 'N/A'}</strong>
              </div>
              <StatusBadge status={previewEvidenceDoc.status} />
            </div>

            <DocumentViewer
              fileUrl={previewEvidenceDoc.file_url}
              documentId={previewEvidenceDoc.id}
              title={previewEvidenceDoc.document_type || 'Evidence Document'}
              height="600px"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => openEvidenceDocument(previewEvidenceDoc)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Open original in new tab
              </button>
              <Button variant="secondary" onClick={() => setPreviewEvidenceDoc(null)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* OUTSTANDING CRITERIA MODAL FOR QA CERTIFICATION */}
      {outstandingModalCycle && (
        <Modal
          isOpen={!!outstandingModalCycle}
          onClose={() => setOutstandingModalCycle(null)}
          title="Outstanding Criteria for Certification"
          size="lg"
        >
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Certification Blocked ({outstandingModalCycle.outstanding.length} Criteria Outstanding)
              </p>
              <p className="text-amber-800 leading-relaxed">
                Institutional certification for <strong>{outstandingModalCycle.cycle.name}</strong> requires 100% compliance across all criteria under <strong>{outstandingModalCycle.cycle.programs?.code}</strong>. The following criteria do not yet have sufficient verified evidence:
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {outstandingModalCycle.outstanding.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50/70 transition-colors">
                  <div className="min-w-0 pr-3">
                    <span className="font-mono font-bold text-gray-900 mr-2">[{item.code}]</span>
                    <span className="text-gray-700">{item.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    item.status === 'weak' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status === 'weak' ? 'Weak Evidence' : 'No Evidence'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setOutstandingModalCycle(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRMATION MODAL TO CERTIFY CYCLE */}
      {certifyingCycle && (
        <Modal
          isOpen={!!certifyingCycle}
          onClose={() => setCertifyingCycle(null)}
          title="Confirm Institutional Certification"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-3">
              <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-1">Institutional Readiness Verified</p>
                <p className="leading-relaxed text-indigo-900">
                  All PACUCOA criteria under <strong>{certifyingCycle.programs?.code}</strong> have met the readiness standard (100% Sufficient).
                </p>
                <p className="mt-2 text-indigo-800 text-[11px]">
                  Certifying this cycle seals institutional preparedness and permanently logs your QA verification in the audit trail.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
              <p><span className="text-gray-500">Cycle:</span> <strong>{certifyingCycle.name}</strong></p>
              <p><span className="text-gray-500">Program:</span> <strong>{certifyingCycle.programs?.code} - {certifyingCycle.programs?.name}</strong></p>
              <p><span className="text-gray-500">Target Level:</span> <strong>{certifyingCycle.target_level}</strong></p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setCertifyingCycle(null)}
                disabled={certifyingLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="!bg-indigo-600 hover:!bg-indigo-700 text-white font-semibold"
                loading={certifyingLoading}
                onClick={handleCertifyCycle}
              >
                <Award className="w-4 h-4 mr-1.5" />
                Certify Cycle
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ATTACH / CHANGE EVIDENCE FILE TO COMPLIANCE ACTION               */}
      {/* ========================================================================= */}
      {isAttachFileModalOpen && targetActionForFile && (
        <Modal
          isOpen={isAttachFileModalOpen}
          onClose={() => { setIsAttachFileModalOpen(false); setTargetActionForFile(null); }}
          title={`Attach Evidence File — Action ${targetActionForFile.action.action_number}`}
          size="2xl"
        >
          <div className="space-y-4">
            {/* Context Summary */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-primary">
                  {targetActionForFile.rec.accreditation_areas?.code} • Opportunity #{targetActionForFile.rec.item_number}
                </span>
                <span className="text-gray-500 font-medium">Action {targetActionForFile.action.action_number}</span>
              </div>
              <p className="text-gray-900 font-semibold line-clamp-2">
                {targetActionForFile.action.action_taken}
              </p>
              <p className="text-indigo-900 text-[11px] font-medium pt-1">
                <strong>Verifying Evidence:</strong> {targetActionForFile.action.team_verification}
              </p>
            </div>

            {/* Currently Attached Indicator */}
            {targetActionForFile.action.evidence_documents && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-emerald-900 font-bold block truncate">
                      Currently Attached: {cleanFileName(targetActionForFile.action.evidence_documents.file_url)}
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      {targetActionForFile.action.evidence_documents.document_type || 'Verified Exhibit'}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAttachEvidence(null)}
                  disabled={attachingFile}
                  className="!text-[11px] !py-0.5 !px-2 text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Detach File
                </Button>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search file name, exhibit title, criterion (e.g. Dean, PEO, Tour)..."
                  value={evidenceSearchTerm}
                  onChange={(e) => setEvidenceSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-primary text-gray-900"
                />
              </div>

              <select
                value={evidenceAreaFilter}
                onChange={(e) => setEvidenceAreaFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-900 bg-white"
              >
                <option value="all">All Areas ({evidenceForLinking.length})</option>
                {areas.map((a) => {
                  const cnt = evidenceForLinking.filter(e => e.accreditation_criteria?.area_id === a.id).length;
                  return (
                    <option key={a.id} value={a.id}>
                      {a.code} ({cnt} files)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Document Picker List */}
            <div className="border border-gray-200 rounded-xl max-h-72 overflow-y-auto divide-y divide-gray-100 bg-white">
              {(() => {
                const q = evidenceSearchTerm.toLowerCase().trim();
                const filteredDocs = evidenceForLinking.filter((e) => {
                  if (evidenceAreaFilter !== 'all' && e.accreditation_criteria?.area_id !== evidenceAreaFilter) {
                    return false;
                  }
                  if (!q) return true;
                  const fn = decodeURIComponent(e.file_url || '').toLowerCase();
                  const dt = (e.document_type || '').toLowerCase();
                  const cc = (e.accreditation_criteria?.code || '').toLowerCase();
                  const ct = (e.accreditation_criteria?.title || '').toLowerCase();
                  return fn.includes(q) || dt.includes(q) || cc.includes(q) || ct.includes(q);
                });

                if (filteredDocs.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-gray-400 italic">
                      No evidence documents match your search criteria.
                    </div>
                  );
                }

                return filteredDocs.map((ev) => {
                  const isSelected = selectedEvidenceIdToAttach === ev.id;
                  const isVideo = isStreamOrVideo(ev.file_url);
                  const isPdf = ev.file_url.toLowerCase().endsWith('.pdf');

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvidenceIdToAttach(ev.id)}
                      className={`p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/5 border-l-4 border-primary text-gray-900'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isVideo ? (
                          <span className="p-1.5 rounded bg-purple-100 text-purple-700 shrink-0">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </span>
                        ) : isPdf ? (
                          <span className="p-1.5 rounded bg-red-100 text-red-700 shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1.5 rounded bg-blue-100 text-blue-700 shrink-0">
                            <Paperclip className="w-3.5 h-3.5" />
                          </span>
                        )}

                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${isSelected ? 'text-primary' : 'text-gray-900'}`} title={cleanFileName(ev.file_url)}>
                            {cleanFileName(ev.file_url)}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                            <span className="font-mono font-bold text-gray-600">[{ev.accreditation_criteria?.code || 'Doc'}]</span>
                            <span>•</span>
                            <span className="truncate">{ev.document_type || 'Evidence'}</span>
                            {ev.effective_date && (
                              <>
                                <span>•</span>
                                <span>{ev.effective_date}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvidenceIdToAttach(ev.id);
                            }}
                            className="!text-[10px] !py-0.5 !px-2"
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsAttachFileModalOpen(false); setTargetActionForFile(null); }}
                disabled={attachingFile}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                disabled={!selectedEvidenceIdToAttach || selectedEvidenceIdToAttach === targetActionForFile.action.linked_evidence_id}
                loading={attachingFile}
                onClick={() => handleAttachEvidence(selectedEvidenceIdToAttach)}
                className="!bg-primary text-white"
              >
                <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                Attach Selected Evidence File
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
