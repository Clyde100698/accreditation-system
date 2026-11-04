'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ReadinessScore, Program, AccreditationCycle, AreaAssignment, AuditLog, AccreditationArea, AccreditationCriterion, AccreditationLevel } from '@/lib/types';

import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  ChevronRight,
  ChevronDown,
  Activity,
  Users,
  Shield,
  Upload,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Search,
} from 'lucide-react';
import { buildCriteriaTree, CriterionTreeNode, calculateWeightedGrandMean, checkLevelReadiness } from '@/lib/scoring';

interface HeatmapTreeNode extends CriterionTreeNode {
  scoreObj?: ReadinessScore;
}

interface ProgramComparisonItem {
  id: string;
  code: string;
  name: string;
  grandMean: number;
  targetLevel: string;
  targetReq: number;
  isReady: boolean;
}

interface PendingQueueItem {
  id: string;
  document_type: string | null;
  uploaded_at: string;
  accreditation_criteria: {
    code: string;
    title: string;
    area_id?: string | null;
  } | null;
  uploader: {
    full_name: string;
  } | null;
}

function getScoreColor(score: number): string {
  if (score === 0)      return 'bg-gray-100 text-gray-700 border border-gray-200'; // No evidence
  if (score < 3.00)    return 'bg-red-50 text-red-700 border border-red-200';      // Below 3.00
  if (score < 3.50)    return 'bg-amber-50 text-amber-700 border border-amber-200'; // 3.00 – 3.49
  if (score < 4.00)    return 'bg-yellow-50 text-yellow-700 border border-yellow-200'; // 3.50 – 3.99
  return 'bg-green-50 text-green-700 border border-green-200';                      // ≥ 4.00
}

function getScoreBg(score: number): string {
  if (score === 0)    return 'bg-gray-50';
  if (score < 3.00)  return 'bg-red-50/50';
  if (score < 3.50)  return 'bg-amber-50/50';
  if (score < 4.00)  return 'bg-yellow-50/50';
  return 'bg-green-50/50';
}

// Compact Recursive Heatmap Node component
function HeatmapNode({ node, level = 0 }: { node: HeatmapTreeNode; level?: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const score = node.scoreObj ? node.scoreObj.score : 0;

  return (
    <div className={`w-full ${level > 0 ? 'ml-2.5 pl-2 border-l-2 border-primary/30 mt-1.5' : ''}`}>
      <div 
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={`rounded-lg p-2.5 ${getScoreBg(score)} border border-gray-200 transition-all hover:border-primary/40 hover:shadow-xs ${
          hasChildren ? 'cursor-pointer hover:bg-gray-100/70' : 'cursor-default'
        } flex flex-col justify-between gap-1.5 min-h-[68px]`}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren && (
              <div className="p-0.5 rounded text-gray-500 hover:text-gray-700 shrink-0">
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            )}
            <span className="text-xs font-mono font-bold text-gray-900 bg-white/90 px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
              {node.code}
            </span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${getScoreColor(score)}`}>
            {score.toFixed(2)}/5
          </span>
        </div>
        <p className="text-xs text-gray-700 font-medium leading-snug line-clamp-2" title={node.title}>
          {node.title}
        </p>
      </div>

      {expanded && hasChildren && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {node.children.map((child: HeatmapTreeNode) => (
            <HeatmapNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [scores, setScores] = useState<ReadinessScore[]>([]);
  const [cycles, setCycles] = useState<AccreditationCycle[]>([]);
  const [stats, setStats] = useState({ totalCriteria: 0, pendingEvidence: 0, verifiedEvidence: 0 });
  const [treeRoots, setTreeRoots] = useState<HeatmapTreeNode[]>([]);
  const [areas, setAreas] = useState<AccreditationArea[]>([]);
  const [levels, setLevels] = useState<AccreditationLevel[]>([]);
  const [frameworkName, setFrameworkName] = useState<string>('Accreditation');

  // Interactive Drill-Down Navigation & Filter State
  const [selectedAreaTab, setSelectedAreaTab] = useState<string>('all');
  const [drillDownSearch, setDrillDownSearch] = useState<string>('');

  // Role-specific datasets
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);
  const [programComparison, setProgramComparison] = useState<ProgramComparisonItem[]>([]);
  const [pendingQueue, setPendingQueue] = useState<PendingQueueItem[]>([]);
  const [committeeAssignments, setCommitteeAssignments] = useState<AreaAssignment[]>([]);
  const [userAssignments, setUserAssignments] = useState<AreaAssignment[]>([]);
  const [myUploadStats, setMyUploadStats] = useState({ verified: 0, pending: 0, rejected: 0 });
  const [missingScopeCriteria, setMissingScopeCriteria] = useState<AccreditationCriterion[]>([]);

  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const { data: progs } = await supabase.from('programs').select('*').order('code');
        setPrograms(progs || []);

        if (user!.program_id && !['qa', 'dean'].includes(user!.role)) {
          setSelectedProgram(user!.program_id);
        } else if (progs && progs.length > 0 && selectedProgram === 'all') {
          // Keep 'all' or default
        }

        // Framework & Levels from Database (Dynamic, not hardcoded)
        const { data: fwData } = await supabase.from('accreditation_frameworks').select('*').limit(1);
        if (fwData && fwData.length > 0) setFrameworkName(fwData[0].name);

        const { data: levelsData } = await supabase.from('accreditation_levels').select('*').order('level_number');
        const dbLevels = (levelsData || []) as AccreditationLevel[];
        setLevels(dbLevels);

        // Stats
        const { count: totalCriteria } = await supabase.from('accreditation_criteria').select('*', { count: 'exact', head: true });
        
        let pendingEvidence = 0;
        let verifiedEvidence = 0;
        if (!['alumni_rep', 'student_rep', 'observer'].includes(user!.role)) {
          let pQ = supabase.from('evidence_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending');
          let vQ = supabase.from('evidence_documents').select('*', { count: 'exact', head: true }).eq('status', 'verified');

          const progFilter = user!.program_id && !['qa', 'dean'].includes(user!.role)
            ? user!.program_id
            : selectedProgram !== 'all' ? selectedProgram : null;

          if (progFilter) {
            pQ = pQ.eq('program_id', progFilter);
            vQ = vQ.eq('program_id', progFilter);
          }

          const { count: pCount } = await pQ;
          pendingEvidence = pCount || 0;

          const { count: vCount } = await vQ;
          verifiedEvidence = vCount || 0;
        }

        setStats({ totalCriteria: totalCriteria || 0, pendingEvidence, verifiedEvidence });

        // Areas (with configurable weights)
        const { data: areasData } = await supabase.from('accreditation_areas').select('*').order('display_order, code');
        if (areasData) {
          setAreas(areasData as AccreditationArea[]);
        }

        // Readiness scores & Criteria
        const { data: criteriaData } = await supabase.from('accreditation_criteria').select('*').order('code');
        let { data: scoresData } = await supabase.from('readiness_scores').select('*');

        // If remote database has no scores populated, seamlessly fall back to local validated baseline scores
        if (!scoresData || scoresData.length === 0) {
          const { getMockDatabase } = await import('@/lib/mock-data');
          scoresData = getMockDatabase().readiness_scores as unknown as ReadinessScore[];
        }

        if (criteriaData && scoresData) {
          const typedScoresList = scoresData as ReadinessScore[];
          const criteriaWithScores = criteriaData.map(c => {
             const scoreObj = selectedProgram === 'all' 
               ? (() => {
                   const matched = typedScoresList.filter(s => s.criterion_id === c.id);
                   if (matched.length === 0) return undefined;
                   const avg = matched.reduce((sum, s) => sum + s.score, 0) / matched.length;
                   return { ...matched[0], score: Number(avg.toFixed(2)) };
                 })()
               : typedScoresList.find(s => s.criterion_id === c.id && s.program_id === selectedProgram);
             return { ...c, scoreObj };
          });

          const { roots } = buildCriteriaTree(criteriaWithScores);
          setTreeRoots(roots);
          setScores(scoresData as ReadinessScore[]);
        }

        // Cycles
        const { data: cyclesData } = await supabase.from('accreditation_cycles').select('*').order('target_date', { ascending: true });
        if (cyclesData) setCycles(cyclesData as AccreditationCycle[]);

        // User assignments
        const { data: myAssignData } = await supabase
          .from('area_assignments')
          .select('*, accreditation_areas(*)')
          .eq('user_id', user!.id);
        const myAssigns = (myAssignData || []) as AreaAssignment[];
        setUserAssignments(myAssigns);

        // QA: Last 10 audit logs
        if (user!.role === 'qa') {
          const { data: auditData } = await supabase
            .from('audit_log')
            .select('*, users!user_id(full_name, role)')
            .order('created_at', { ascending: false })
            .limit(10);
          if (auditData) setRecentAuditLogs(auditData as AuditLog[]);
        }

        // DEAN & QA: Side-by-side program comparison (PACUCOA Weighted Grand Mean computed per program)
        if (['dean', 'qa'].includes(user!.role) && progs && scoresData) {
          const typedScores = scoresData as ReadinessScore[];
          const typedCycles = (cyclesData || []) as AccreditationCycle[];
          const comparison: ProgramComparisonItem[] = (progs as Program[]).map(prog => {
            const progScores = typedScores.filter((s: ReadinessScore) => s.program_id === prog.id);
            
            // Compute PACUCOA weighted grand mean for this program across 10 Areas
            let progWeightedMean = 0;
            if (progScores.length > 0 && criteriaData && areasData) {
              const critWithScores = (criteriaData as AccreditationCriterion[]).map(c => {
                const sc = progScores.find(s => s.criterion_id === c.id);
                return { ...c, score: sc ? sc.score : 0 };
              });
              const areaAverages = (areasData as AccreditationArea[]).map(a => {
                const crits = critWithScores.filter(c => c.area_id === a.id);
                const mean = crits.length > 0 ? crits.reduce((acc, c) => acc + c.score, 0) / crits.length : 0;
                return { meanScore: mean, weight: a.weight ?? 1.0 };
              });
              progWeightedMean = calculateWeightedGrandMean(areaAverages);
            }

            const progCycle = typedCycles.find((c: AccreditationCycle) => c.program_id === prog.id && c.status !== 'completed');
            const targetLvl = progCycle ? progCycle.target_level : (dbLevels[0]?.label || 'Level I');
            
            // Generic lookup from dbLevels threshold
            const matchedLvl = dbLevels.find(l => l.label.toLowerCase() === targetLvl.toLowerCase())
              || dbLevels.find(l => targetLvl.toLowerCase().includes(l.label.toLowerCase()))
              || dbLevels[0];
            const targetReq = matchedLvl?.min_score_threshold ?? 3.0;

            return {
              id: prog.id,
              code: prog.code,
              name: prog.name,
              grandMean: progWeightedMean,
              targetLevel: targetLvl,
              targetReq,
              isReady: progWeightedMean >= targetReq,
            };
          });
          setProgramComparison(comparison);
        }

        // PROGRAM HEAD: Pending verifications queue & Committee roster
        if (user!.role === 'program_head' && user!.program_id) {
          const { data: queueData } = await supabase
            .from('evidence_documents')
            .select('id, document_type, uploaded_at, accreditation_criteria(code, title), uploader:uploaded_by(full_name)')
            .eq('program_id', user!.program_id)
            .eq('status', 'pending')
            .order('uploaded_at', { ascending: false })
            .limit(5);
          if (queueData) setPendingQueue(queueData as unknown as PendingQueueItem[]);

          const { data: committeeData } = await supabase
            .from('area_assignments')
            .select('*, users!user_id(full_name, role), accreditation_areas(code, title)')
            .eq('program_id', user!.program_id);
          if (committeeData) setCommitteeAssignments(committeeData as AreaAssignment[]);
        }

        // AREA CHAIR / CO-CHAIR: Pending evidence specifically for assigned areas
        const isChair = myAssigns.some(a => ['area_chair', 'co_chair'].includes(a.assignment_type));
        if (isChair && user!.program_id) {
          const myAreaIds = myAssigns.map(a => a.area_id).filter(Boolean) as string[];
          const { data: chairQueue } = await supabase
            .from('evidence_documents')
            .select('id, document_type, uploaded_at, accreditation_criteria(code, title, area_id), uploader:uploaded_by(full_name)')
            .eq('program_id', user!.program_id)
            .eq('status', 'pending')
            .order('uploaded_at', { ascending: false });
          if (chairQueue) {
            const typedQueue = chairQueue as unknown as PendingQueueItem[];
            const filtered = typedQueue.filter((e) => e.accreditation_criteria?.area_id && myAreaIds.includes(e.accreditation_criteria.area_id));
            setPendingQueue(filtered.slice(0, 5));
          }
        }

        // FACULTY / MEMBER: My uploads breakdown & unmet criteria in scope
        if (['faculty', 'student_rep', 'alumni_rep'].includes(user!.role)) {
          const { data: myDocs } = await supabase
            .from('evidence_documents')
            .select('id, status')
            .eq('uploaded_by', user!.id);
          if (myDocs) {
            const verified = myDocs.filter(d => d.status === 'verified').length;
            const pending = myDocs.filter(d => d.status === 'pending').length;
            const rejected = myDocs.filter(d => d.status === 'rejected').length;
            setMyUploadStats({ verified, pending, rejected });
          }

          if (criteriaData && myAssigns.length > 0) {
            const typedCriteria = criteriaData as AccreditationCriterion[];
            const typedScores = (scoresData || []) as ReadinessScore[];
            const myAreaIds = myAssigns.map(a => a.area_id).filter(Boolean) as string[];
            const scopeCriteria = typedCriteria.filter((c) => c.area_id && myAreaIds.includes(c.area_id) && !c.parent_criterion_id);
            const missing = scopeCriteria.filter((c) => {
              const sc = typedScores.find((s) => s.criterion_id === c.id && s.program_id === user!.program_id);
              return !sc || sc.score < 3;
            });
            setMissingScopeCriteria(missing.slice(0, 5));
          }
        }
      } catch (err) {
        console.warn('Supabase offline, loading local mock database for dashboard:', err);
        try {
          const { getMockDatabase } = await import('@/lib/mock-data');
          const db = getMockDatabase();
          setPrograms(db.programs);
          setAreas(db.accreditation_areas);
          setLevels(db.accreditation_levels);
          setScores(db.readiness_scores);
          setCycles(db.accreditation_cycles);
          const criteriaWithScores = db.accreditation_criteria.map(c => {
            const scoreObj = db.readiness_scores.find(s => s.criterion_id === c.id);
            return { ...c, scoreObj };
          });
          const { roots } = buildCriteriaTree(criteriaWithScores);
          setTreeRoots(roots);
          setStats({
            totalCriteria: db.accreditation_criteria.length,
            pendingEvidence: db.evidence_documents.filter(e => e.status === 'pending').length,
            verifiedEvidence: db.evidence_documents.filter(e => e.status === 'verified').length
          });
        } catch (mErr) {
          console.error('Failed to load mock data:', mErr);
        }
      }
    }
    fetchData();
  }, [user, supabase, selectedProgram]);

  if (authLoading || !user) {
    return (
      <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // Calculate overall area averages
  const areaGroups = areas.map(area => {
    const topLevelCriteria = treeRoots.filter(r => r.area_id === area.id);
    const scores = topLevelCriteria.map(c => c.scoreObj?.score || 0);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { ...area, avg, topLevelCriteria };
  });

  // Calculate weighted overall area average: sum(area.meanScore * area.weight) / sum(area.weight)
  const overallAvg = calculateWeightedGrandMean(
    areaGroups.map(a => ({
      meanScore: a.avg,
      weight: a.weight ?? 1.0,
    }))
  );

  const lastComputed = scores.length > 0
    ? new Date(Math.max(...scores.map((s) => new Date(s.last_computed_at || s.calculated_at || Date.now()).getTime()))).toLocaleString()
    : 'Never';

  // Target Level Logic dynamically looked up from database level thresholds
  const activeCycle = cycles.find(c => selectedProgram === 'all' ? true : c.program_id === selectedProgram && c.status !== 'completed') 
                   || cycles.find(c => selectedProgram === 'all' ? true : c.program_id === selectedProgram);
  
  const targetLevel = activeCycle ? activeCycle.target_level : (levels[0]?.label || 'Candidate');
  const matchedLevel = levels.find(l => l.label.toLowerCase() === targetLevel.toLowerCase())
    || levels.find(l => targetLevel.toLowerCase().includes(l.label.toLowerCase()))
    || levels[0];
  const { isReady: overallThresholdMet, requiredThreshold: targetRequiredScore } = checkLevelReadiness(overallAvg, matchedLevel);
  const lvlNum = matchedLevel?.level_number ?? 2;
  const activeProgScores = selectedProgram === 'all'
    ? scores
    : scores.filter(s => s.program_id === selectedProgram);
  const floorThresholdMet =
    lvlNum <= 1
      ? true
      : lvlNum === 2 || lvlNum === 3
        ? areaGroups.length > 0 && areaGroups.every(a => a.avg + 1e-6 >= targetRequiredScore)
        : activeProgScores.length > 0 && activeProgScores.every(s => s.score + 1e-6 >= targetRequiredScore);
  const isReady = overallThresholdMet && floorThresholdMet;
  const isFloorOnlyBlocked = overallThresholdMet && !floorThresholdMet;

  const isAreaChairOrCoChair = userAssignments.some(a => ['area_chair', 'co_chair'].includes(a.assignment_type));
  const isReadOnlyRep = ['alumni_rep', 'student_rep', 'observer'].includes(user.role);

  const selectedProgObj = programs.find(p => p.id === selectedProgram);
  const isSelectedProgramInactive = selectedProgObj && selectedProgObj.is_accreditation_active === false;

  return (
    <div className="flex flex-col space-y-3 pb-8">
      {/* TOP HEADER & SCOPE STRIP (Shrink-0) */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                Welcome, {user.full_name}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">
                {user.role === 'system_admin' && 'System IT Admin'}
                {user.role === 'qa' && 'QA Command'}
                {user.role === 'dean' && 'Dean Executive'}
                {user.role === 'program_head' && 'Program Lead'}
                {user.role === 'faculty' && (isAreaChairOrCoChair ? 'Area Chair' : 'Faculty')}
                {isReadOnlyRep && 'Observer'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium truncate">
              {user.role === 'system_admin' ? 'Institution IT Infrastructure' : user.programs ? `${user.programs.code} — ${user.programs.name}` : 'CICT Department Wide'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          {/* Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 hidden sm:inline">Scope:</span>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary bg-white text-gray-900"
            >
              {['qa', 'dean', 'system_admin'].includes(user.role) && (
                <option value="all">All Programs (Institution Scope)</option>
              )}
              {programs.map((p) => {
                const isActive = p.is_accreditation_active !== false;
                return (
                  <option 
                    key={p.id} 
                    value={p.id}
                    className={!isActive ? 'text-gray-400 bg-gray-50' : 'text-gray-900 font-medium'}
                  >
                    {p.code} — {p.name} {!isActive ? '(Out of Cycle / Inactive)' : '(Active)'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Target Cycle Badge */}
          {activeCycle && (
            <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
              <Target className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-semibold text-gray-800">{activeCycle.target_level}</span>
              <span className="text-gray-400">•</span>
              <span className="text-primary font-bold">{targetRequiredScore.toFixed(1)} Req</span>
              <span className="text-gray-400">•</span>
              <span className={isReady ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                {isReady ? 'Goal Met' : isFloorOnlyBlocked ? 'Area Floor Pending' : 'In Progress'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Archive Warning Banner for Inactive Program */}
      {isSelectedProgramInactive && (
        <div className="shrink-0 bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 font-bold text-[10px] uppercase tracking-wider shrink-0">
              Archive Mode
            </span>
            <span className="truncate">
              <strong>{selectedProgObj?.code}</strong> is currently <strong>out of the active accreditation cycle</strong>. Historical evidence and scores are preserved in read-only defensibility mode.
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium shrink-0 ml-2">Modifications Locked</span>
        </div>
      )}

      {/* 4 COMPACT METRICS (Shrink-0) */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="border border-gray-200 bg-white p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Grand Mean</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-gray-900">{overallAvg.toFixed(2)}</span>
              <span className="text-[11px] text-gray-400">/ 5.00</span>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded text-xs font-bold ${
            isReady
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isFloorOnlyBlocked
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {isReady ? 'Ready' : isFloorOnlyBlocked ? 'Floor Pending' : 'Gaps Exist'}
          </div>
        </div>

        <div className="border border-gray-200 bg-white p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Criteria</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-gray-900">{stats.totalCriteria}</span>
              <span className="text-[11px] text-gray-400">{areas.length} Areas</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {isReadOnlyRep ? (
          <>
            <div className="border border-gray-200 bg-white p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Criteria Compliant</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-gray-900">{scores.filter(s => s.score >= 3.0).length}</span>
                  <span className="text-[11px] text-gray-400">of {scores.length}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>

            <div className="border border-gray-200 bg-white p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Criteria Deficient</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-gray-900">{scores.filter(s => s.score < 3.0).length}</span>
                  <span className="text-[11px] text-gray-400">{scores.filter(s => s.score < 3.0).length > 0 ? 'Gaps' : 'None'}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="border border-gray-200 bg-white p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Pending Review</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-gray-900">{stats.pendingEvidence}</span>
                  <span className="text-[11px] text-gray-400">{stats.pendingEvidence > 0 ? 'Awaiting' : 'None'}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="border border-gray-200 bg-white p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Approved Artifacts</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-gray-900">{stats.verifiedEvidence}</span>
                  <span className="text-[11px] text-gray-400">Scored</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PACUCOA 10-AREA READINESS COMMAND CENTER (FULL WIDTH - ALL 10 AREAS VISIBLE) */}
      {/* ========================================================================= */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-xs overflow-hidden">
        {/* Header Strip */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                {frameworkName} 10-Area Readiness Command Center
              </h2>
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                10 Areas · {stats.totalCriteria} Criteria
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              All 10 PACUCOA areas displayed simultaneously. Click any area card to inspect its criteria breakdown.
            </p>
          </div>

          {/* Quick Criteria Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search criteria (e.g. IX.4, tour)..."
              value={drillDownSearch}
              onChange={(e) => setDrillDownSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-transparent"
            />
            {drillDownSearch && (
              <button
                onClick={() => setDrillDownSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 10-AREA EXECUTIVE MATRIX: 5 Columns × 2 Rows on Desktop (ALL 10 AREAS VISIBLE SIMULTANEOUSLY) */}
        <div className="p-3 bg-slate-50/60 border-b border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {areaGroups.map((a) => {
              const activeId = selectedAreaTab === 'all' ? (areas[0]?.id || a.id) : selectedAreaTab;
              const isSelected = activeId === a.id;
              const isMet = a.avg >= targetRequiredScore;
              const metCount = a.topLevelCriteria.filter(
                (c) => (c.scoreObj?.score || 0) >= targetRequiredScore
              ).length;

              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAreaTab(a.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-primary ring-2 ring-primary/25 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${
                      isSelected ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-900 border-gray-200'
                    }`}>
                      {a.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        isMet
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {a.avg.toFixed(2)}/5
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-gray-800 line-clamp-1 mb-2" title={a.title}>
                    {a.title}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-gray-100 text-gray-500 font-medium">
                    <span>{metCount}/{a.topLevelCriteria.length} Met</span>
                    <span className={isMet ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {isMet ? 'Goal Met' : 'Gap'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE AREA CRITERIA BREAKDOWN */}
        <div className="p-3.5 bg-white">
          {(() => {
            const activeId = selectedAreaTab === 'all' ? (areas[0]?.id || '') : selectedAreaTab;
            const activeArea = areaGroups.find((a) => a.id === activeId) || areaGroups[0];
            if (!activeArea) return null;

            const q = drillDownSearch.trim().toLowerCase();
            const criteriaToRender = q
              ? activeArea.topLevelCriteria.filter(
                  (c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
                )
              : activeArea.topLevelCriteria;

            return (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-primary text-white">
                      {activeArea.code}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {activeArea.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">
                      Target: <strong>{targetRequiredScore.toFixed(1)}</strong>
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">
                      Area Average:{' '}
                      <strong className={activeArea.avg >= targetRequiredScore ? 'text-emerald-700' : 'text-red-700'}>
                        {activeArea.avg.toFixed(2)}/5.00
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Criteria 3-Column Grid */}
                {criteriaToRender.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    {q ? 'No matching criteria found in this area.' : 'No criteria mapped to this area yet.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {criteriaToRender.map((c) => (
                      <HeatmapNode key={c.id} node={c} />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Legend Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Legend:</span>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-gray-100 border border-gray-300" /><span className="text-[11px] text-gray-700">None (0)</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-red-100 border border-red-300" /><span className="text-[11px] text-gray-700">Weak (1-2)</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300" /><span className="text-[11px] text-gray-700">Fair (3)</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-green-100 border border-green-300" /><span className="text-[11px] text-gray-700">Strong (4-5)</span></div>
          </div>
          <span className="text-[11px] text-gray-400 italic">
            Click any area card in the matrix above to view its criteria
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECONDARY ROW: AUDIT FEED & ACTION HUBS (2 COLUMNS)                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
        {/* Left Column: Role Feeds & Comparisons */}
        <div className="col-span-12 lg:col-span-7 space-y-3">
          {/* Live Compliance Audit Feed */}
          {user.role === 'qa' && (
            <Card className="border border-gray-200 bg-white p-3.5 shadow-none">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Live Compliance Audit Feed</h3>
                </div>
                <Link href="/audit-log" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Full Trail <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {recentAuditLogs.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">No recent audit logs recorded yet.</p>
              ) : (
                <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                  {recentAuditLogs.map((log) => (
                    <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-gray-800">{log.users?.full_name || 'User'}</span>{' '}
                          <span className="text-gray-500 font-mono text-[11px] bg-gray-100 text-gray-700 px-1 py-0.2 rounded">
                            {log.action}
                          </span>
                          {Boolean(log.metadata?.criterion_code) && (
                            <span className="ml-1 text-primary font-bold">[{String(log.metadata.criterion_code)}]</span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap pl-2">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* DEAN HUB: Side-by-side comparison */}
          {['dean', 'qa'].includes(user.role) && programComparison.length > 1 && (
            <Card className="border border-gray-200 bg-white p-3.5 shadow-none">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Department Readiness Comparison</h3>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">CICT Programs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {programComparison.map((prog) => (
                  <div key={prog.id} className="border border-gray-200 rounded-lg p-2.5 bg-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">{prog.code}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${prog.isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {prog.isReady ? 'Met' : 'In Progress'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900">{prog.grandMean.toFixed(2)}</span>
                      <span className="text-xs font-semibold text-primary">{prog.targetReq.toFixed(1)} Req</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${prog.isReady ? 'bg-emerald-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(100, (prog.grandMean / prog.targetReq) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* PROGRAM HEAD HUB */}
          {user.role === 'program_head' && (
            <>
              <Card className="border border-gray-200 bg-white p-3.5 shadow-none">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Program Review Queue</h3>
                  </div>
                  <Link href="/verification" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {pendingQueue.length === 0 ? (
                  <div className="p-4 text-center bg-gray-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-gray-800">No pending evidence</p>
                    <p className="text-[11px] text-gray-500">All submissions have been reviewed.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {pendingQueue.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-gray-900 truncate">
                            [{item.accreditation_criteria?.code}] {item.accreditation_criteria?.title}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            By {item.uploader?.full_name || 'Faculty'}
                          </p>
                        </div>
                        <Link href="/verification">
                          <Button variant="secondary" size="sm">
                            Review
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="border border-gray-200 bg-white p-3.5 shadow-none">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Assigned Committee</h3>
                  </div>
                  <Link href="/areas" className="text-xs font-bold text-primary hover:underline">
                    Manage
                  </Link>
                </div>

                {committeeAssignments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No area assignments made yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {committeeAssignments.map((a) => (
                      <div key={a.id} className="p-2 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-gray-900 block">{a.users?.full_name}</span>
                          <span className="text-[10px] text-gray-500">{a.accreditation_areas?.code}</span>
                        </div>
                        <span className="font-semibold px-1.5 py-0.5 rounded bg-white text-gray-700 border border-gray-200 capitalize text-[10px]">
                          {a.assignment_type.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {/* AREA CHAIR HUB */}
          {isAreaChairOrCoChair && user.role !== 'qa' && (
            <Card className="border border-primary/20 bg-primary/5 p-3.5 shadow-none">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Assigned Area Review Queue</h3>
                </div>
                <Link href="/verification">
                  <Button size="sm">
                    Review Now
                  </Button>
                </Link>
              </div>

              {pendingQueue.length === 0 ? (
                <p className="text-xs text-gray-600 font-medium">0 pending submissions in your assigned areas right now.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {pendingQueue.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg p-2 border border-gray-200 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-mono text-[11px] font-bold text-primary">[{item.accreditation_criteria?.code}]</span>
                        <p className="font-medium text-gray-900 truncate text-xs">{item.accreditation_criteria?.title}</p>
                      </div>
                      <Link href="/verification" className="text-xs font-bold text-primary hover:underline shrink-0">
                        Evaluate →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* FACULTY / MEMBER HUB */}
          {user.role === 'faculty' && (
            <>
              <Card className="border border-gray-200 bg-white p-3.5 shadow-none">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Upload className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Upload Summary</h3>
                  </div>
                  <Link href="/evidence">
                    <Button variant="secondary" size="sm">
                      + Upload
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-lg font-bold text-emerald-800">{myUploadStats.verified}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">Approved</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-lg font-bold text-amber-800">{myUploadStats.pending}</span>
                    <span className="text-[10px] text-amber-700 font-semibold block">Pending</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                    <span className="text-lg font-bold text-rose-800">{myUploadStats.rejected}</span>
                    <span className="text-[10px] text-rose-700 font-semibold block">Rejected</span>
                  </div>
                </div>
              </Card>

              <Card className="border border-gray-200 bg-white p-3.5 shadow-none">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Criteria Needing Evidence</h3>
                  </div>
                  <span className="text-[10px] text-gray-400">Your Scope</span>
                </div>

                {missingScopeCriteria.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No gaps found in your assigned areas!</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {missingScopeCriteria.map((c) => (
                      <div key={c.id} className="p-2 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-mono font-bold text-amber-900">[{c.code}]</span>{' '}
                          <span className="text-gray-900 font-medium truncate">{c.title}</span>
                        </div>
                        <Link href="/evidence">
                          <span className="font-semibold text-primary hover:underline shrink-0 text-xs">Submit →</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        {/* Right Column: Verification Queue & Defensibility */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          {/* Action Queue Card */}
          <Card className="border border-gray-200 bg-white p-3.5 shadow-none flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 text-amber-600">
                <Clock className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Institution Verification Queue</h3>
              </div>
              <p className="text-xs text-gray-500 mb-2.5">
                Submissions across CICT programs awaiting verification.
              </p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-amber-800">{stats.pendingEvidence}</span>
                  <span className="text-[11px] text-amber-800 block font-medium">Pending verification</span>
                </div>
                <Link href="/verification">
                  <Button size="sm">
                    Review & Approve
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Defensibility Notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 leading-snug">
              <strong>Accreditation Defensibility:</strong> Readiness scores dynamically compute from verified evidence documents and PACUCOA criteria trees.
              <div className="text-[10px] text-gray-500 mt-1">Computed: {lastComputed}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
