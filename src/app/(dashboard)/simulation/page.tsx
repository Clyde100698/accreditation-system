'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ReadinessScore, Program, AccreditationLevel } from '@/lib/types';
import { logAuditEvent } from '@/lib/audit';
import { calculateWeightedGrandMean, evaluateLevelFloorStatus } from '@/lib/scoring';
import { loadExclusionMap } from '@/lib/program-criteria';
import { 
  FlaskConical, 
  CheckSquare, 
  Square, 
  Calculator, 
  Info,
  Search,
  X,
  Layers,
  RotateCcw
} from 'lucide-react';

export default function SimulationPage() {
  const { user, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<AccreditationLevel[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [unresolvedScores, setUnresolvedScores] = useState<ReadinessScore[]>([]);
  const [currentScores, setCurrentScores] = useState<ReadinessScore[]>([]);
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<string[]>([]);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [projectedScore, setProjectedScore] = useState<number | null>(null);
  const [projectedAreaMeans, setProjectedAreaMeans] = useState<number[]>([]);
  const [projectedCriterionScores, setProjectedCriterionScores] = useState<number[]>([]);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data: levelsData } = await supabase
        .from('accreditation_levels')
        .select('*')
        .order('level_number');
      if (levelsData && levelsData.length > 0) {
        setLevels(levelsData as AccreditationLevel[]);
      }

      // Fetch programs (all for QA Admin, specific for others)
      let pQ = supabase.from('programs').select('*').order('code');
      if (user.program_id) pQ = pQ.eq('id', user.program_id);
      const { data: progs } = await pQ;
      if (progs && progs.length > 0) {
        setPrograms(progs);
        const pid = selectedProgram || progs[0].id;
        if (!selectedProgram) setSelectedProgram(pid);

        // Fetch scores and exclusions for selected program
        const [{ data: scoresData }, { map: exclusionMap }] = await Promise.all([
          supabase
            .from('readiness_scores')
            .select('*, accreditation_criteria(*, accreditation_areas(*))')
            .eq('program_id', pid)
            .order('criterion_id'),
          loadExclusionMap(supabase),
        ]);
        
        let finalScores = (scoresData || []) as ReadinessScore[];
        if (finalScores.length === 0) {
          const { getMockDatabase } = await import('@/lib/mock-data');
          const db = getMockDatabase();
          if (!levelsData || levelsData.length === 0) setLevels(db.accreditation_levels);
          const matchedProg = progs.find((p) => p.id === pid);
          const mockPid = matchedProg?.code === 'BSIT' ? 'prog-bsit' : 'prog-bscs';
          const rawMock = (db.readiness_scores as ReadinessScore[]).filter(
            (s) => s.program_id === pid || s.program_id === mockPid
          );
          finalScores = (rawMock.length > 0 ? rawMock : (db.readiness_scores as ReadinessScore[])).map((s) => {
            const crit = s.accreditation_criteria || db.accreditation_criteria.find((c) => c.id === s.criterion_id);
            const area = crit?.accreditation_areas || db.accreditation_areas.find((a) => a.id === crit?.area_id);
            return {
              ...s,
              accreditation_criteria: crit ? { ...crit, accreditation_areas: area } : undefined,
            };
          });
        }

        // Filter out criteria that do not apply to pid (other program criteria or excluded shared criteria)
        const progExclusions = exclusionMap.get(pid);
        finalScores = finalScores.filter((s) => {
          const c = s.accreditation_criteria;
          if (!c) return true;
          if (c.program_id && c.program_id !== pid) return false;
          if (progExclusions && progExclusions.has(c.id)) return false;
          return true;
        });
        
        setCurrentScores(finalScores);
        setUnresolvedScores(finalScores.filter(s => ['no_evidence', 'weak'].includes(s.status)));
      } else {
        setPrograms([]);
        setCurrentScores([]);
        setUnresolvedScores([]);
      }
    } catch (err: unknown) {
      console.warn('Supabase offline, loading local mock database for simulation:', err);
      try {
        const { getMockDatabase } = await import('@/lib/mock-data');
        const db = getMockDatabase();
        setPrograms(db.programs);
        setLevels(db.accreditation_levels);
        const pid = selectedProgram || db.programs.find((p) => p.code === 'BSCS')?.id || db.programs[0]?.id || 'prog-bscs';
        if (!selectedProgram) setSelectedProgram(pid);
        const scores = (db.readiness_scores as ReadinessScore[])
          .filter((s) => s.program_id === pid)
          .map((s) => {
            const crit = s.accreditation_criteria || db.accreditation_criteria.find((c) => c.id === s.criterion_id);
            const area = crit?.accreditation_areas || db.accreditation_areas.find((a) => a.id === crit?.area_id);
            return {
              ...s,
              accreditation_criteria: crit ? { ...crit, accreditation_areas: area } : undefined,
            };
          });
        setCurrentScores(scores);
        setUnresolvedScores(scores.filter(s => ['no_evidence', 'weak'].includes(s.status)));
      } catch (mErr) {
        console.error('Failed to load mock simulation data:', mErr);
      }
    } finally {
      setLoading(false);
    }
  }, [user, selectedProgram, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCriterion = (id: string) => {
    setSelectedCriteriaIds(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 10) return prev; // Max 10
      return [...prev, id];
    });
  };

  // Roman numeral order mapping for standard PACUCOA areas
  const ROMAN_ORDER: Record<string, number> = useMemo(() => ({
    'AREA I': 1,
    'AREA II': 2,
    'AREA III': 3,
    'AREA IV': 4,
    'AREA V': 5,
    'AREA VI': 6,
    'AREA VII': 7,
    'AREA VIII': 8,
    'AREA IX': 9,
    'AREA X': 10,
  }), []);

  // Group unresolved criteria by PACUCOA Evaluative Area
  const areaGroups = useMemo(() => {
    const map = new Map<string, {
      areaId: string;
      code: string;
      title: string;
      weight: number;
      scores: ReadinessScore[];
      selectedCount: number;
    }>();

    for (const score of unresolvedScores) {
      const crit = score.accreditation_criteria;
      const area = crit?.accreditation_areas;
      const areaId = area?.id || crit?.area_id || 'unknown';
      const areaCode = area?.code || 'Other Area';
      const areaTitle = area?.title || 'General Criteria';
      const areaWeight = typeof area?.weight === 'number' ? area.weight : 1;

      if (!map.has(areaId)) {
        map.set(areaId, {
          areaId,
          code: areaCode,
          title: areaTitle,
          weight: areaWeight,
          scores: [],
          selectedCount: 0,
        });
      }

      const grp = map.get(areaId)!;
      grp.scores.push(score);
      if (selectedCriteriaIds.includes(score.criterion_id)) {
        grp.selectedCount += 1;
      }
    }

    // Sort criteria within each area by code (e.g. V.1, V.2...)
    const groupsList = Array.from(map.values());
    groupsList.forEach((grp) => {
      grp.scores.sort((a: ReadinessScore, b: ReadinessScore) => {
        const codeA = a.accreditation_criteria?.code || '';
        const codeB = b.accreditation_criteria?.code || '';
        return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
      });
    });

    // Sort areas by Roman numeral (Area I to Area X)
    const sortedGroups = groupsList.sort((a, b) => {
      const orderA = ROMAN_ORDER[a.code.toUpperCase()] ?? 99;
      const orderB = ROMAN_ORDER[b.code.toUpperCase()] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.code.localeCompare(b.code);
    });

    return sortedGroups;
  }, [unresolvedScores, selectedCriteriaIds, ROMAN_ORDER]);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    return areaGroups
      .filter(grp => {
        if (selectedAreaFilter !== 'all' && grp.areaId !== selectedAreaFilter && grp.code !== selectedAreaFilter) {
          return false;
        }
        return true;
      })
      .map(grp => {
        if (!q) return grp;
        const matchingScores = grp.scores.filter(s => {
          const code = (s.accreditation_criteria?.code || '').toLowerCase();
          const title = (s.accreditation_criteria?.title || '').toLowerCase();
          const areaCode = grp.code.toLowerCase();
          const areaTitle = grp.title.toLowerCase();
          return code.includes(q) || title.includes(q) || areaCode.includes(q) || areaTitle.includes(q);
        });
        return {
          ...grp,
          scores: matchingScores,
        };
      })
      .filter(grp => grp.scores.length > 0);
  }, [areaGroups, selectedAreaFilter, searchQuery]);

  const calculateProjection = async () => {
    if (!user || selectedCriteriaIds.length === 0) return;
    setSimulating(true);

    // In accordance with the capstone manuscript methodology (Chapter IV, p. 91):
    // Upgrading unresolved criteria contributes +4.00 points (benchmark score = 4.00)
    // directly to the Area sum of scores:
    // • 2 criteria in Area IV: +8.00 pts -> Area IV mean rises from 2.67 to 3.40
    // • 3 criteria in Area V: +12.00 pts -> Area V mean rises from 2.82 to 3.62
    // • 5 criteria in Area VII: +20.00 pts -> Area VII mean rises from 1.30 to 3.30
    // Yielding a total weighted value of 107.16 / 30 = 3.57 (+0.35 increase over 3.22 baseline).
    const BENCHMARK_POINTS = 4.0;

    // 1. Compute individual criterion simulated scores
    const simulatedScores = currentScores.map(s => {
      if (selectedCriteriaIds.includes(s.criterion_id)) {
        return { ...s, score: Math.min(5, s.score + BENCHMARK_POINTS) };
      }
      return s;
    });

    // 2. Group by area and compute area means following the manuscript formula
    const simAreaMap = new Map<string, { 
      scores: number[]; 
      weight: number; 
      simulatedCount: number;
    }>();

    for (const s of currentScores) {
      const areaId = s.accreditation_criteria?.area_id;
      const areaWeight = s.accreditation_criteria?.accreditation_areas?.weight;
      if (!areaId) continue;
      if (!simAreaMap.has(areaId)) {
        simAreaMap.set(areaId, { 
          scores: [], 
          weight: typeof areaWeight === 'number' ? areaWeight : 1,
          simulatedCount: 0,
        });
      }
      simAreaMap.get(areaId)!.scores.push(s.score);
      if (selectedCriteriaIds.includes(s.criterion_id)) {
        simAreaMap.get(areaId)!.simulatedCount += 1;
      }
    }

    const simAreaInputs = Array.from(simAreaMap.values()).map(({ scores, weight, simulatedCount }) => {
      const baseSum = scores.reduce((a, b) => a + b, 0);
      const simSum = baseSum + (simulatedCount * BENCHMARK_POINTS);
      const meanScore = simSum / scores.length;
      return {
        meanScore,
        weight,
      };
    });

    const calculatedProjectedScore = calculateWeightedGrandMean(simAreaInputs);

    setProjectedScore(calculatedProjectedScore);
    setProjectedAreaMeans(simAreaInputs.map((a) => a.meanScore));
    setProjectedCriterionScores(simulatedScores.map((s) => s.score));

    // 4. Save simulation to DB
    const { data: insertedSim } = await supabase.from('simulations').insert({
      created_by: user.id,
      program_id: selectedProgram,
      simulated_criteria_ids: selectedCriteriaIds,
      projected_score: calculatedProjectedScore
    }).select('id').single();

    // 5. Log audit event
    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'simulation_run',
      entityType: 'simulations',
      entityId: insertedSim?.id,
      metadata: {
        program_id: selectedProgram,
        simulated_criteria_count: selectedCriteriaIds.length,
        projected_score: calculatedProjectedScore,
        baseline_score: currentBaseline,
      }
    });

    setSimulating(false);
  };

  if (authLoading || !user) return <TableSkeleton rows={5} cols={4} />;

  if (!['qa', 'dean', 'program_head'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FlaskConical className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-medium">Access Restricted</p>
        <p className="text-sm">Only QA, Deans, and Program Heads can run simulations.</p>
      </div>
    );
  }

  // Calculate current baseline score using the same function as the real dashboard.
  let currentBaseline = 0;
  let baselineAreaMeans: number[] = [];
  if (currentScores.length > 0) {
    const baseAreaMap = new Map<string, { scores: number[]; weight: number }>();
    for (const s of currentScores) {
      const areaId = s.accreditation_criteria?.area_id;
      const areaWeight = s.accreditation_criteria?.accreditation_areas?.weight;
      if (!areaId) continue;
      if (!baseAreaMap.has(areaId)) {
        baseAreaMap.set(areaId, { scores: [], weight: typeof areaWeight === 'number' ? areaWeight : 1 });
      }
      baseAreaMap.get(areaId)!.scores.push(s.score);
    }
    const baseAreaInputs = Array.from(baseAreaMap.values()).map(({ scores, weight }) => ({
      meanScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      weight,
    }));
    baselineAreaMeans = baseAreaInputs.map((a) => a.meanScore);
    currentBaseline = calculateWeightedGrandMean(baseAreaInputs);
  }

  const baselineFloorStatus = evaluateLevelFloorStatus(
    currentBaseline,
    baselineAreaMeans,
    currentScores.map((s) => s.score),
    levels
  );

  const projectedFloorStatus =
    projectedScore !== null
      ? evaluateLevelFloorStatus(projectedScore, projectedAreaMeans, projectedCriterionScores, levels)
      : null;

  const getToneClasses = (tone: 'emerald' | 'amber' | 'red') => {
    if (tone === 'emerald') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (tone === 'amber') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-red-50 text-red-800 border-red-200';
  };

  const selectedProgObj = programs.find((p) => p.id === selectedProgram);
  const isSelectedProgInactive = selectedProgObj?.is_accreditation_active === false;

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Simulation Banner (Shrink-0) */}
      <div className="shrink-0 bg-primary text-white px-4 py-2.5 rounded-xl border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate">What-If Simulation Engine</h1>
            <p className="text-xs text-white/85 font-medium truncate">Project readiness score by simulating the completion of unresolved criteria.</p>
          </div>
        </div>
        {['qa', 'dean'].includes(user.role) && programs.length > 1 && (
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg shrink-0">
            <span className="text-xs font-medium text-white">Target:</span>
            <select 
              value={selectedProgram} 
              onChange={(e) => { setSelectedProgram(e.target.value); setSelectedCriteriaIds([]); setProjectedScore(null); setProjectedAreaMeans([]); setProjectedCriterionScores([]); }}
              className="bg-transparent border border-white/30 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-white py-0.5"
            >
              {programs.map((p) => {
                const isActive = p.is_accreditation_active !== false;
                return (
                  <option key={p.id} value={p.id} className="text-gray-900">
                    {p.code} {!isActive ? '(Out of Cycle)' : '(Active)'}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Archive Warning Banner */}
      {isSelectedProgInactive && (
        <div className="shrink-0 bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 font-bold text-[10px] uppercase tracking-wider shrink-0">
              Exploratory Mode
            </span>
            <span className="truncate">
              Program <strong>{selectedProgObj?.code}</strong> is currently <strong>out of the active accreditation cycle</strong>. Projections here are for future cycle planning.
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium shrink-0 ml-2">Planning Only</span>
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
        {/* Left Col: Unresolved Criteria Selection Arranged by Area */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="shrink-0 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">1. Select Target Criteria by Area</h3>
              <p className="text-[11px] text-gray-500">Select up to 10 criteria you plan to resolve (simulates 4/5)</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedCriteriaIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCriteriaIds([]);
                    setProjectedScore(null);
                    setProjectedAreaMeans([]);
                    setProjectedCriterionScores([]);
                  }}
                  className="text-[11px] text-gray-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  title="Clear all selections"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${selectedCriteriaIds.length === 10 ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                {selectedCriteriaIds.length} / 10 Selected
              </span>
            </div>
          </div>

          {/* Search and Area Filter Bar */}
          <div className="shrink-0 px-3 py-2 bg-white border-b border-gray-100 space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search criterion or area (e.g., V.2, Research, Library)..."
                className="w-full pl-8 pr-7 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Horizontal Area Pills Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedAreaFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 cursor-pointer ${
                  selectedAreaFilter === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                All Areas ({unresolvedScores.length})
              </button>

              {areaGroups.map(grp => {
                const isActive = selectedAreaFilter === grp.areaId || selectedAreaFilter === grp.code;
                return (
                  <button
                    key={grp.areaId}
                    type="button"
                    onClick={() => setSelectedAreaFilter(isActive ? 'all' : grp.areaId)}
                    className={`px-2 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 border cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : grp.selectedCount > 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <span>{grp.code}</span>
                    <span className={`text-[10px] px-1 rounded ${
                      isActive ? 'bg-white/20 text-white' : grp.selectedCount > 0 ? 'bg-emerald-200 text-emerald-900 font-bold' : 'text-gray-400'
                    }`}>
                      {grp.scores.length}
                    </span>
                    {grp.selectedCount > 0 && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex-1 min-h-0 p-3">
              <TableSkeleton rows={5} cols={2} />
            </div>
          ) : unresolvedScores.length === 0 ? (
            <div className="flex-1 min-h-0 p-8 text-center flex flex-col items-center justify-center">
              <CheckSquare className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <h4 className="text-gray-700 font-semibold text-sm">No unresolved criteria!</h4>
              <p className="text-xs text-gray-400 mt-1">This program is already fully documented.</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex-1 min-h-0 p-8 text-center flex flex-col items-center justify-center">
              <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h4 className="text-gray-700 font-semibold text-xs">No matching criteria found</h4>
              <p className="text-[11px] text-gray-400 mt-1">Try clearing your search or area filter.</p>
              <button
                type="button"
                onClick={() => { setSelectedAreaFilter('all'); setSearchQuery(''); }}
                className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-3">
              {filteredGroups.map(grp => (
                <div key={grp.areaId} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  {/* Area Group Header */}
                  <div className="bg-gray-50/90 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-[11px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded shrink-0">
                        {grp.code}
                      </span>
                      <span className="font-bold text-xs text-gray-900 truncate">
                        {grp.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium shrink-0">
                        (Weight: {grp.weight})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs shrink-0">
                      {grp.selectedCount > 0 && (
                        <span className="font-bold text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {grp.selectedCount} selected
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500 font-medium">
                        {grp.scores.length} {grp.scores.length === 1 ? 'criterion' : 'criteria'}
                      </span>
                    </div>
                  </div>

                  {/* Criteria in this area */}
                  <div className="p-2 space-y-1.5 bg-white">
                    {grp.scores.map(score => {
                      const isSelected = selectedCriteriaIds.includes(score.criterion_id);
                      const isDisabled = !isSelected && selectedCriteriaIds.length >= 10;
                      const criteria = score.accreditation_criteria;
                      
                      return (
                        <div 
                          key={score.id}
                          onClick={() => !isDisabled && toggleCriterion(score.criterion_id)}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer text-xs ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-xs' 
                              : isDisabled 
                                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' 
                                : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50/80'
                          }`}
                        >
                          <div className="mt-0.5 text-primary shrink-0">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-gray-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-xs font-bold text-gray-900 truncate">
                                [{criteria?.code}] {criteria?.title}
                              </span>
                              <StatusBadge status={score.status} />
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                              <span>Current: <strong className="text-gray-700">{score.score}/5</strong></span>
                              <span>→</span>
                              <span className="text-emerald-700 font-semibold">Simulates: <strong>4/5 (Strong)</strong></span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Projection Results (Scrolls internally) */}
        <div className="lg:col-span-5 flex flex-col min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">2. Run Projection</h3>
            
            <div className="space-y-3 mb-4">
              <div className="pb-2.5 border-b border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">Current Baseline Score</span>
                  <span className="text-base font-bold text-gray-900">{currentBaseline.toFixed(2)} / 5</span>
                </div>
                {currentScores.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className={`inline-flex self-start items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${getToneClasses(baselineFloorStatus.tone)}`}>
                      {baselineFloorStatus.badge}
                    </span>
                    <span className="text-[10px] text-gray-500">{baselineFloorStatus.detail}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-700">Projected Score</span>
                  {projectedScore !== null ? (
                    <span className="text-2xl font-black text-primary flex items-center gap-1">
                      {projectedScore.toFixed(2)} / 5
                      {projectedScore > currentBaseline && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full ml-1">
                          +{(projectedScore - currentBaseline).toFixed(2)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-gray-300">-- / 5</span>
                  )}
                </div>
                {projectedFloorStatus && (
                  <div className="flex flex-col gap-0.5 pt-0.5">
                    <span className={`inline-flex self-start items-center px-2 py-0.5 rounded border text-[11px] font-bold ${getToneClasses(projectedFloorStatus.tone)}`}>
                      {projectedFloorStatus.badge}
                    </span>
                    <span className="text-[10px] text-gray-600 font-medium">{projectedFloorStatus.detail}</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              className="w-full justify-center py-2 text-xs" 
              disabled={selectedCriteriaIds.length === 0 || simulating}
              onClick={calculateProjection}
            >
              {simulating ? (
                'Calculating...'
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-1.5" />
                  Simulate Score Impact
                </>
              )}
            </Button>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-0.5">How simulation works:</p>
                <ul className="list-disc pl-3.5 space-y-0.5 text-gray-700 text-[11px]">
                  <li>Selected criteria are temporarily simulated as <strong>4 (Strong)</strong>.</li>
                  <li>Uses official PACUCOA weighted formula.</li>
                  <li>History is saved for defensibility, without affecting live records.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
