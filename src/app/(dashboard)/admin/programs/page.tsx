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
import { Department, Program, Institution } from '@/lib/types';
import { logAuditEvent } from '@/lib/audit';
import {
  saveDepartment,
  deleteDepartment,
  saveProgram,
  deleteProgram,
  toggleProgramActiveScope,
} from '@/app/actions/academicActions';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  GraduationCap,
  ChevronRight,
  Layers,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AcademicRegistryPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Selection & Search
  const [selectedDeptId, setSelectedDeptId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Department Modal State (Create / Edit)
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [deptSubmitting, setDeptSubmitting] = useState(false);

  // Program Modal State (Create / Edit)
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [progForm, setProgForm] = useState({ name: '', code: '', department_id: '' });
  const [progSubmitting, setProgSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'dept' | 'prog';
    id: string;
    name: string;
    count?: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null); // programId being toggled

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [instRes, deptRes, progRes] = await Promise.all([
        supabase.from('institutions').select('*').limit(1),
        supabase.from('departments').select('*').order('code'),
        supabase.from('programs').select('*, departments(*)').order('code'),
      ]);

      if (instRes.data) setInstitutions(instRes.data as Institution[]);
      if (deptRes.data) setDepartments(deptRes.data as Department[]);
      if (progRes.data) setPrograms(progRes.data as Program[]);
    } catch (err: unknown) {
      console.error('Error fetching academic registry data:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Admin Guard (System Admin and QA Admin)
  if (user && !['system_admin', 'qa'].includes(user.role)) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md p-6 bg-white border border-red-200 rounded-xl">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 mt-1">
            Academic Registry and organization structure configuration are restricted to Administrators.
          </p>
        </div>
      </div>
    );
  }

  // Handle Department Create / Edit
  const openCreateDeptModal = () => {
    setEditingDept(null);
    setDeptForm({ name: '', code: '' });
    setIsDeptModalOpen(true);
  };

  const openEditDeptModal = (d: Department) => {
    setEditingDept(d);
    setDeptForm({ name: d.name, code: d.code });
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = deptForm.code.trim().toUpperCase();
    const trimmedName = deptForm.name.trim();

    if (!trimmedName || !trimmedCode) {
      showToast('error', 'Department name and code are required');
      return;
    }

    setDeptSubmitting(true);

    try {
      const instId = institutions[0]?.id;
      const res = await saveDepartment({
        id: editingDept?.id,
        name: trimmedName,
        code: trimmedCode,
        institution_id: instId,
      });

      if (!res.success) {
        showToast('error', res.error || 'Failed to save department');
        setDeptSubmitting(false);
        return;
      }

      if (editingDept) {
        await logAuditEvent('department_updated', 'departments', editingDept.id, {
          name: trimmedName,
          code: trimmedCode,
        });
        showToast('success', `Department [${trimmedCode}] updated successfully`);
      } else {
        if (res.data?.id) {
          await logAuditEvent('department_created', 'departments', res.data.id, {
            name: trimmedName,
            code: trimmedCode,
          });
          setSelectedDeptId(res.data.id);
        }
        showToast('success', `Department [${trimmedCode}] created successfully`);
      }

      setIsDeptModalOpen(false);
      setEditingDept(null);
      setDeptForm({ name: '', code: '' });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', msg || 'Failed to save department');
    } finally {
      setDeptSubmitting(false);
    }
  };

  // Handle Program Create / Edit
  const openCreateProgModal = (deptId?: string) => {
    setEditingProg(null);
    setProgForm({
      name: '',
      code: '',
      department_id: deptId && deptId !== 'all' ? deptId : departments[0]?.id || '',
    });
    setIsProgModalOpen(true);
  };

  const openEditProgModal = (p: Program) => {
    setEditingProg(p);
    setProgForm({
      name: p.name,
      code: p.code,
      department_id: p.department_id,
    });
    setIsProgModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = progForm.code.trim().toUpperCase();
    const trimmedName = progForm.name.trim();

    if (!trimmedName || !trimmedCode || !progForm.department_id) {
      showToast('error', 'Program code, full title, and department are required');
      return;
    }

    setProgSubmitting(true);

    try {
      const res = await saveProgram({
        id: editingProg?.id,
        name: trimmedName,
        code: trimmedCode,
        department_id: progForm.department_id,
        is_accreditation_active: editingProg ? editingProg.is_accreditation_active : true,
      });

      if (!res.success) {
        showToast('error', res.error || 'Failed to save program');
        setProgSubmitting(false);
        return;
      }

      if (editingProg) {
        await logAuditEvent('program_updated', 'programs', editingProg.id, {
          name: trimmedName,
          code: trimmedCode,
        });
        showToast('success', `Program [${trimmedCode}] updated successfully`);
      } else {
        if (res.data?.id) {
          await logAuditEvent('program_created', 'programs', res.data.id, {
            name: trimmedName,
            code: trimmedCode,
          });
          setSelectedDeptId(progForm.department_id);
        }
        showToast('success', `Program [${trimmedCode}] registered successfully`);
      }

      setIsProgModalOpen(false);
      setEditingProg(null);
      setProgForm({ name: '', code: '', department_id: '' });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', msg || 'Failed to save program');
    } finally {
      setProgSubmitting(false);
    }
  };

  // Toggle Accreditation Active/Inactive
  const handleToggleActive = async (prog: Program) => {
    setToggleLoading(prog.id);
    const newState = !prog.is_accreditation_active;
    try {
      const res = await toggleProgramActiveScope(prog.id, newState);
      if (!res.success) {
        throw new Error(res.error || 'Failed to update program status');
      }

      await logAuditEvent(
        newState ? 'program_activated' : 'program_deactivated',
        'programs',
        prog.id,
        { code: prog.code, name: prog.name, is_accreditation_active: newState }
      );

      showToast(
        'success',
        newState
          ? `${prog.code} is now Active — included in the accreditation cycle`
          : `${prog.code} set to Out of Cycle — excluded from active accreditation`
      );
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', msg || 'Failed to update program status');
    } finally {
      setToggleLoading(null);
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'dept') {
        const res = await deleteDepartment(deleteTarget.id);
        if (!res.success) {
          showToast('error', res.error || 'Failed to delete department');
          setIsDeleting(false);
          setDeleteTarget(null);
          return;
        }

        await logAuditEvent('department_deleted', 'departments', deleteTarget.id, {
          name: deleteTarget.name,
        });

        showToast('success', `Department "${deleteTarget.name}" deleted`);
        if (selectedDeptId === deleteTarget.id) {
          setSelectedDeptId('all');
        }
      } else {
        const res = await deleteProgram(deleteTarget.id);
        if (!res.success) {
          showToast('error', res.error || 'Failed to delete program');
          setIsDeleting(false);
          setDeleteTarget(null);
          return;
        }

        await logAuditEvent('program_deleted', 'programs', deleteTarget.id, {
          name: deleteTarget.name,
        });

        showToast('success', `Program "${deleteTarget.name}" deleted`);
      }

      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', msg || 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Active Department Object
  const currentDept = departments.find((d) => d.id === selectedDeptId);

  // Programs filtered by selected department and search
  const visiblePrograms = programs.filter((p) => {
    const matchesDept = selectedDeptId === 'all' || p.department_id === selectedDeptId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Top Action Header */}
      <div className="shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Academic Registry</h1>
            <p className="text-[11px] text-gray-500 leading-tight">
              Manage Colleges / Departments and the Academic Degree Programs under them
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={openCreateDeptModal}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Department
          </Button>

          <Button
            size="sm"
            onClick={() => openCreateProgModal(selectedDeptId !== 'all' ? selectedDeptId : undefined)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Program
          </Button>
        </div>
      </div>

      {/* Split Console: Departments (Left Pane) & Programs in Department (Right Pane) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-2.5 overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT PANE: DEPARTMENTS LIST & CONTROLS (4 cols)                            */}
        {/* ========================================================================= */}
        <div className="md:col-span-4 flex flex-col min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Pane Header */}
          <div className="p-3 border-b border-gray-200 shrink-0 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-gray-500" />
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Departments / Colleges ({departments.length})
              </h2>
            </div>
            <button
              onClick={openCreateDeptModal}
              className="p-1 rounded text-gray-500 hover:text-primary hover:bg-gray-200/60 transition-colors"
              title="Add Department"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Department List */}
          {loading ? (
            <div className="p-3">
              <TableSkeleton rows={5} cols={2} />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100">
              {/* All Programs Tab Option */}
              <div
                onClick={() => setSelectedDeptId('all')}
                className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                  selectedDeptId === 'all'
                    ? 'bg-primary/10 border-l-4 border-primary text-primary font-bold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedDeptId === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate font-semibold">All Colleges & Programs</p>
                    <p className="text-[10px] text-gray-400 font-normal">Institution-wide directory</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono font-bold">
                  {programs.length}
                </span>
              </div>

              {/* Department Items */}
              {departments.map((dept) => {
                const isSelected = selectedDeptId === dept.id;
                const deptProgs = programs.filter((p) => p.department_id === dept.id);

                return (
                  <div
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`p-3 cursor-pointer transition-colors group flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50/80 border-l-4 border-purple-600 text-purple-950 font-medium'
                        : 'hover:bg-gray-50/80 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 group-hover:bg-purple-100 group-hover:text-purple-700'
                        }`}
                      >
                        {dept.code}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">{dept.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-normal">
                          <span>{deptProgs.length} Program{deptProgs.length === 1 ? '' : 's'}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">
                            {deptProgs.filter((p) => p.is_accreditation_active !== false).length} Active
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Department Actions (Edit & Delete) */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditDeptModal(dept)}
                        className="p-1 rounded text-gray-400 hover:text-primary hover:bg-gray-200/60 transition-colors"
                        title={`Edit Department ${dept.code}`}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'dept',
                            id: dept.id,
                            name: `${dept.code} - ${dept.name}`,
                            count: deptProgs.length,
                          })
                        }
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title={`Delete Department ${dept.code}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <ChevronRight className={`w-3.5 h-3.5 ml-0.5 ${isSelected ? 'text-purple-600' : 'text-gray-300'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Left Footer */}
          <div className="p-2 border-t border-gray-200 bg-gray-50/50 shrink-0 text-center">
            <button
              onClick={openCreateDeptModal}
              className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Another Department
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: PROGRAMS INSIDE SELECTED DEPARTMENT (8 cols)                  */}
        {/* ========================================================================= */}
        <div className="md:col-span-8 flex flex-col min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header of Right Pane */}
          <div className="p-3 border-b border-gray-200 shrink-0 flex flex-wrap items-center justify-between gap-2.5 bg-gray-50/70">
            <div className="flex items-center gap-2 min-w-0">
              <GraduationCap className="w-4 h-4 text-purple-700 shrink-0" />
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-gray-900 truncate">
                  {currentDept ? (
                    <>
                      <span className="font-mono text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded mr-1.5">
                        {currentDept.code}
                      </span>
                      {currentDept.name}
                    </>
                  ) : (
                    'All Academic Degree Programs'
                  )}
                </h2>
                <p className="text-[10px] text-gray-500">
                  {currentDept
                    ? `Showing degree programs managed under the ${currentDept.code} department`
                    : 'Showing all academic degree programs across the institution'}
                </p>
              </div>
            </div>

            {/* Program Search & Add */}
            <div className="flex items-center gap-2">
              <div className="relative w-40 sm:w-56">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <Button
                size="sm"
                onClick={() => openCreateProgModal(selectedDeptId !== 'all' ? selectedDeptId : undefined)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Program
              </Button>
            </div>
          </div>

          {/* Department Details Strip when department is selected */}
          {currentDept && (
            <div className="shrink-0 bg-purple-50/50 border-b border-purple-100 px-3.5 py-1.5 flex items-center justify-between text-xs text-purple-900">
              <div className="flex items-center gap-3">
                <span>
                  College Code: <strong className="font-mono">{currentDept.code}</strong>
                </span>
                <span>•</span>
                <span>
                  Programs in Dept:{' '}
                  <strong>{programs.filter((p) => p.department_id === currentDept.id).length}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditDeptModal(currentDept)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Edit College Info
                </button>
                <span>•</span>
                <button
                  onClick={() =>
                    setDeleteTarget({
                      type: 'dept',
                      id: currentDept.id,
                      name: `${currentDept.code} - ${currentDept.name}`,
                      count: programs.filter((p) => p.department_id === currentDept.id).length,
                    })
                  }
                  className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete College
                </button>
              </div>
            </div>
          )}

          {/* Programs Table */}
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={6} cols={4} />
            </div>
          ) : visiblePrograms.length === 0 ? (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">No Programs Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {currentDept
                  ? `There are currently no degree programs registered under ${currentDept.code} (${currentDept.name}).`
                  : 'No degree programs match your current search.'}
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => openCreateProgModal(selectedDeptId !== 'all' ? selectedDeptId : undefined)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Register Program under {currentDept?.code || 'Department'}
              </Button>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 z-10">
                  <tr className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-3.5 py-2">Code</th>
                    <th className="px-3.5 py-2">Program Title</th>
                    {selectedDeptId === 'all' && <th className="px-3.5 py-2">College</th>}
                    <th className="px-3.5 py-2">Accreditation Scope</th>
                    <th className="px-3.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {visiblePrograms.map((prog) => {
                    const dept = departments.find((d) => d.id === prog.department_id);
                    const isActiveScope = prog.is_accreditation_active !== false;

                    return (
                      <tr key={prog.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-3.5 py-2.5 font-mono font-bold text-gray-900">
                          {prog.code}
                        </td>
                        <td className="px-3.5 py-2.5 font-medium text-gray-900">
                          {prog.name}
                        </td>
                        {selectedDeptId === 'all' && (
                          <td className="px-3.5 py-2.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                              <FolderTree className="w-3 h-3 text-gray-400" />
                              {dept?.code || '—'}
                            </span>
                          </td>
                        )}
                        <td className="px-3.5 py-2.5">
                          {isActiveScope ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active Cycle
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-gray-200">
                              <XCircle className="w-3 h-3 text-gray-400" />
                              Out of Cycle (Archive)
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Toggle Active / Inactive */}
                            <button
                              onClick={() => handleToggleActive(prog)}
                              disabled={toggleLoading === prog.id}
                              className={`p-1 rounded transition-colors ${
                                isActiveScope
                                  ? 'text-emerald-600 hover:text-orange-600 hover:bg-orange-50'
                                  : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={isActiveScope ? 'Deactivate — remove from accreditation cycle' : 'Activate — include in accreditation cycle'}
                            >
                              {toggleLoading === prog.id ? (
                                <span className="w-3.5 h-3.5 block animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                              ) : isActiveScope ? (
                                <ToggleRight className="w-4 h-4" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => openEditProgModal(prog)}
                              className="p-1 rounded text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
                              title="Edit Program"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'prog',
                                  id: prog.id,
                                  name: `${prog.code} - ${prog.name}`,
                                })
                              }
                              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Program"
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
          )}

          {/* Right Footer Stats */}
          <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-3.5 py-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>
              Showing <strong className="text-gray-800">{visiblePrograms.length}</strong> of{' '}
              <strong className="text-gray-800">{programs.length}</strong> degree programs
            </span>
            <span className="text-[10px] text-gray-400 italic">
              System Admin manages academic structure; QA determines active accreditation scope.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEPARTMENT MODAL (Create & Edit)                                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => {
          setIsDeptModalOpen(false);
          setEditingDept(null);
        }}
        title={editingDept ? `Edit Department: ${editingDept.code}` : 'Create College / Department'}
      >
        <form onSubmit={handleSaveDepartment} className="space-y-4">
          <Input
            label="Department / College Code"
            placeholder="e.g. CICT, CBA, COE, CAS"
            required
            value={deptForm.code}
            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
          />
          <Input
            label="Department / College Full Title"
            placeholder="e.g. College of Information and Communications Technology"
            required
            value={deptForm.name}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsDeptModalOpen(false);
                setEditingDept(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={deptSubmitting}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* PROGRAM MODAL (Create & Edit)                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isProgModalOpen}
        onClose={() => {
          setIsProgModalOpen(false);
          setEditingProg(null);
        }}
        title={editingProg ? `Edit Program: ${editingProg.code}` : 'Register New Academic Program'}
      >
        <form onSubmit={handleSaveProgram} className="space-y-4">
          <Input
            label="Program Degree Code"
            placeholder="e.g. BSIT, BSCS, BSA, BSBA"
            required
            value={progForm.code}
            onChange={(e) => setProgForm({ ...progForm, code: e.target.value })}
          />
          <Input
            label="Program Full Degree Title"
            placeholder="e.g. Bachelor of Science in Information Technology"
            required
            value={progForm.name}
            onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Parent College / Department
            </label>
            <select
              value={progForm.department_id}
              onChange={(e) => setProgForm({ ...progForm, department_id: e.target.value })}
              className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
              required
            >
              <option value="" disabled>
                Select Department...
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} — {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsProgModalOpen(false);
                setEditingProg(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={progSubmitting}>
              {editingProg ? 'Save Changes' : 'Register Program'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* CONFIRM DELETE DIALOG                                                     */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'dept' ? 'College / Department' : 'Academic Program'}`}
        message={
          deleteTarget?.type === 'dept' && (deleteTarget.count || 0) > 0
            ? `Warning: "${deleteTarget.name}" contains ${deleteTarget.count} program(s). You must delete or reassign all programs inside this department before it can be deleted.`
            : `Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmLabel={deleteTarget?.type === 'dept' && (deleteTarget.count || 0) > 0 ? 'Close' : 'Delete'}
        variant="destructive"
        loading={isDeleting}
        onConfirm={
          deleteTarget?.type === 'dept' && (deleteTarget.count || 0) > 0
            ? () => setDeleteTarget(null)
            : confirmDelete
        }
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
