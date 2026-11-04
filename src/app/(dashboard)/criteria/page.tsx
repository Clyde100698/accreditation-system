'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ui/Toast';
import { AccreditationCriterion } from '@/lib/types';
import { logAuditEvent } from '@/lib/audit';
import { Plus, Pencil, Trash2, FileText, ChevronRight, ChevronDown, FolderTree, List, ChevronsUpDown, Search } from 'lucide-react';
import { buildCriteriaTree, CriterionTreeNode } from '@/lib/scoring';

function CriteriaRow({
  node,
  depth = 0,
  onEdit,
  onDelete
}: {
  node: CriterionTreeNode;
  depth?: number;
  onEdit: (c: AccreditationCriterion) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50/70 transition-colors border-b border-gray-100">
        <td className="px-3.5 py-2 flex items-center gap-1.5">
          <div style={{ marginLeft: `${depth * 1.25}rem` }} className="flex items-center">
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-gray-400 hover:text-gray-700">
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-5" /> // spacer
            )}
            <span className="text-xs font-mono font-semibold text-gray-900">{node.code}</span>
          </div>
        </td>
        <td className="px-3.5 py-2">
          <p className="text-xs text-gray-900 font-medium">{node.title}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{node.accreditation_areas?.code || 'No Area Assigned'}</p>
        </td>
        <td className="px-3.5 py-2">
          {hasChildren && <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Container</span>}
        </td>
        <td className="px-3.5 py-2 text-xs text-gray-600">{node.weight}</td>
        <td className="px-3.5 py-2 text-xs text-gray-600">{!hasChildren ? node.required_count : '—'}</td>
        <td className="px-3.5 py-2 text-xs text-gray-600">{node.expected_document_type || '—'}</td>
        <td className="px-3.5 py-2 text-xs text-gray-600">{node.rating_axis ? node.rating_axis : 'single'}</td>
        <td className="px-3.5 py-2 text-right">
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => onEdit(node)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(node.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && hasChildren && node.children.map((child: CriterionTreeNode) => (
        <CriteriaRow key={child.id} node={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  );
}

export default function CriteriaPage() {
  const { user, loading: authLoading } = useAuth();
  const [criteria, setCriteria] = useState<AccreditationCriterion[]>([]);
  const [areas, setAreas] = useState<{ id: string, code: string, title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<AccreditationCriterion | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  // Delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Hierarchy & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');
  const [expandedAreaIds, setExpandedAreaIds] = useState<Set<string>>(new Set());

  const toggleArea = (id: string) => {
    setExpandedAreaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = (allAreas: { id: string }[]) => {
    setExpandedAreaIds(new Set(allAreas.map((a) => a.id)));
  };

  const collapseAll = () => {
    setExpandedAreaIds(new Set());
  };

  // Form state
  const [form, setForm] = useState({
    code: '',
    title: '',
    weight: '1.0',
    required_count: '1',
    expected_document_type: '',
    program_id: '',
    area_id: '',
    parent_criterion_id: '',
    rating_axis: '',
  });

  const fetchCriteria = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('accreditation_criteria')
        .select('*, programs(*), accreditation_areas(id, code, title)')
        .order('code');
      if (data) setCriteria(data as AccreditationCriterion[]);
    } catch (err: unknown) {
      console.error('Error fetching criteria:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchAreas = useCallback(async () => {
    try {
      const { data } = await supabase.from('accreditation_areas').select('id, code, title').order('display_order');
      if (data) {
        setAreas(data);
        setExpandedAreaIds((prev) => (prev.size === 0 ? new Set(data.map((a) => a.id)) : prev));
      }
    } catch (err: unknown) {
      console.error('Error fetching areas:', err);
    }
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchCriteria();
      fetchAreas();
    }
  }, [user, fetchCriteria, fetchAreas]);

  const resetForm = () => {
    setForm({ code: '', title: '', weight: '1.0', required_count: '1', expected_document_type: '', program_id: '', area_id: '', parent_criterion_id: '', rating_axis: '' });
    setEditingCriterion(null);
    setFormError(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (criterion: AccreditationCriterion) => {
    setEditingCriterion(criterion);
    setForm({
      code: criterion.code,
      title: criterion.title,
      weight: String(criterion.weight),
      required_count: String(criterion.required_count),
      expected_document_type: criterion.expected_document_type || '',
      program_id: criterion.program_id || '',
      area_id: criterion.area_id || '',
      parent_criterion_id: criterion.parent_criterion_id || '',
      rating_axis: criterion.rating_axis || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const { data: fw } = await supabase.from('accreditation_frameworks').select('id').limit(1).maybeSingle();
      const frameworkId = fw?.id;

      if (!frameworkId) {
        throw new Error('No accreditation framework found in database.');
      }

      const payload = {
        framework_id: frameworkId,
        code: form.code,
        title: form.title,
        weight: parseFloat(form.weight) || 1.0,
        required_count: parseInt(form.required_count) || 1,
        expected_document_type: form.expected_document_type || null,
        program_id: form.program_id || null,
        area_id: form.area_id || null,
        parent_criterion_id: form.parent_criterion_id || null,
        rating_axis: (form.rating_axis as 'adequacy' | 'effectiveness' | 'both' | 'single') || null,
        created_by: user!.id,
      };

      if (editingCriterion) {
        const { error } = await supabase.from('accreditation_criteria').update(payload).eq('id', editingCriterion.id);
        if (error) throw error;

        await logAuditEvent(supabase, {
          userId: user!.id,
          action: 'criterion_edited',
          entityType: 'accreditation_criteria',
          entityId: editingCriterion.id,
          metadata: {
            code: payload.code,
            title: payload.title,
            weight: payload.weight,
          }
        });
      } else {
        const { data: insertedCrit, error } = await supabase.from('accreditation_criteria').insert(payload).select('id').single();
        if (error) throw error;

        await logAuditEvent(supabase, {
          userId: user!.id,
          action: 'criterion_created',
          entityType: 'accreditation_criteria',
          entityId: insertedCrit?.id,
          metadata: {
            code: payload.code,
            title: payload.title,
            weight: payload.weight,
          }
        });
      }

      showToast('success', editingCriterion ? 'Criterion updated successfully.' : 'New criterion added successfully.');
      setIsModalOpen(false);
      resetForm();
      fetchCriteria();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save criterion');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    const targetToDelete = criteria.find(c => c.id === deleteTargetId);

    try {
      const { error } = await supabase.from('accreditation_criteria').delete().eq('id', deleteTargetId);
      if (error) throw error;
      await logAuditEvent(supabase, {
        userId: user!.id,
        action: 'criterion_deleted',
        entityType: 'accreditation_criteria',
        entityId: deleteTargetId,
        metadata: {
          code: targetToDelete?.code,
          title: targetToDelete?.title,
        }
      });
      showToast('success', 'Criterion deleted.');
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      fetchCriteria();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete criterion');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !user) return <TableSkeleton rows={5} cols={5} />;

  if (user.role !== 'qa') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FileText className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold">Access Restricted</p>
        <p className="text-sm mt-1">Only QA Admins can manage criteria configuration.</p>
      </div>
    );
  }

  const filteredCriteria = criteria.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.expected_document_type && c.expected_document_type.toLowerCase().includes(q))
    );
  });

  const { roots } = buildCriteriaTree(filteredCriteria);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Header Toolbar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
        <div>
          <h1 className="text-base font-bold text-gray-900">Criteria Hierarchy & Requirements</h1>
          <p className="text-xs text-gray-500">PACUCOA 10 Areas hierarchy mapped to specific criteria, required counts, and expected exhibits.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search criteria or exhibits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-56 bg-white"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                viewMode === 'hierarchy'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Hierarchical Tree view grouped by PACUCOA Areas"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Hierarchy</span>
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                viewMode === 'flat'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Flat tabular list"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Expand / Collapse All (in Hierarchy mode) */}
          {viewMode === 'hierarchy' && (
            <button
              onClick={() => {
                if (expandedAreaIds.size === areas.length) {
                  collapseAll();
                } else {
                  expandAll(areas);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              title={expandedAreaIds.size === areas.length ? 'Collapse All Areas' : 'Expand All Areas'}
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-gray-500" />
              <span>{expandedAreaIds.size === areas.length ? 'Collapse All' : 'Expand All'}</span>
            </button>
          )}

          <Button size="sm" onClick={openAddModal}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Criterion
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-4">
          <TableSkeleton rows={8} cols={6} />
        </div>
      ) : filteredCriteria.length === 0 ? (
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-gray-700 font-semibold text-sm">No criteria match your filter</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">Click &quot;Add Criterion&quot; above to define a new PACUCOA criterion.</p>
        </div>
      ) : viewMode === 'flat' ? (
        /* FLAT TABLE VIEW */
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr>
                  <th className="px-3.5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-3.5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / Area</th>
                  <th className="px-3.5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3.5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-3.5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Required</th>
                  <th className="px-3.5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Exhibit</th>
                  <th className="px-3.5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-3.5 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roots.map((root) => (
                  <CriteriaRow key={root.id} node={root} onEdit={openEditModal} onDelete={openDeleteConfirm} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* HIERARCHICAL TREE LAYOUT */
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 space-y-3 pb-6">
          {areas.map((area) => {
            const areaCriteria = filteredCriteria.filter((c) => c.area_id === area.id);
            if (searchQuery && areaCriteria.length === 0) return null;
            const isExpanded = expandedAreaIds.has(area.id);

            return (
              <div
                key={area.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs transition-all"
              >
                {/* Area Header Accordion */}
                <div
                  onClick={() => toggleArea(area.id)}
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
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {areaCriteria.length} {areaCriteria.length === 1 ? 'Criterion' : 'Criteria'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm({
                          code: '',
                          title: '',
                          weight: '1.0',
                          required_count: '1',
                          expected_document_type: '',
                          program_id: '',
                          area_id: area.id,
                          parent_criterion_id: '',
                          rating_axis: 'single',
                        });
                        setEditingCriterion(null);
                        setFormError(null);
                        setIsModalOpen(true);
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
                                        Required: {c.required_count || 1} {c.required_count === 1 ? 'doc' : 'docs'}
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
                                    onClick={() => openEditModal(c)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                                    title="Edit Criterion"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteConfirm(c.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete Criterion"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Sub-level: Expected Exhibits */}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCriterion ? 'Edit Criterion' : 'Add New Criterion'}
        size="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
              {formError}
            </div>
          )}

          {/* Section 1: Criterion Identification */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Criterion Hierarchy & Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Criterion Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. Area II, Parameter 1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Parent Criterion
                </label>
                <select
                  value={form.parent_criterion_id}
                  onChange={(e) => setForm({ ...form, parent_criterion_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">-- Top-Level Node (No Parent) --</option>
                  {criteria.filter(c => c.id !== editingCriterion?.id).map((c) => (
                    <option key={c.id} value={c.id}>[{c.code}] {c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Title / Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g. Academic Qualification and Professional Experiences"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Accreditation Area
              </label>
              <select
                value={form.area_id}
                onChange={(e) => setForm({ ...form, area_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">-- Inherit from Parent / No Area --</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} — {a.title}</option>
                ))}
              </select>
            </div>
          </div>


          {/* Section 2: Scoring & Requirements */}
          <div className="space-y-4 pt-2">
            <div className="pb-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                PACUCOA Scoring & Evidence Rules
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                For container nodes with sub-parameters, aggregate scores calculate automatically from child items.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Criterion Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Required Evidence Count
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.required_count}
                  onChange={(e) => setForm({ ...form, required_count: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expected Document Type
                </label>
                <input
                  type="text"
                  value={form.expected_document_type}
                  onChange={(e) => setForm({ ...form, expected_document_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. Diploma/Transcript, PRC License"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Rating Axis
                </label>
                <select
                  value={form.rating_axis || 'single'}
                  onChange={(e) => setForm({ ...form, rating_axis: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="single">Single-Axis 0–5 (PACUCOA Official Scale)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
            >
              {editingCriterion ? 'Save Changes' : 'Add Criterion'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setDeleteTargetId(null); }}
        onConfirm={handleDelete}
        title="Delete this criterion?"
        message="This will permanently remove the criterion and may affect linked evidence and readiness scores. This cannot be undone."
        confirmLabel="Yes, Delete"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
