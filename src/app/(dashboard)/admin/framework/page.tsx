'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/Toast';
import {
  AccreditationFramework,
  AccreditationArea,
  AccreditationCriterion,
  AccreditationLevel,
  LevelSpecificCriterion,
  RatingScale,
  RatingScaleDefinitionItem,
} from '@/lib/types';
import { logAuditEvent } from '@/lib/audit';
import {
  INITIAL_RATING_SCALES,
  INITIAL_LEVEL_SPECIFIC_CRITERIA,
  INITIAL_AREAS,
  INITIAL_CRITERIA,
  INITIAL_LEVELS,
} from '@/lib/mock-data';
import {
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  Scale,
  Award,
  Layers,
  Sparkles,
  AlertCircle,
  Copy,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  List,
  ChevronsUpDown,
} from 'lucide-react';

// Official PACUCOA Manual (Rev. Sept 2023) Area Weights (Sum = 30)
const DEFAULT_PACUCOA_WEIGHTS: Record<string, number> = {
  'Area 1': 3.0,
  'Area I': 3.0,
  'Area 2': 3.0,
  'Area II': 3.0,
  'Area 3': 4.0, // Instruction (Highest weighted)
  'Area III': 4.0,
  'Area 4': 3.0, // Laboratory
  'Area IV': 3.0,
  'Area 5': 3.0, // Research
  'Area V': 3.0,
  'Area 6': 3.0, // Library
  'Area VI': 3.0,
  'Area 7': 3.0, // Student Services
  'Area VII': 3.0,
  'Area 8': 3.0, // Social Orientation
  'Area VIII': 3.0,
  'Area 9': 2.0, // Physical Plant (Lowest weighted)
  'Area IX': 2.0,
  'Area 10': 3.0, // Organization & Administration
  'Area X': 3.0,
};

const getAreaWeight = (area: AccreditationArea): number => {
  if (typeof area.weight === 'number' && !isNaN(area.weight) && area.weight > 0) return area.weight;
  return DEFAULT_PACUCOA_WEIGHTS[area.code] || 3.0;
};

type ConfigTab = 'frameworks' | 'areas' | 'criteria' | 'levels' | 'level_criteria' | 'rating_scales';

export default function FrameworkConfigPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<ConfigTab>('frameworks');
  const [loading, setLoading] = useState(true);

  // Data states
  const [frameworks, setFrameworks] = useState<AccreditationFramework[]>([]);
  const [areas, setAreas] = useState<AccreditationArea[]>([]);
  const [criteria, setCriteria] = useState<AccreditationCriterion[]>([]);
  const [levels, setLevels] = useState<AccreditationLevel[]>([]);
  const [levelCriteria, setLevelCriteria] = useState<LevelSpecificCriterion[]>([]);
  const [ratingScales, setRatingScales] = useState<RatingScale[]>([]);

  // Search & Selection filters
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Criteria Hierarchy view states
  const [criteriaViewMode, setCriteriaViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');
  const [expandedCriteriaAreaIds, setExpandedCriteriaAreaIds] = useState<Set<string>>(new Set());

  const toggleCriteriaArea = (areaId: string) => {
    setExpandedCriteriaAreaIds((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  };

  const expandAllCriteriaAreas = (targetAreas: AccreditationArea[]) => {
    setExpandedCriteriaAreaIds(new Set(targetAreas.map((a) => a.id)));
  };

  const collapseAllCriteriaAreas = () => {
    setExpandedCriteriaAreaIds(new Set());
  };

  // Migration status helper (dev/admin header actions hidden in presentation UI)
  const showDevFrameworkControls: boolean = false;
  const [migrationMissing, setMigrationMissing] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ---------------------------------------------------------------------------
  // Modals & Form States
  // ---------------------------------------------------------------------------
  // 1. Framework Modal
  const [isFwModalOpen, setIsFwModalOpen] = useState(false);
  const [editingFw, setEditingFw] = useState<AccreditationFramework | null>(null);
  const [fwForm, setFwForm] = useState({ name: '', description: '' });

  // 2. Area Modal
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AccreditationArea | null>(null);
  const [areaForm, setAreaForm] = useState({
    code: '',
    title: '',
    weight: 1.0,
    display_order: 1,
    framework_id: '',
  });

  // 3. Criterion Modal
  const [isCritModalOpen, setIsCritModalOpen] = useState(false);
  const [editingCrit, setEditingCrit] = useState<AccreditationCriterion | null>(null);
  const [critForm, setCritForm] = useState({
    code: '',
    title: '',
    area_id: '',
    parent_criterion_id: '',
    weight: 1,
    required_count: 1,
    expected_document_type: '',
    rating_axis: 'single' as 'adequacy' | 'effectiveness' | 'both' | 'single',
    framework_id: '',
  });

  // 4. Level Modal
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<AccreditationLevel | null>(null);
  const [levelForm, setLevelForm] = useState({
    label: '',
    level_number: 1,
    min_score_threshold: 3.0,
    required_optional_criteria_count: 0,
    framework_id: '',
  });

  // 5. Level Specific Criterion Modal
  const [isLscModalOpen, setIsLscModalOpen] = useState(false);
  const [editingLsc, setEditingLsc] = useState<LevelSpecificCriterion | null>(null);
  const [lscForm, setLscForm] = useState({
    level_id: '',
    code: '',
    title: '',
    description: '',
    is_mandatory: true,
    rating_scale_id: '',
  });

  // 6. Rating Scale Modal
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [editingScale, setEditingScale] = useState<RatingScale | null>(null);
  const [scaleForm, setScaleForm] = useState<{
    name: string;
    description: string;
    framework_id: string;
    scale_definition: RatingScaleDefinitionItem[];
  }>({
    name: '',
    description: '',
    framework_id: '',
    scale_definition: [
      { value: 5, label: 'Excellent', description: 'Exceeds standard with outstanding evidence' },
      { value: 4, label: 'Very Good', description: 'Meets standard fully' },
      { value: 3, label: 'Satisfactory', description: 'Meets minimum accreditation requirement' },
      { value: 2, label: 'Fair', description: 'Partial compliance with minor gaps' },
      { value: 1, label: 'Poor', description: 'Substantially deficient' },
      { value: 0, label: 'No Evidence', description: 'Zero evidence submitted' },
    ],
  });

  // Delete Confirm Dialog
  const [deleteTarget, setDeleteTarget] = useState<{
    type: ConfigTab;
    id: string;
    name: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Frameworks
      const { data: fwData } = await supabase.from('accreditation_frameworks').select('*').order('name');
      const loadedFrameworks = fwData || [];
      setFrameworks(loadedFrameworks);
      if (loadedFrameworks.length > 0 && !selectedFrameworkId) {
        setSelectedFrameworkId(loadedFrameworks[0].id);
      }

      // 2. Fetch Areas
      const { data: areasData } = await supabase
        .from('accreditation_areas')
        .select('*, accreditation_frameworks(*)')
        .order('display_order, code');
      const loadedAreas = (areasData as AccreditationArea[]) || [];
      setAreas(loadedAreas);
      setExpandedCriteriaAreaIds((prev) => prev.size === 0 ? new Set(loadedAreas.map((a) => a.id)) : prev);

      // 3. Fetch Criteria
      const { data: criteriaData } = await supabase
        .from('accreditation_criteria')
        .select('*, accreditation_areas(*)')
        .order('code');
      setCriteria((criteriaData as AccreditationCriterion[]) || []);

      // 4. Fetch Levels
      const { data: levelsData } = await supabase
        .from('accreditation_levels')
        .select('*')
        .order('level_number');
      const loadedLevels = (levelsData as AccreditationLevel[]) || [];
      setLevels(loadedLevels);
      // Keep selectedLevelId as '' by default so all 13 Level III & IV criteria display immediately

      // 5. Fetch Rating Scales (with graceful schema detection & localStorage fallback)
      const { data: scalesData, error: scalesError } = await supabase
        .from('rating_scales')
        .select('*')
        .order('name');
      if (scalesError && (scalesError.code === '42P01' || scalesError.code === 'PGRST205' || scalesError.message?.includes('schema cache'))) {
        setMigrationMissing(true);
        const savedScales = typeof window !== 'undefined' ? localStorage.getItem('pacucoa_custom_rating_scales') : null;
        if (savedScales) {
          try {
            setRatingScales(JSON.parse(savedScales));
          } catch {
            setRatingScales(INITIAL_RATING_SCALES);
          }
        } else {
          setRatingScales(INITIAL_RATING_SCALES);
        }
      } else {
        setRatingScales(scalesData && scalesData.length > 0 ? (scalesData as RatingScale[]) : INITIAL_RATING_SCALES);
      }

      // 6. Fetch Level-Specific Criteria (with graceful schema detection & localStorage fallback)
      const { data: lscData, error: lscError } = await supabase
        .from('level_specific_criteria')
        .select('*, rating_scales(*), accreditation_levels(*)')
        .order('code');

      // Helper to map criteria to actual database level records
      const lvl3 = loadedLevels.find((l) => l.level_number === 4 || l.label.includes('Level III'));
      const lvl4 = loadedLevels.find((l) => l.level_number === 5 || l.label.includes('Level IV'));
      const mapCriteriaWithLevels = (list: LevelSpecificCriterion[]) =>
        list.map((c) => {
          const isL4 = c.code.startsWith('L4') || c.level_id === 'lvl-5';
          const targetLvl = isL4 ? lvl4 : lvl3;
          return {
            ...c,
            level_id: targetLvl?.id || c.level_id,
            accreditation_levels: targetLvl || c.accreditation_levels || null,
          };
        });

      if (lscError && (lscError.code === '42P01' || lscError.code === 'PGRST205' || lscError.message?.includes('schema cache'))) {
        setMigrationMissing(true);
        const savedLsc = typeof window !== 'undefined' ? localStorage.getItem('pacucoa_custom_level_criteria') : null;
        if (savedLsc) {
          try {
            setLevelCriteria(mapCriteriaWithLevels(JSON.parse(savedLsc)));
          } catch {
            setLevelCriteria(mapCriteriaWithLevels(INITIAL_LEVEL_SPECIFIC_CRITERIA));
          }
        } else {
          setLevelCriteria(mapCriteriaWithLevels(INITIAL_LEVEL_SPECIFIC_CRITERIA));
        }
      } else {
        setLevelCriteria(
          lscData && lscData.length > 0
            ? (lscData as LevelSpecificCriterion[])
            : mapCriteriaWithLevels(INITIAL_LEVEL_SPECIFIC_CRITERIA)
        );
      }
    } catch (err: unknown) {
      console.error('Error fetching framework configuration:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedFrameworkId, selectedLevelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Restrict access to System Admin & QA
  if (!user || !['system_admin', 'qa'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <SlidersHorizontal className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-medium">Access Restricted</p>
        <p className="text-sm">Only QA Administrators and System Administrators can configure accreditation frameworks.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // CRUD Handlers: Frameworks
  // ---------------------------------------------------------------------------
  const handleSaveFramework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fwForm.name.trim()) {
      showToast('error', 'Framework name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingFw) {
        const { error } = await supabase
          .from('accreditation_frameworks')
          .update({ name: fwForm.name.trim(), description: fwForm.description.trim() || null })
          .eq('id', editingFw.id);
        if (error) throw error;
        await logAuditEvent('framework_updated', 'accreditation_frameworks', editingFw.id, { name: fwForm.name });
        showToast('success', 'Framework updated successfully');
      } else {
        const { data, error } = await supabase
          .from('accreditation_frameworks')
          .insert({ name: fwForm.name.trim(), description: fwForm.description.trim() || null })
          .select('id')
          .single();
        if (error) throw error;
        await logAuditEvent('framework_created', 'accreditation_frameworks', data?.id, { name: fwForm.name });
        showToast('success', 'New Framework created');
      }
      setIsFwModalOpen(false);
      setEditingFw(null);
      setFwForm({ name: '', description: '' });
      fetchData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save framework');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD Handlers: Areas
  // ---------------------------------------------------------------------------
  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaForm.code.trim() || !areaForm.title.trim()) {
      showToast('error', 'Area Code and Title are required');
      return;
    }
    const fwId = areaForm.framework_id || selectedFrameworkId || frameworks[0]?.id;
    if (!fwId) {
      showToast('error', 'Please select or create a Framework first');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        code: areaForm.code.trim(),
        title: areaForm.title.trim(),
        framework_id: fwId,
        weight: Number(areaForm.weight) || 1.0,
        display_order: Number(areaForm.display_order) || 1,
      };

      let opError: any = null;
      let insertedId = editingArea?.id;

      if (editingArea) {
        const res = await supabase
          .from('accreditation_areas')
          .update(payload)
          .eq('id', editingArea.id);
        opError = res.error;
      } else {
        const res = await supabase
          .from('accreditation_areas')
          .insert(payload)
          .select('id')
          .single();
        opError = res.error;
        insertedId = res.data?.id;
      }

      // Graceful fallback: If 'weight' or 'display_order' columns are missing in Supabase schema (PGRST204)
      if (opError && (opError.code === 'PGRST204' || opError.message?.includes('column') || opError.message?.includes('schema cache'))) {
        console.warn('Columns weight/display_order missing in schema cache, retrying with core columns:', opError.message);
        const corePayload = {
          code: areaForm.code.trim(),
          title: areaForm.title.trim(),
          framework_id: fwId,
        };
        if (editingArea) {
          const fallbackRes = await supabase
            .from('accreditation_areas')
            .update(corePayload)
            .eq('id', editingArea.id);
          opError = fallbackRes.error;
        } else {
          const fallbackRes = await supabase
            .from('accreditation_areas')
            .insert(corePayload)
            .select('id')
            .single();
          opError = fallbackRes.error;
          insertedId = fallbackRes.data?.id;
        }
      }

      if (opError) throw opError;

      await logAuditEvent(
        editingArea ? 'area_updated' : 'area_created',
        'accreditation_areas',
        insertedId,
        payload
      );
      showToast('success', editingArea ? 'Area updated successfully' : 'New Area added');
      setIsAreaModalOpen(false);
      setEditingArea(null);
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || (err instanceof Error ? err.message : 'Failed to save area');
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD Handlers: Criteria
  // ---------------------------------------------------------------------------
  const handleSaveCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!critForm.code.trim() || !critForm.title.trim()) {
      showToast('error', 'Criterion code and title are required');
      return;
    }
    const fwId = critForm.framework_id || selectedFrameworkId || frameworks[0]?.id;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        code: critForm.code.trim(),
        title: critForm.title.trim(),
        framework_id: fwId,
        area_id: critForm.area_id || null,
        parent_criterion_id: critForm.parent_criterion_id || null,
        weight: Number(critForm.weight) || 1,
        required_count: Number(critForm.required_count) || 1,
        expected_document_type: critForm.expected_document_type.trim() || null,
        rating_axis: critForm.rating_axis,
      };

      if (editingCrit) {
        const { error } = await supabase
          .from('accreditation_criteria')
          .update(payload)
          .eq('id', editingCrit.id);
        if (error) throw error;
        await logAuditEvent('criterion_edited', 'accreditation_criteria', editingCrit.id, payload);
        showToast('success', 'Criterion updated successfully');
      } else {
        const { data, error } = await supabase
          .from('accreditation_criteria')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        await logAuditEvent('criterion_created', 'accreditation_criteria', data?.id, payload);
        showToast('success', 'New Criterion added');
      }
      setIsCritModalOpen(false);
      setEditingCrit(null);
      fetchData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save criterion');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD Handlers: Levels
  // ---------------------------------------------------------------------------
  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelForm.label.trim()) {
      showToast('error', 'Level Label is required');
      return;
    }
    const fwId = levelForm.framework_id || selectedFrameworkId || frameworks[0]?.id;
    if (!fwId) {
      showToast('error', 'Framework is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        label: levelForm.label.trim(),
        level_number: Number(levelForm.level_number) || 1,
        min_score_threshold: Number(levelForm.min_score_threshold),
        required_optional_criteria_count: Number(levelForm.required_optional_criteria_count) || 0,
        framework_id: fwId,
      };

      let opError: any = null;
      let insertedId = editingLevel?.id;

      if (editingLevel) {
        const res = await supabase
          .from('accreditation_levels')
          .update(payload)
          .eq('id', editingLevel.id);
        opError = res.error;
      } else {
        const res = await supabase
          .from('accreditation_levels')
          .insert(payload)
          .select('id')
          .single();
        opError = res.error;
        insertedId = res.data?.id;
      }

      // Graceful fallback: If 'required_optional_criteria_count' column is missing in Supabase schema (PGRST204)
      if (opError && (opError.code === 'PGRST204' || opError.message?.includes('column') || opError.message?.includes('schema cache'))) {
        console.warn('Column required_optional_criteria_count missing in schema cache, retrying with core columns:', opError.message);
        const corePayload = {
          label: levelForm.label.trim(),
          level_number: Number(levelForm.level_number) || 1,
          min_score_threshold: Number(levelForm.min_score_threshold),
          framework_id: fwId,
        };
        if (editingLevel) {
          const fallbackRes = await supabase
            .from('accreditation_levels')
            .update(corePayload)
            .eq('id', editingLevel.id);
          opError = fallbackRes.error;
        } else {
          const fallbackRes = await supabase
            .from('accreditation_levels')
            .insert(corePayload)
            .select('id')
            .single();
          opError = fallbackRes.error;
          insertedId = fallbackRes.data?.id;
        }
      }

      if (opError) throw opError;

      await logAuditEvent(
        editingLevel ? 'level_updated' : 'level_created',
        'accreditation_levels',
        insertedId,
        payload
      );
      showToast('success', editingLevel ? 'Accreditation Level updated' : 'New Accreditation Level added');
      setIsLevelModalOpen(false);
      setEditingLevel(null);
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || (err instanceof Error ? err.message : 'Failed to save level');
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD Handlers: Level Specific Criteria
  // ---------------------------------------------------------------------------
  const handleSaveLsc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lscForm.code.trim() || !lscForm.title.trim()) {
      showToast('error', 'Criterion code and title are required');
      return;
    }
    const lvlId = lscForm.level_id || selectedLevelId || levels[0]?.id;
    if (!lvlId) {
      showToast('error', 'Please select a level');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        level_id: lvlId,
        code: lscForm.code.trim(),
        title: lscForm.title.trim(),
        description: lscForm.description.trim() || null,
        is_mandatory: lscForm.is_mandatory,
        rating_scale_id: lscForm.rating_scale_id || null,
      };

      if (editingLsc) {
        const { error } = await supabase
          .from('level_specific_criteria')
          .update(payload)
          .eq('id', editingLsc.id);
        if (error && (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache'))) {
          const updated = levelCriteria.map(lc => lc.id === editingLsc.id ? { ...lc, ...payload } as LevelSpecificCriterion : lc);
          setLevelCriteria(updated);
          localStorage.setItem('pacucoa_custom_level_criteria', JSON.stringify(updated));
          showToast('success', 'Level Criterion updated in session configuration');
          setIsLscModalOpen(false);
          setEditingLsc(null);
          return;
        }
        if (error) throw error;
        await logAuditEvent('level_criterion_updated', 'level_specific_criteria', editingLsc.id, payload);
        showToast('success', 'Level Criterion updated');
      } else {
        const { data, error } = await supabase
          .from('level_specific_criteria')
          .insert(payload)
          .select('id')
          .single();
        if (error && (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache'))) {
          const newLsc: LevelSpecificCriterion = {
            id: `lsc-${Date.now()}`,
            level_id: lvlId,
            code: lscForm.code.trim(),
            title: lscForm.title.trim(),
            description: lscForm.description.trim() || null,
            is_mandatory: lscForm.is_mandatory,
            rating_scale_id: lscForm.rating_scale_id || null,
            created_at: new Date().toISOString(),
          };
          const updated = [...levelCriteria, newLsc];
          setLevelCriteria(updated);
          localStorage.setItem('pacucoa_custom_level_criteria', JSON.stringify(updated));
          showToast('success', 'New Level-Specific Criterion created in session configuration');
          setIsLscModalOpen(false);
          setEditingLsc(null);
          return;
        }
        if (error) throw error;
        await logAuditEvent('level_criterion_created', 'level_specific_criteria', data?.id, payload);
        showToast('success', 'New Level-Specific Criterion added');
      }
      setIsLscModalOpen(false);
      setEditingLsc(null);
      fetchData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save level criterion');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD Handlers: Rating Scales
  // ---------------------------------------------------------------------------
  const handleSaveScale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scaleForm.name.trim()) {
      showToast('error', 'Rating scale name is required');
      return;
    }
    const fwId = scaleForm.framework_id || selectedFrameworkId || frameworks[0]?.id || null;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: scaleForm.name.trim(),
        description: scaleForm.description.trim() || null,
        framework_id: fwId,
        scale_definition: scaleForm.scale_definition,
      };

      if (editingScale) {
        const { error } = await supabase
          .from('rating_scales')
          .update(payload)
          .eq('id', editingScale.id);
        if (error && (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache'))) {
          const updated = ratingScales.map(s => s.id === editingScale.id ? { ...s, ...payload } as RatingScale : s);
          setRatingScales(updated);
          localStorage.setItem('pacucoa_custom_rating_scales', JSON.stringify(updated));
          showToast('success', 'Rating Scale updated in session configuration');
          setIsScaleModalOpen(false);
          setEditingScale(null);
          return;
        }
        if (error) throw error;
        await logAuditEvent('rating_scale_updated', 'rating_scales', editingScale.id, payload);
        showToast('success', 'Rating Scale updated');
      } else {
        const { data, error } = await supabase
          .from('rating_scales')
          .insert(payload)
          .select('id')
          .single();
        if (error && (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache'))) {
          const newScale: RatingScale = {
            id: `scale-${Date.now()}`,
            framework_id: fwId || 'fw-pacucoa',
            name: scaleForm.name.trim(),
            description: scaleForm.description.trim() || null,
            scale_definition: scaleForm.scale_definition,
            created_at: new Date().toISOString(),
          };
          const updated = [...ratingScales, newScale];
          setRatingScales(updated);
          localStorage.setItem('pacucoa_custom_rating_scales', JSON.stringify(updated));
          showToast('success', 'New Rating Scale created in session configuration');
          setIsScaleModalOpen(false);
          setEditingScale(null);
          return;
        }
        if (error) throw error;
        await logAuditEvent('rating_scale_created', 'rating_scales', data?.id, payload);
        showToast('success', 'New Rating Scale created');
      }
      setIsScaleModalOpen(false);
      setEditingScale(null);
      fetchData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save rating scale');
    } finally {
      setSubmitting(false);
    }
  };

  // Scale Definition Item Helpers
  const addScaleItem = () => {
    setScaleForm((prev) => ({
      ...prev,
      scale_definition: [
        ...prev.scale_definition,
        { value: 0, label: 'New Level', description: '' },
      ],
    }));
  };

  const updateScaleItem = (index: number, field: string, val: unknown) => {
    setScaleForm((prev) => {
      const items = [...prev.scale_definition];
      items[index] = { ...items[index], [field]: val };
      return { ...prev, scale_definition: items };
    });
  };

  const removeScaleItem = (index: number) => {
    setScaleForm((prev) => ({
      ...prev,
      scale_definition: prev.scale_definition.filter((_, i) => i !== index),
    }));
  };

  // ---------------------------------------------------------------------------
  // Generic Delete Handler
  // ---------------------------------------------------------------------------
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      let table = '';
      let auditType = '';

      switch (deleteTarget.type) {
        case 'frameworks':
          table = 'accreditation_frameworks';
          auditType = 'framework_deleted';
          break;
        case 'areas':
          table = 'accreditation_areas';
          auditType = 'area_deleted';
          break;
        case 'criteria':
          table = 'accreditation_criteria';
          auditType = 'criterion_deleted';
          break;
        case 'levels':
          table = 'accreditation_levels';
          auditType = 'level_deleted';
          break;
        case 'level_criteria':
          table = 'level_specific_criteria';
          auditType = 'level_criterion_deleted';
          break;
        case 'rating_scales':
          table = 'rating_scales';
          auditType = 'rating_scale_deleted';
          break;
      }

      const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id);
      if (error && (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache'))) {
        if (deleteTarget.type === 'rating_scales') {
          const updated = ratingScales.filter((s) => s.id !== deleteTarget.id);
          setRatingScales(updated);
          localStorage.setItem('pacucoa_custom_rating_scales', JSON.stringify(updated));
        } else if (deleteTarget.type === 'level_criteria') {
          const updated = levelCriteria.filter((lc) => lc.id !== deleteTarget.id);
          setLevelCriteria(updated);
          localStorage.setItem('pacucoa_custom_level_criteria', JSON.stringify(updated));
        }
        showToast('success', `${deleteTarget.name} deleted from session configuration`);
        setDeleteTarget(null);
        return;
      }
      if (error) throw error;

      await logAuditEvent(auditType, table, deleteTarget.id, { name: deleteTarget.name });
      showToast('success', `${deleteTarget.name} deleted successfully`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // PACUCOA Manual Standards Sync
  // ---------------------------------------------------------------------------
  const handleSyncPacucoaStandards = async () => {
    setSyncing(true);
    try {
      const fwId = selectedFrameworkId || frameworks[0]?.id || 'fw-pacucoa';

      // 1. Ensure PACUCOA Levels have the exact thresholds from Manual (Rev. 2023)
      // Candidate: 3.0, Level I: 3.0, Level II: 3.5, Level III: 4.0, Level IV: 4.0
      const levelUpdates = [
        { level_number: 1, min_score_threshold: 3.0, required_optional_criteria_count: 0 },
        { level_number: 2, min_score_threshold: 3.0, required_optional_criteria_count: 0 },
        { level_number: 3, min_score_threshold: 3.5, required_optional_criteria_count: 0 },
        { level_number: 4, min_score_threshold: 4.0, required_optional_criteria_count: 2 },
        { level_number: 5, min_score_threshold: 4.0, required_optional_criteria_count: 0 },
      ];
      for (const lvl of levelUpdates) {
        await supabase
          .from('accreditation_levels')
          .update({
            min_score_threshold: lvl.min_score_threshold,
            required_optional_criteria_count: lvl.required_optional_criteria_count,
          })
          .eq('level_number', lvl.level_number);
      }

      // 2. Ensure all 10 PACUCOA Areas have official titles, order, and weights (Sum = 30)
      const officialAreas = [
        { code: 'Area I',    title: 'Philosophy and Objectives',              weight: 3.0, order: 1 },
        { code: 'Area II',   title: 'Faculty',                                weight: 3.0, order: 2 },
        { code: 'Area III',  title: 'Instruction',                            weight: 4.0, order: 3 },
        { code: 'Area IV',   title: 'Laboratory',                             weight: 3.0, order: 4 },
        { code: 'Area V',    title: 'Research',                               weight: 3.0, order: 5 },
        { code: 'Area VI',   title: 'Library',                                weight: 3.0, order: 6 },
        { code: 'Area VII',  title: 'Student Services',                       weight: 3.0, order: 7 },
        { code: 'Area VIII', title: 'Social Orientation and Community Involvement', weight: 3.0, order: 8 },
        { code: 'Area IX',   title: 'Physical Plant and Facilities',          weight: 2.0, order: 9 },
        { code: 'Area X',    title: 'Organization and Administration',        weight: 3.0, order: 10 },
      ];

      for (const oa of officialAreas) {
        // After the Roman numeral migration, codes are 'Area I' etc.
        // Also accept legacy Arabic codes in case this runs before migration.
        const areaMatch = areas.find(a => a.code === oa.code);
        if (areaMatch) {
          const res = await supabase.from('accreditation_areas').update({
            title: oa.title,
            weight: oa.weight,
            display_order: oa.order,
          }).eq('id', areaMatch.id);
          if (res.error) {
            await supabase.from('accreditation_areas').update({ title: oa.title }).eq('id', areaMatch.id);
          }
        }
      }

      // 3. Ensure all 22 PACUCOA criteria are seeded and updated with proper document types
      const { data: dbAreas } = await supabase.from('accreditation_areas').select('id, code');
      if (dbAreas && dbAreas.length > 0) {
        // Build lookup by code only — after migration codes are 'Area I' etc.
        const areaLookup = new Map<string, string>();
        dbAreas.forEach(a => areaLookup.set(a.code, a.id));

        // INITIAL_CRITERIA uses Roman numeral prefixes (I, II, ...) as the part before '.'.
        // Map each prefix directly to its Roman-numeral area code.
        const romanToAreaCode: Record<string, string> = {
          'I': 'Area I', 'II': 'Area II', 'III': 'Area III', 'IV': 'Area IV', 'V': 'Area V',
          'VI': 'Area VI', 'VII': 'Area VII', 'VIII': 'Area VIII', 'IX': 'Area IX', 'X': 'Area X',
        };

        const { data: existingCrits } = await supabase.from('accreditation_criteria').select('id, code');
        const existingCodeMap = new Map((existingCrits || []).map(c => [c.code, c.id]));

        for (const c of INITIAL_CRITERIA) {
          const areaPrefix = c.code.split('.')[0];
          const areaCode = romanToAreaCode[areaPrefix] || 'Area I';
          const areaId = areaLookup.get(areaCode) || dbAreas[0]?.id;

          const critPayload = {
            framework_id: fwId,
            area_id: areaId,
            code: c.code,
            title: c.title,
            weight: c.weight,
            required_count: c.required_count,
            expected_document_type: c.expected_document_type,
            rating_axis: 'single',
          };

          const existingId = existingCodeMap.get(c.code);
          if (existingId) {
            await supabase.from('accreditation_criteria').update(critPayload).eq('id', existingId);
          } else {
            await supabase.from('accreditation_criteria').insert(critPayload);
          }
        }
      }

      // 4. Reset & synchronize rating scales and level criteria presets
      if (typeof window !== 'undefined') {
        localStorage.setItem('pacucoa_custom_rating_scales', JSON.stringify(INITIAL_RATING_SCALES));
        localStorage.setItem('pacucoa_custom_level_criteria', JSON.stringify(INITIAL_LEVEL_SPECIFIC_CRITERIA));
      }
      setRatingScales(INITIAL_RATING_SCALES);
      setLevelCriteria(INITIAL_LEVEL_SPECIFIC_CRITERIA);

      await logAuditEvent('framework_standards_synced', 'accreditation_frameworks', fwId, { standard: 'PACUCOA_2023' });
      showToast('success', 'PACUCOA 2023 Standards applied! 10 Areas (Σ=30), 5 Levels, and 79 Criteria updated.');
      await fetchData();
    } catch (err) {
      showToast('error', 'Failed to sync standards: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSyncing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Computations & Filtered Views
  // ---------------------------------------------------------------------------
  const activeFw = frameworks.find((f) => f.id === selectedFrameworkId) || frameworks[0];
  const fwAreas = areas.filter((a) => !selectedFrameworkId || a.framework_id === selectedFrameworkId);
  const totalConfiguredWeight = fwAreas.reduce((sum, a) => sum + getAreaWeight(a), 0);

  const filteredCriteria = criteria.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredLevelCriteria = levelCriteria.filter((lc) => {
    if (selectedLevelId) {
      const targetLevel = levels.find((l) => l.id === selectedLevelId);
      const isL4 = lc.code.startsWith('L4') || lc.level_id === 'lvl-5';
      const isL3 = lc.code.startsWith('L3') || lc.level_id === 'lvl-4';
      const isTargetL3 = targetLevel && (targetLevel.level_number === 4 || targetLevel.label.includes('Level III'));
      const isTargetL4 = targetLevel && (targetLevel.level_number === 5 || targetLevel.label.includes('Level IV'));

      const isMatch =
        lc.level_id === selectedLevelId ||
        (isTargetL3 && isL3) ||
        (isTargetL4 && isL4);

      if (!isMatch) return false;
    }
    if (!searchQuery) return true;
    return (
      lc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* HEADER BANNER */}
      <div className="shrink-0 bg-primary text-white px-4 py-3 rounded-xl border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-white/20 p-2 rounded-lg shrink-0">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate">Framework & Policy Configuration</h1>
            <p className="text-xs text-white/80 font-medium truncate">
              PACUCOA Manual (Rev. Sept 2023) Standards: 10 Areas (Σ=30), Thresholds, and Rating Scales.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {frameworks.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-semibold text-white/80">Active Scope:</span>
              <select
                value={selectedFrameworkId}
                onChange={(e) => setSelectedFrameworkId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {frameworks.map((f) => (
                  <option key={f.id} value={f.id} className="text-gray-900">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showDevFrameworkControls && (
            <>
              <button
                onClick={handleSyncPacucoaStandards}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                title="Apply official PACUCOA Manual (Rev. Sept 2023) Area Weights (Σ=30), Level Thresholds, and Criteria"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{syncing ? 'Syncing...' : 'Sync PACUCOA 2023 Standards'}</span>
              </button>

              {migrationMissing && (
                <button
                  onClick={() => setShowSqlModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Migration Required</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="shrink-0 flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('frameworks')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'frameworks' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>1. Frameworks ({frameworks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('areas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'areas' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2. Areas & Weights ({fwAreas.length})</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-bold">
            Σ = {totalConfiguredWeight}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('criteria')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'criteria' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>3. Criteria Tree ({criteria.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'levels' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>4. Accreditation Levels ({levels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('level_criteria')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'level_criteria' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>5. Level-Specific Criteria ({levelCriteria.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rating_scales')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'rating_scales' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>6. Rating Scales ({ratingScales.length})</span>
        </button>
      </div>

      {/* TAB CONTENT CONTAINER */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-3.5 overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : (
          <>
            {/* ============================================================== */}
            {/* TAB 1: FRAMEWORKS */}
            {/* ============================================================== */}
            {activeTab === 'frameworks' && (
              <div className="h-full flex flex-col min-h-0">
                <div className="shrink-0 flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Accreditation Frameworks</h2>
                    <p className="text-xs text-gray-500">
                      Configure accreditation bodies (e.g. PACUCOA, ABET, AACCUP, PAASCU).
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingFw(null);
                      setFwForm({ name: '', description: '' });
                      setIsFwModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Framework</span>
                  </Button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold sticky top-0 z-10 border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">Framework Name</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Mapped Areas</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {frameworks.map((fw) => {
                        const areaCount = areas.filter((a) => a.framework_id === fw.id).length;
                        return (
                          <tr key={fw.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center gap-2">
                              <span>{fw.name}</span>
                              {fw.id === selectedFrameworkId && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-gray-600 max-w-md">{fw.description || '—'}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-700">
                                {areaCount} Areas
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingFw(fw);
                                    setFwForm({ name: fw.name, description: fw.description || '' });
                                    setIsFwModalOpen(true);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: 'frameworks', id: fw.id, name: fw.name })}
                                  className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: AREAS & WEIGHTS */}
            {/* ============================================================== */}
            {activeTab === 'areas' && (
              <div className="h-full flex flex-col min-h-0">
                <div className="shrink-0 flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Areas & Weights for {activeFw?.name || 'Selected Framework'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Weighted grand mean computes dynamically: Σ(Area Mean × Weight) ÷ Σ(Weight). Total Weight = {totalConfiguredWeight}.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingArea(null);
                      setAreaForm({
                        code: `Area ${fwAreas.length + 1}`,
                        title: '',
                        weight: 3.0,
                        display_order: fwAreas.length + 1,
                        framework_id: selectedFrameworkId || frameworks[0]?.id || '',
                      });
                      setIsAreaModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Area</span>
                  </Button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold sticky top-0 z-10 border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3">Area Title</th>
                        <th className="py-2.5 px-3">Configured Weight</th>
                        <th className="py-2.5 px-3">Weight Share</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {fwAreas.map((area) => {
                        const w = getAreaWeight(area);
                        const pct = totalConfiguredWeight > 0 ? ((w / totalConfiguredWeight) * 100).toFixed(1) : '0';
                        return (
                          <tr key={area.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-gray-400 font-mono font-medium">
                              #{area.display_order ?? '—'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{area.code}</td>
                            <td className="py-2.5 px-3 text-gray-800 font-medium">{area.title}</td>
                            <td className="py-2.5 px-3 font-bold text-primary">
                              <span className="px-2 py-0.5 rounded bg-primary/10">{w.toFixed(1)}</span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 font-semibold">{pct}% of total</td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingArea(area);
                                    setAreaForm({
                                      code: area.code,
                                      title: area.title,
                                      weight: getAreaWeight(area),
                                      display_order: area.display_order ?? 1,
                                      framework_id: area.framework_id,
                                    });
                                    setIsAreaModalOpen(true);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: 'areas', id: area.id, name: `${area.code}: ${area.title}` })}
                                  className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: CRITERIA TREE */}
            {/* ============================================================== */}
            {activeTab === 'criteria' && (
              <div className="h-full flex flex-col min-h-0">
                {/* Header Toolbar */}
                <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Criteria Hierarchy & Requirements</h2>
                    <p className="text-xs text-gray-500">
                      PACUCOA 10 Areas hierarchy mapped to specific criteria, required counts, and expected exhibits.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search criteria code/title/exhibit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-2.5 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-56 bg-white"
                      />
                    </div>

                    {/* View Switcher: Hierarchy vs Flat Table */}
                    <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                      <button
                        onClick={() => setCriteriaViewMode('hierarchy')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          criteriaViewMode === 'hierarchy'
                            ? 'bg-white text-primary shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                        title="Hierarchical Tree view grouped by PACUCOA Areas"
                      >
                        <FolderTree className="w-3.5 h-3.5" />
                        <span>Hierarchy</span>
                      </button>
                      <button
                        onClick={() => setCriteriaViewMode('flat')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          criteriaViewMode === 'flat'
                            ? 'bg-white text-primary shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                        title="Flat tabular list"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>Table</span>
                      </button>
                    </div>

                    {/* Expand/Collapse All (only in Hierarchy mode) */}
                    {criteriaViewMode === 'hierarchy' && (
                      <button
                        onClick={() => {
                          if (expandedCriteriaAreaIds.size === fwAreas.length) {
                            collapseAllCriteriaAreas();
                          } else {
                            expandAllCriteriaAreas(fwAreas);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                        title={expandedCriteriaAreaIds.size === fwAreas.length ? 'Collapse All Areas' : 'Expand All Areas'}
                      >
                        <ChevronsUpDown className="w-3.5 h-3.5 text-gray-500" />
                        <span>{expandedCriteriaAreaIds.size === fwAreas.length ? 'Collapse All' : 'Expand All'}</span>
                      </button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingCrit(null);
                        setCritForm({
                          code: '',
                          title: '',
                          area_id: fwAreas[0]?.id || '',
                          parent_criterion_id: '',
                          weight: 1,
                          required_count: 1,
                          expected_document_type: '',
                          rating_axis: 'single',
                          framework_id: selectedFrameworkId || frameworks[0]?.id || '',
                        });
                        setIsCritModalOpen(true);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Criterion</span>
                    </Button>
                  </div>
                </div>

                {/* Content Container */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
                  {filteredCriteria.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                      <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-gray-700 font-semibold text-sm">No criteria match your filter</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                        Try adjusting your search query or add a new criterion.
                      </p>
                    </div>
                  ) : criteriaViewMode === 'flat' ? (
                    /* FLAT TABLE VIEW */
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold sticky top-0 z-10 border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Title</th>
                          <th className="py-2.5 px-3">Area</th>
                          <th className="py-2.5 px-3">Expected Artifact</th>
                          <th className="py-2.5 px-3">Weight</th>
                          <th className="py-2.5 px-3">Required</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredCriteria.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{c.code}</td>
                            <td className="py-2.5 px-3 text-gray-800 font-medium max-w-sm truncate">{c.title}</td>
                            <td className="py-2.5 px-3 text-gray-600 font-medium">{c.accreditation_areas?.code || '—'}</td>
                            <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px] max-w-xs truncate" title={c.expected_document_type || ''}>
                              {c.expected_document_type || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 font-semibold">{c.weight}</td>
                            <td className="py-2.5 px-3 text-gray-600 font-semibold">{c.required_count || 1} docs</td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCrit(c);
                                    setCritForm({
                                      code: c.code,
                                      title: c.title,
                                      area_id: c.area_id || '',
                                      parent_criterion_id: c.parent_criterion_id || '',
                                      weight: c.weight || 1,
                                      required_count: c.required_count || 1,
                                      expected_document_type: c.expected_document_type || '',
                                      rating_axis: c.rating_axis || 'single',
                                      framework_id: c.framework_id,
                                    });
                                    setIsCritModalOpen(true);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: 'criteria', id: c.id, name: `${c.code}: ${c.title}` })}
                                  className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    /* TRUE HIERARCHICAL TREE LAYOUT */
                    <div className="space-y-3 pb-6">
                      {fwAreas.map((area) => {
                        const areaCriteria = filteredCriteria.filter((c) => c.area_id === area.id);
                        if (searchQuery && areaCriteria.length === 0) return null;
                        const isExpanded = expandedCriteriaAreaIds.has(area.id);

                        return (
                          <div
                            key={area.id}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs transition-all"
                          >
                            {/* Area Level Header (Accordion) */}
                            <div
                              onClick={() => toggleCriteriaArea(area.id)}
                              className="bg-gray-50/90 hover:bg-gray-100/90 px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-200 select-none transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-1 rounded bg-white text-gray-500 border border-gray-200 shadow-2xs">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-primary" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <span className="font-mono text-xs font-black bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20 shrink-0">
                                    {area.code}
                                  </span>
                                  <h3 className="font-bold text-gray-900 text-sm truncate" title={area.title}>
                                    {area.title}
                                  </h3>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 hidden sm:inline">
                                  Weight: {getAreaWeight(area)}
                                </span>
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  {areaCriteria.length} {areaCriteria.length === 1 ? 'Criterion' : 'Criteria'}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCrit(null);
                                    setCritForm({
                                      code: '',
                                      title: '',
                                      area_id: area.id,
                                      parent_criterion_id: '',
                                      weight: 1,
                                      required_count: 1,
                                      expected_document_type: '',
                                      rating_axis: 'single',
                                      framework_id: selectedFrameworkId || frameworks[0]?.id || '',
                                    });
                                    setIsCritModalOpen(true);
                                  }}
                                  className="p-1 rounded hover:bg-white text-gray-400 hover:text-primary transition-colors ml-1"
                                  title={`Add criterion to ${area.code}`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Nested Criteria Nodes in this Area */}
                            {isExpanded && (
                              <div className="p-4 bg-gray-50/20">
                                {areaCriteria.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic py-2 text-center">
                                    No criteria defined under this Area yet. Click + Add to define criteria.
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    {areaCriteria.map((c) => (
                                      <div
                                        key={c.id}
                                        className="relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-4 before:bottom-0 before:w-0.5 before:bg-primary/20 after:content-[''] after:absolute after:left-2.5 after:top-4 after:w-3.5 after:h-0.5 after:bg-primary/20"
                                      >
                                        <div className="bg-white rounded-xl border border-gray-200 p-3.5 hover:border-primary/40 hover:shadow-xs transition-all">
                                          {/* Criterion Top Bar */}
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-2.5 min-w-0">
                                              <span className="font-mono text-xs font-black bg-primary text-white px-2 py-0.5 rounded shadow-2xs shrink-0 mt-0.5">
                                                {c.code}
                                              </span>
                                              <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 leading-snug">
                                                  {c.title}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                    Required: {c.required_count || 1} {c.required_count === 1 ? 'document' : 'documents'}
                                                  </span>
                                                  <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                    Weight: {c.weight}
                                                  </span>
                                                  <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    Axis: {c.rating_axis || 'single'}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 shrink-0">
                                              <button
                                                onClick={() => {
                                                  setEditingCrit(c);
                                                  setCritForm({
                                                    code: c.code,
                                                    title: c.title,
                                                    area_id: c.area_id || '',
                                                    parent_criterion_id: c.parent_criterion_id || '',
                                                    weight: c.weight || 1,
                                                    required_count: c.required_count || 1,
                                                    expected_document_type: c.expected_document_type || '',
                                                    rating_axis: c.rating_axis || 'single',
                                                    framework_id: c.framework_id,
                                                  });
                                                  setIsCritModalOpen(true);
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                                                title="Edit Criterion"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setDeleteTarget({
                                                    type: 'criteria',
                                                    id: c.id,
                                                    name: `${c.code}: ${c.title}`,
                                                  })
                                                }
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Criterion"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>

                                          {/* Sub-level: Expected Exhibits & Verification Documents */}
                                          {c.expected_document_type && (
                                            <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                                              <div className="flex items-start gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 mt-1">
                                                  Expected Exhibits:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                  {c.expected_document_type.split('/').map((item, idx) => (
                                                    <span
                                                      key={idx}
                                                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50/80 text-amber-900 border border-amber-200/80 max-w-full"
                                                    >
                                                      <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                                                      <span className="truncate">{item.trim()}</span>
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: ACCREDITATION LEVELS */}
            {/* ============================================================== */}
            {activeTab === 'levels' && (
              <div className="h-full flex flex-col min-h-0">
                <div className="shrink-0 flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Accreditation Levels & Qualification Rules</h2>
                    <p className="text-xs text-gray-500">
                      Configure required score thresholds and optional criteria pool quotas (stored as data rows).
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingLevel(null);
                      setLevelForm({
                        label: 'Level III Undergraduate',
                        level_number: levels.length + 1,
                        min_score_threshold: 4.0,
                        required_optional_criteria_count: 2,
                        framework_id: selectedFrameworkId || frameworks[0]?.id || '',
                      });
                      setIsLevelModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Level</span>
                  </Button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold sticky top-0 z-10 border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">Seq #</th>
                        <th className="py-2.5 px-3">Level Label</th>
                        <th className="py-2.5 px-3">Min Score Threshold</th>
                        <th className="py-2.5 px-3">PACUCOA Floor Requirement</th>
                        <th className="py-2.5 px-3">Required Optional Pool Count</th>
                        <th className="py-2.5 px-3">Additional Criteria</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {levels.map((lvl) => {
                        const count = levelCriteria.filter((lc) => lc.level_id === lvl.id).length;
                        return (
                          <tr key={lvl.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-gray-400 font-mono font-bold">Level {lvl.level_number}</td>
                            <td className="py-2.5 px-3 font-bold text-gray-900">{lvl.label}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                {lvl.min_score_threshold ? lvl.min_score_threshold.toFixed(2) : 'No min score'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-xs font-medium">
                              {lvl.level_number === 1 && <span className="text-gray-500">General Average only (No Floor)</span>}
                              {lvl.level_number === 2 && <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">No section &lt; 3.00</span>}
                              {lvl.level_number === 3 && <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">No section &lt; 3.50</span>}
                              {lvl.level_number === 4 && <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">No criterion &lt; 4.00</span>}
                              {lvl.level_number === 5 && <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">No criterion &lt; 4.00</span>}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                                {lvl.required_optional_criteria_count ?? 0} Optional Required
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-600 font-semibold">{count} Defined Criteria</td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingLevel(lvl);
                                    setLevelForm({
                                      label: lvl.label,
                                      level_number: lvl.level_number,
                                      min_score_threshold: lvl.min_score_threshold ?? 3.0,
                                      required_optional_criteria_count: lvl.required_optional_criteria_count ?? 0,
                                      framework_id: lvl.framework_id,
                                    });
                                    setIsLevelModalOpen(true);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: 'levels', id: lvl.id, name: lvl.label })}
                                  className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: LEVEL-SPECIFIC CRITERIA */}
            {/* ============================================================== */}
            {activeTab === 'level_criteria' && (
              <div className="h-full flex flex-col min-h-0">
                <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Level-Specific Additional Criteria (Level III / IV)
                    </h2>
                    <p className="text-xs text-gray-500">
                      Mandatory & Optional pool criteria linked to dynamic Rating Scales.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLevelId}
                      onChange={(e) => setSelectedLevelId(e.target.value)}
                      className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-gray-800"
                    >
                      <option value="">All Levels ({levelCriteria.length})</option>
                      {levels.map((lvl) => {
                        const isLvl3 = lvl.level_number === 4 || lvl.label.includes('Level III');
                        const isLvl4 = lvl.level_number === 5 || lvl.label.includes('Level IV');
                        const count = isLvl3 ? 7 : isLvl4 ? 6 : 0;
                        return (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.label} ({count} Criteria{count === 0 ? ' — Core Areas Only' : ''})
                          </option>
                        );
                      })}
                    </select>

                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingLsc(null);
                        setLscForm({
                          level_id: selectedLevelId || levels[0]?.id || '',
                          code: '',
                          title: '',
                          description: '',
                          is_mandatory: true,
                          rating_scale_id: ratingScales[0]?.id || '',
                        });
                        setIsLscModalOpen(true);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Level Criterion</span>
                    </Button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  {filteredLevelCriteria.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        No Level-Specific Criteria for {levels.find((l) => l.id === selectedLevelId)?.label || 'Selected Level'}
                      </h3>
                      <p className="text-xs text-gray-500 max-w-lg mx-auto mb-4">
                        Per the PACUCOA Manual (Rev. Sept 2023), Candidate Status, Level I, and Level II evaluations are conducted strictly on the 10 Core Areas. Supplementary institutional criteria (such as research tradition, outreach, and licensure tracking) only apply to <strong>Level III (Section 10)</strong> and <strong>Level IV (Section 11)</strong> visits.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedLevelId('')}>
                          View All Levels ({levelCriteria.length})
                        </Button>
                        {levels.find((l) => l.level_number === 4 || l.label.includes('Level III')) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              const l3 = levels.find((l) => l.level_number === 4 || l.label.includes('Level III'));
                              if (l3) setSelectedLevelId(l3.id);
                            }}
                          >
                            View Level III Criteria (7)
                          </Button>
                        )}
                        {levels.find((l) => l.level_number === 5 || l.label.includes('Level IV')) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const l4 = levels.find((l) => l.level_number === 5 || l.label.includes('Level IV'));
                              if (l4) setSelectedLevelId(l4.id);
                            }}
                          >
                            View Level IV Criteria (6)
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold sticky top-0 z-10 border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Level</th>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Title & Standard</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Rating Scale Rubric</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredLevelCriteria.map((lc) => {
                          const scale = ratingScales.find((s) => s.id === lc.rating_scale_id);
                          const parentLevel = levels.find(
                            (l) =>
                              l.id === lc.level_id ||
                              (lc.code.startsWith('L3') && (l.level_number === 4 || l.label.includes('Level III'))) ||
                              (lc.code.startsWith('L4') && (l.level_number === 5 || l.label.includes('Level IV')))
                          );
                          return (
                            <tr key={lc.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-gray-900">
                                {parentLevel?.label || lc.accreditation_levels?.label || (lc.code.startsWith('L3') ? 'Level III' : 'Level IV')}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{lc.code}</td>
                              <td className="py-2.5 px-3">
                                <p className="font-medium text-gray-900">{lc.title}</p>
                                {lc.description && <p className="text-[11px] text-gray-500 mt-0.5">{lc.description}</p>}
                              </td>
                              <td className="py-2.5 px-3">
                                {lc.is_mandatory ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    Mandatory
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                                    Optional Pool
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-gray-700">
                                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-[11px]">
                                  {scale?.name || lc.rating_scales?.name || 'Standard 0-5'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingLsc(lc);
                                      setLscForm({
                                        level_id: lc.level_id,
                                        code: lc.code,
                                        title: lc.title,
                                        description: lc.description || '',
                                        is_mandatory: lc.is_mandatory,
                                        rating_scale_id: lc.rating_scale_id || '',
                                      });
                                      setIsLscModalOpen(true);
                                    }}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget({ type: 'level_criteria', id: lc.id, name: `${lc.code}: ${lc.title}` })}
                                    className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 6: RATING SCALES BUILDER */}
            {/* ============================================================== */}
            {activeTab === 'rating_scales' && (
              <div className="h-full flex flex-col min-h-0">
                <div className="shrink-0 flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Rating Scales & Rubrics (JSONB Definitions)</h2>
                    <p className="text-xs text-gray-500">
                      QA can define custom label-to-value mappings, percentage bands, and narrative evaluation levels.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingScale(null);
                      setScaleForm({
                        name: '',
                        description: '',
                        framework_id: selectedFrameworkId || frameworks[0]?.id || '',
                        scale_definition: [
                          { value: 5, label: 'Excellent', min_pct: 90, max_pct: 100 },
                          { value: 4, label: 'Very Good', min_pct: 80, max_pct: 89 },
                          { value: 3, label: 'Satisfactory', min_pct: 75, max_pct: 79 },
                          { value: 2, label: 'Fair', min_pct: 60, max_pct: 74 },
                          { value: 1, label: 'Poor', min_pct: 0, max_pct: 59 },
                        ],
                      });
                      setIsScaleModalOpen(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Rating Scale</span>
                  </Button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
                  {ratingScales.map((scale) => {
                    const items = scale.scale_definition || [];
                    return (
                      <div key={scale.id} className="border border-gray-200 rounded-xl p-3 bg-white shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">{scale.name}</h3>
                            <p className="text-[11px] text-gray-500">{scale.description || 'No description provided'}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingScale(scale);
                                setScaleForm({
                                  name: scale.name,
                                  description: scale.description || '',
                                  framework_id: scale.framework_id || '',
                                  scale_definition: scale.scale_definition || [],
                                });
                                setIsScaleModalOpen(true);
                              }}
                              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                              title="Edit Scale"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'rating_scales', id: scale.id, name: scale.name })}
                              className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete Scale"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Visual Breakdown of scale values */}
                        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {items.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                              <span className="text-xs font-mono font-bold text-primary block">
                                Score: {item.value}
                              </span>
                              <span className="text-[11px] font-bold text-gray-900 block truncate mt-0.5">
                                {item.label}
                              </span>
                              {item.min_pct !== undefined && item.max_pct !== undefined && (
                                <span className="text-[10px] text-gray-500 block font-mono">
                                  {item.min_pct}% - {item.max_pct}%
                                </span>
                              )}
                              {item.description && (
                                <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: FRAMEWORK MODAL */}
      {/* =================================================================== */}
      <Modal
        isOpen={isFwModalOpen}
        onClose={() => setIsFwModalOpen(false)}
        title={editingFw ? 'Edit Framework' : 'Create Accreditation Framework'}
      >
        <form onSubmit={handleSaveFramework} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Framework Name *</label>
            <Input
              type="text"
              placeholder="e.g. PACUCOA, ABET, AACCUP"
              value={fwForm.name}
              onChange={(e) => setFwForm({ ...fwForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Full description of the accreditation body and standard rubric guidelines..."
              value={fwForm.description}
              onChange={(e) => setFwForm({ ...fwForm, description: e.target.value })}
              className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsFwModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : editingFw ? 'Update Framework' : 'Create Framework'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 2: AREA MODAL */}
      {/* =================================================================== */}
      <Modal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        title={editingArea ? 'Edit Area & Weight' : 'Add Accreditation Area'}
      >
        <form onSubmit={handleSaveArea} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Area Code *</label>
              <Input
                type="text"
                placeholder="e.g. Area I, Standard 1"
                value={areaForm.code}
                onChange={(e) => setAreaForm({ ...areaForm, code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Display Order</label>
              <Input
                type="number"
                value={areaForm.display_order}
                onChange={(e) => setAreaForm({ ...areaForm, display_order: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Area Title *</label>
            <Input
              type="text"
              placeholder="e.g. Philosophy and Objectives"
              value={areaForm.title}
              onChange={(e) => setAreaForm({ ...areaForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Area Weight (Dynamic multiplier) *
            </label>
            <Input
              type="number"
              step="0.5"
              placeholder="e.g. 2.0, 3.0, 4.0"
              value={areaForm.weight}
              onChange={(e) => setAreaForm({ ...areaForm, weight: parseFloat(e.target.value) })}
              required
            />
            <div className="mt-2 bg-blue-50/80 border border-blue-200/80 rounded-lg p-2.5 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-950">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                PACUCOA Manual (Rev. Sept 2023) Official Area Weights:
              </p>
              <ul className="list-disc pl-4 text-[11px] text-blue-800 space-y-0.5">
                <li><strong>Area III (Instruction):</strong> 4.0 (Highest weighted area)</li>
                <li><strong>Area IX (Physical Plant & Facilities):</strong> 2.0 (Lowest weighted area)</li>
                <li><strong>All other 8 Areas:</strong> 3.0 each (Philosophy, Faculty, Lab, Research, Library, Student Services, Social Orientation, Admin)</li>
                <li><strong>Total Undergraduate Weight:</strong> 30.0 (Grand mean: Σ(Area Mean × Weight) ÷ 30)</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAreaModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : editingArea ? 'Update Area' : 'Add Area'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 2.5: CRITERION MODAL */}
      {/* =================================================================== */}
      <Modal
        isOpen={isCritModalOpen}
        onClose={() => setIsCritModalOpen(false)}
        title={editingCrit ? 'Edit Criterion' : 'Add Standard Criterion'}
      >
        <form onSubmit={handleSaveCriterion} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Criterion Code *</label>
              <Input
                type="text"
                placeholder="e.g. 1.1, 2.3.1"
                value={critForm.code}
                onChange={(e) => setCritForm({ ...critForm, code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Area *</label>
              <select
                value={critForm.area_id}
                onChange={(e) => setCritForm({ ...critForm, area_id: e.target.value })}
                className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select Area...</option>
                {fwAreas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code}: {a.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Criterion Title / Standard *</label>
            <Input
              type="text"
              placeholder="e.g. Formulation of Philosophy, Vision, Mission, and Objectives"
              value={critForm.title}
              onChange={(e) => setCritForm({ ...critForm, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Weight</label>
              <Input
                type="number"
                value={critForm.weight}
                onChange={(e) => setCritForm({ ...critForm, weight: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Required Count</label>
              <Input
                type="number"
                value={critForm.required_count}
                onChange={(e) => setCritForm({ ...critForm, required_count: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Expected Document Type (PACUCOA Exhibit)
            </label>
            <Input
              type="text"
              list="pacucoa-exhibits"
              placeholder="e.g. Institutional VMGO Document, Course Syllabus, Maintenance Log"
              value={critForm.expected_document_type}
              onChange={(e) => setCritForm({ ...critForm, expected_document_type: e.target.value })}
            />
            <datalist id="pacucoa-exhibits">
              <option value="Institutional VMGO Document" />
              <option value="Communication Memo / Orientation Material" />
              <option value="Transcript of Records / Diploma / Service Record" />
              <option value="HR Policy Document" />
              <option value="Training Needs Analysis / Development Plan" />
              <option value="Course Syllabus" />
              <option value="Sample Test Papers / Rubrics" />
              <option value="Curriculum Review Report" />
              <option value="Equipment Inventory / Lab Layout Plan" />
              <option value="Maintenance Log" />
              <option value="Research Manual" />
              <option value="Publication Record / Certificate" />
              <option value="Budget Report / Holdings List" />
              <option value="Staff Records" />
              <option value="Guidance Program Document" />
              <option value="Alumni Tracking Report" />
              <option value="Project Documentation / Report" />
              <option value="Community Profile" />
              <option value="Certificate of Occupancy / Fire Inspection Certificate" />
              <option value="Facility Inspection Report" />
              <option value="Administrative Manual" />
              <option value="Meeting Minutes" />
            </datalist>
            <p className="text-[10px] text-gray-500 mt-1">
              Official evidence exhibits drawn from Section 12 of the PACUCOA Manual (Undergraduate).
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCritModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : editingCrit ? 'Update Criterion' : 'Add Criterion'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 3: LEVEL MODAL */}
      {/* =================================================================== */}
      <Modal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        title={editingLevel ? 'Edit Accreditation Level' : 'Add Accreditation Level'}
      >
        <form onSubmit={handleSaveLevel} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Level Label *</label>
              <Input
                type="text"
                placeholder="e.g. Level III Undergraduate"
                value={levelForm.label}
                onChange={(e) => setLevelForm({ ...levelForm, label: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Sequence #</label>
              <Input
                type="number"
                value={levelForm.level_number}
                onChange={(e) => setLevelForm({ ...levelForm, level_number: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Minimum Score Threshold (0.00 - 5.00) *
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="e.g. 4.00"
              value={levelForm.min_score_threshold}
              onChange={(e) => setLevelForm({ ...levelForm, min_score_threshold: parseFloat(e.target.value) })}
              required
            />
            <div className="mt-2 bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                PACUCOA Manual (Rev. Sept 2023) Minimum Requirements (Section 5):
              </p>
              <ul className="list-disc pl-4 text-[11px] text-amber-900 space-y-0.5">
                <li><strong>Candidate Status:</strong> General average ≥ <strong>3.00</strong> (No floor requirement)</li>
                <li><strong>Level I Formal:</strong> General average ≥ <strong>3.00</strong>, with <em>no section below 3.00</em></li>
                <li><strong>Level II Reaccredited:</strong> General average ≥ <strong>3.50</strong>, with <em>no section below 3.50</em></li>
                <li><strong>Level III Reaccredited:</strong> General average ≥ <strong>4.00</strong>, with <em>no criterion below 4.00</em> (+ 2 optional criteria)</li>
                <li><strong>Level IV Accredited:</strong> General average ≥ <strong>4.00</strong>, with <em>no criterion below 4.00</em> (Mean ≥ 4.0 in all 6 criteria)</li>
              </ul>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Required Optional Criteria Count (N from pool) *
            </label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 2 for PACUCOA Level III, 0 for Level II"
              value={levelForm.required_optional_criteria_count}
              onChange={(e) =>
                setLevelForm({
                  ...levelForm,
                  required_optional_criteria_count: parseInt(e.target.value, 10) || 0,
                })
              }
              required
            />
            <p className="text-[10px] text-gray-500 mt-1">
              0 means no optional selection required. Set to 2 if the program head must select 2 of 4 optional items.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsLevelModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : editingLevel ? 'Update Level' : 'Add Level'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 4: LEVEL SPECIFIC CRITERION MODAL */}
      {/* =================================================================== */}
      <Modal
        isOpen={isLscModalOpen}
        onClose={() => setIsLscModalOpen(false)}
        title={editingLsc ? 'Edit Level Criterion' : 'Add Level-Specific Criterion'}
      >
        <form onSubmit={handleSaveLsc} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Level *</label>
              <select
                value={lscForm.level_id}
                onChange={(e) => setLscForm({ ...lscForm, level_id: e.target.value })}
                className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Criterion Code *</label>
              <Input
                type="text"
                placeholder="e.g. L3-M1, L3-O2"
                value={lscForm.code}
                onChange={(e) => setLscForm({ ...lscForm, code: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Title / Standard Statement *</label>
            <Input
              type="text"
              placeholder="e.g. Board Licensure Performance"
              value={lscForm.title}
              onChange={(e) => setLscForm({ ...lscForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description / Evidentiary Benchmark</label>
            <textarea
              rows={2}
              placeholder="Specific evidentiary requirements and percentage requirements..."
              value={lscForm.description}
              onChange={(e) => setLscForm({ ...lscForm, description: e.target.value })}
              className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mandatory vs Optional</label>
              <select
                value={lscForm.is_mandatory ? 'true' : 'false'}
                onChange={(e) => setLscForm({ ...lscForm, is_mandatory: e.target.value === 'true' })}
                className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="true">Mandatory Criterion</option>
                <option value="false">Optional Pool (Selection Required)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rating Scale Rubric</label>
              <select
                value={lscForm.rating_scale_id}
                onChange={(e) => setLscForm({ ...lscForm, rating_scale_id: e.target.value })}
                className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Standard 0-5 Scale</option>
                {ratingScales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsLscModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : editingLsc ? 'Update Criterion' : 'Add Criterion'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 5: RATING SCALE BUILDER MODAL */}
      {/* =================================================================== */}
      <Modal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        title={editingScale ? 'Edit Rating Scale' : 'Define New Rating Scale'}
      >
        <form onSubmit={handleSaveScale} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Rating Scale Name *</label>
            <Input
              type="text"
              placeholder="e.g. Percentage Band Scale (Passing Rates)"
              value={scaleForm.name}
              onChange={(e) => setScaleForm({ ...scaleForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <Input
              type="text"
              placeholder="Purpose and context of this rating scale..."
              value={scaleForm.description}
              onChange={(e) => setScaleForm({ ...scaleForm, description: e.target.value })}
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
            <span className="text-[11px] font-bold text-gray-700 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Load Official PACUCOA Manual Scale Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setScaleForm({
                    name: 'PACUCOA 0-5 Single-Axis Rating Scale',
                    description: 'The standard rating scale specified in the PACUCOA Manual of Accreditation (Rev. Sept 2023). Used across all 10 undergraduate areas.',
                    framework_id: selectedFrameworkId || frameworks[0]?.id || '',
                    scale_definition: [
                      { value: 5, label: 'Excellent', description: 'Provision is very extensive and functioning excellently' },
                      { value: 4, label: 'Very Good', description: 'Provision is moderately extensive and functioning very well' },
                      { value: 3, label: 'Good', description: 'Provision is adequate and functioning well' },
                      { value: 2, label: 'Fair', description: 'Provision is limited but functioning well' },
                      { value: 1, label: 'Poor', description: 'Provision is very limited and functioning poorly' },
                      { value: 0, label: 'Missing', description: 'Provision is missing but necessary' },
                      { value: -1, label: 'N.A. (Not Applicable)', description: 'Provision does not apply' },
                    ],
                  });
                }}
                className="px-2 py-1 bg-white border border-gray-300 hover:border-primary hover:text-primary rounded text-[11px] font-semibold transition-colors shadow-xs"
              >
                0–5 Self-Survey (Section 3)
              </button>
              <button
                type="button"
                onClick={() => {
                  setScaleForm({
                    name: 'Compliance Revisit Rating Scale',
                    description: 'Separate compliance-verification scale used for deferred programs undergoing revisit to evaluate progress on prior recommendations.',
                    framework_id: selectedFrameworkId || frameworks[0]?.id || '',
                    scale_definition: [
                      { value: 5, label: 'Full Compliance', description: 'Recommendation completely fulfilled with verifiable institutional outcomes' },
                      { value: 4, label: 'Very Satisfactory Partial Compliance', description: 'Significant compliance achieved or justified variation' },
                      { value: 3, label: 'Satisfactory Partial Compliance', description: 'Compliance at initial stage with evidence of near-future implementation' },
                      { value: 2, label: 'Unsatisfactory Partial Compliance', description: 'Minimal effort demonstrated with delayed outcomes' },
                      { value: 1, label: 'Non-Compliance', description: 'No demonstrable progress on recommendation' },
                    ],
                  });
                }}
                className="px-2 py-1 bg-white border border-gray-300 hover:border-primary hover:text-primary rounded text-[11px] font-semibold transition-colors shadow-xs"
              >
                Revisit Compliance (Section 7)
              </button>
              <button
                type="button"
                onClick={() => {
                  setScaleForm({
                    name: 'Level III/IV Supplementary Percentage Scale',
                    description: 'Percentage-banded rating scale used for evaluating Level III and Level IV supplementary institutional criteria.',
                    framework_id: selectedFrameworkId || frameworks[0]?.id || '',
                    scale_definition: [
                      { value: 5, label: 'Excellent', description: '95% to 100% compliance', min_pct: 95, max_pct: 100 },
                      { value: 4, label: 'Very Good / Outstanding', description: '90% to 94% compliance', min_pct: 90, max_pct: 94 },
                      { value: 3, label: 'Good', description: '85% to 89% compliance', min_pct: 85, max_pct: 89 },
                      { value: 2, label: 'Fair', description: '80% to 84% compliance', min_pct: 80, max_pct: 84 },
                      { value: 1, label: 'Poor', description: 'Below 80% compliance', min_pct: 0, max_pct: 79 },
                    ],
                  });
                }}
                className="px-2 py-1 bg-white border border-gray-300 hover:border-primary hover:text-primary rounded text-[11px] font-semibold transition-colors shadow-xs"
              >
                Level III/IV Percentage (Section 10)
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Score Tiers & Labels ({scaleForm.scale_definition.length})
              </label>
              <button
                type="button"
                onClick={addScaleItem}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Tier
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {scaleForm.scale_definition.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <div className="w-16">
                    <span className="text-[10px] text-gray-400 block">Value</span>
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => updateScaleItem(idx, 'value', Number(e.target.value))}
                      className="w-full text-xs p-1 border border-gray-200 rounded font-mono font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 block">Label</span>
                    <input
                      type="text"
                      placeholder="Label e.g. Excellent"
                      value={item.label}
                      onChange={(e) => updateScaleItem(idx, 'label', e.target.value)}
                      className="w-full text-xs p-1 border border-gray-200 rounded font-semibold"
                    />
                  </div>
                  <div className="w-16">
                    <span className="text-[10px] text-gray-400 block">Min %</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={item.min_pct ?? ''}
                      onChange={(e) => updateScaleItem(idx, 'min_pct', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs p-1 border border-gray-200 rounded font-mono text-[11px]"
                    />
                  </div>
                  <div className="w-16">
                    <span className="text-[10px] text-gray-400 block">Max %</span>
                    <input
                      type="number"
                      placeholder="100"
                      value={item.max_pct ?? ''}
                      onChange={(e) => updateScaleItem(idx, 'max_pct', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs p-1 border border-gray-200 rounded font-mono text-[11px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeScaleItem(idx)}
                    className="p-1 text-gray-400 hover:text-red-500 mt-3"
                    title="Remove Tier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsScaleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : editingScale ? 'Update Scale' : 'Save Scale'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 6: SQL MIGRATION HELPER */}
      {/* =================================================================== */}
      <Modal
        isOpen={showSqlModal}
        onClose={() => setShowSqlModal(false)}
        title="Database Migration Helper"
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            To enable the new dynamic tables (`rating_scales`, `level_specific_criteria`, `required_optional_criteria_count`),
            run the migration in your Supabase SQL editor.
          </p>
          <div className="bg-gray-900 text-gray-100 p-2.5 rounded-lg font-mono text-[11px] max-h-48 overflow-y-auto">
            {`ALTER TABLE accreditation_levels ADD COLUMN IF NOT EXISTS required_optional_criteria_count INT NOT NULL DEFAULT 0;
ALTER TABLE accreditation_areas ADD COLUMN IF NOT EXISTS weight NUMERIC NOT NULL DEFAULT 1.0;
ALTER TABLE accreditation_areas ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS rating_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES accreditation_frameworks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    scale_definition JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS level_specific_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID NOT NULL REFERENCES accreditation_levels(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    rating_scale_id UUID REFERENCES rating_scales(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-[11px] text-gray-500">File: supabase/migrations/MIGRATION_CONFIGURABLE_FRAMEWORK.sql</span>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `ALTER TABLE accreditation_levels ADD COLUMN IF NOT EXISTS required_optional_criteria_count INT NOT NULL DEFAULT 0;\nALTER TABLE accreditation_areas ADD COLUMN IF NOT EXISTS weight NUMERIC NOT NULL DEFAULT 1.0;\nALTER TABLE accreditation_areas ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;\n\nCREATE TABLE IF NOT EXISTS rating_scales (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    framework_id UUID REFERENCES accreditation_frameworks(id) ON DELETE CASCADE,\n    name TEXT NOT NULL,\n    description TEXT,\n    scale_definition JSONB NOT NULL DEFAULT '[]'::jsonb,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);\n\nCREATE TABLE IF NOT EXISTS level_specific_criteria (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    level_id UUID NOT NULL REFERENCES accreditation_levels(id) ON DELETE CASCADE,\n    code TEXT NOT NULL,\n    title TEXT NOT NULL,\n    description TEXT,\n    is_mandatory BOOLEAN NOT NULL DEFAULT true,\n    rating_scale_id UUID REFERENCES rating_scales(id) ON DELETE SET NULL,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);`
                );
                showToast('success', 'Migration SQL copied to clipboard');
              }}
              className="flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy SQL</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Any linked dependent data may be permanently removed.`}
        confirmLabel="Delete Record"
        variant="destructive"
        loading={submitting}
        onConfirm={executeDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
