'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ui/Toast';
import { AccreditationArea, AreaAssignment, Program, User } from '@/lib/types';
import { Users, UserPlus, Trash2, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  getAreaAssignments,
  getDepartmentUsers,
  assignPersonnelAction,
  removePersonnelAction,
  createAreaAction,
} from '@/app/actions/areaActions';

export default function AreasPage() {
  const { user, loading: authLoading } = useAuth();
  const [areas, setAreas] = useState<AccreditationArea[]>([]);
  const [assignments, setAssignments] = useState<AreaAssignment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Modal state for assignments
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AccreditationArea | null>(null);
  const [formType, setFormType] = useState<'area_chair' | 'co_chair' | 'member'>('area_chair');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Add Area modal state
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  const [newAreaCode, setNewAreaCode] = useState('');
  const [newAreaTitle, setNewAreaTitle] = useState('');
  const [areaSubmitting, setAreaSubmitting] = useState(false);

  // Delete confirm state
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch Areas
      const { data: areasData } = await supabase.from('accreditation_areas').select('*').order('display_order');
      if (areasData) setAreas(areasData as AccreditationArea[]);

      // Fetch Programs
      const { data: progs } = await supabase.from('programs').select('*').order('code');
      if (progs && progs.length > 0) {
        setPrograms(progs);
        if (!selectedProgram) {
          const userProg = (user.role === 'program_head' && user.program_id)
            ? progs.find((p) => p.id === user.program_id)?.id || progs[0].id
            : progs[0].id;
          setSelectedProgram(userProg);
        }
      }

      // Fetch Users in this department for assignment dropdown using server action
      const usersRes = await getDepartmentUsers(user.department_id);
      if (usersRes.success && usersRes.data) {
        setAvailableUsers(usersRes.data);
      }
    } catch (err: unknown) {
      console.error('Error fetching areas data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedProgram, supabase]);

  const fetchAssignments = useCallback(async () => {
    if (!selectedProgram) return;
    try {
      const res = await getAreaAssignments(selectedProgram);
      if (res.success && res.data) {
        setAssignments(res.data);
      } else {
        console.error('Error fetching assignments:', res.error);
      }
    } catch (err: unknown) {
      console.error('Error fetching assignments:', err);
    }
  }, [selectedProgram]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const openAssignModal = (area: AccreditationArea, type: 'area_chair' | 'co_chair' | 'member') => {
    setSelectedArea(area);
    setFormType(type);
    setSelectedUserId('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaCode.trim() || !newAreaTitle.trim() || !user) {
      showToast('error', 'Area Code and Title are required');
      return;
    }
    setAreaSubmitting(true);
    try {
      const res = await createAreaAction({
        code: newAreaCode.trim(),
        title: newAreaTitle.trim(),
        createdBy: user.id,
      });
      if (!res.success) throw new Error(res.error || 'Failed to create area');
      showToast('success', `Area "${newAreaCode.trim()}" created successfully!`);
      setIsAddAreaModalOpen(false);
      setNewAreaCode('');
      setNewAreaTitle('');
      fetchData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create area');
    } finally {
      setAreaSubmitting(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedArea || !selectedUserId || !selectedProgram) return;
    setSubmitting(true);
    setFormError(null);

    // Check if user is already assigned to this area+program
    const existing = assignments.find(a => a.area_id === selectedArea.id && a.user_id === selectedUserId);
    if (existing) {
      setFormError('This person is already assigned to this area.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await assignPersonnelAction({
        areaId: selectedArea.id,
        programId: selectedProgram,
        userId: selectedUserId,
        assignmentType: formType,
        assignedBy: user.id,
      });

      if (!res.success) throw new Error(res.error || 'Failed to assign personnel');

      showToast('success', `${formType === 'area_chair' ? 'Area Chair' : formType === 'co_chair' ? 'Co-Chair' : 'Member'} assigned successfully.`);
      setIsModalOpen(false);
      fetchAssignments();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to assign user to area');
    } finally {
      setSubmitting(false);
    }
  };

  const openRemoveConfirm = (assignmentId: string) => {
    setRemoveTargetId(assignmentId);
    setRemoveConfirmOpen(true);
  };

  const handleRemove = async () => {
    if (!removeTargetId || !user) return;
    setRemoving(true);

    try {
      const res = await removePersonnelAction({
        assignmentId: removeTargetId,
        removedBy: user.id,
      });
      if (!res.success) throw new Error(res.error || 'Failed to remove assignment');
      showToast('success', 'Assignment removed.');
      setRemoveConfirmOpen(false);
      setRemoveTargetId(null);
      fetchAssignments();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to remove assignment');
    } finally {
      setRemoving(false);
    }
  };

  if (authLoading || !user) return <TableSkeleton rows={5} cols={4} />;

  if (!['qa', 'program_head', 'system_admin'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Users className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold">Access Restricted</p>
        <p className="text-sm mt-1">Only QA Admins, Program Heads, and System Admins can manage area assignments.</p>
      </div>
    );
  }

  const selectedProgObj = programs.find((p) => p.id === selectedProgram);
  const isSelectedProgInactive = selectedProgObj?.is_accreditation_active === false;

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      <div className="shrink-0 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5">
        <div>
          <h1 className="text-base font-bold text-gray-900">Areas & Chairs</h1>
          <p className="text-xs text-gray-500">Assign Area Chairs and Co-Chairs for each PACUCOA area.</p>
        </div>
        <div className="flex items-center gap-2.5">
          {programs.length > 1 && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-medium text-gray-700">Program:</span>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="text-xs border-none focus:ring-0 p-0 text-gray-900 font-semibold bg-transparent"
              >
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
          {user.role === 'qa' && (
            <Button size="sm" onClick={() => setIsAddAreaModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Area
            </Button>
          )}
        </div>
      </div>

      {/* Archive Warning Banner */}
      {isSelectedProgInactive && (
        <div className="shrink-0 bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 font-bold text-[10px] uppercase tracking-wider shrink-0">
              Archive Mode
            </span>
            <span className="truncate">
              Program <strong>{selectedProgObj?.code}</strong> is currently <strong>out of the active accreditation cycle</strong>. Roster and chair assignments are preserved in read-only mode.
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium shrink-0 ml-2">Modifications Locked</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-4">
          <TableSkeleton rows={8} cols={4} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Area</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Area Chair</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Co-Chairs</th>
                  <th className="px-3.5 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {areas.map(area => {
                  const areaAssignments = assignments.filter(a => a.area_id === area.id);
                  const chair = areaAssignments.find(a => a.assignment_type === 'area_chair');
                  const coChairs = areaAssignments.filter(a => a.assignment_type === 'co_chair');
                  const members = areaAssignments.filter(a => a.assignment_type === 'member');

                  return (
                    <tr key={area.id} className="hover:bg-gray-50/50">
                      <td className="px-3.5 py-2.5 align-top">
                        <div className="font-mono text-xs font-bold text-gray-900">{area.code}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{area.title}</div>
                      </td>
                      
                      {/* Area Chair Column */}
                      <td className="px-3.5 py-2.5 align-top border-l border-gray-100">
                        {chair && (chair.users?.full_name || availableUsers.find(u => u.id === chair.user_id)?.full_name) ? (
                          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5 text-xs">
                            <div className="min-w-0 pr-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {chair.users?.full_name || availableUsers.find(u => u.id === chair.user_id)?.full_name}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {chair.users?.email || availableUsers.find(u => u.id === chair.user_id)?.email}
                              </p>
                            </div>
                            <button onClick={() => openRemoveConfirm(chair.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors shrink-0" title="Remove Area Chair">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => openAssignModal(area, 'area_chair')}
                            className="w-full border border-dashed border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-500 flex items-center justify-center gap-1.5 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Assign Chair
                          </button>
                        )}
                      </td>

                      {/* Co-Chairs Column */}
                      <td className="px-3.5 py-2.5 align-top border-l border-gray-100">
                        <div className="space-y-1.5">
                          {coChairs.map(co => {
                            const fullName = co.users?.full_name || availableUsers.find(u => u.id === co.user_id)?.full_name;
                            const email = co.users?.email || availableUsers.find(u => u.id === co.user_id)?.email;
                            if (!fullName) return null;
                            return (
                              <div key={co.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
                                <div className="min-w-0 pr-1">
                                  <p className="font-medium text-gray-900 truncate">{fullName}</p>
                                  <p className="text-[10px] text-gray-500 truncate">{email}</p>
                                </div>
                                <button onClick={() => openRemoveConfirm(co.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors shrink-0" title="Remove Co-Chair">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                          <button 
                            onClick={() => openAssignModal(area, 'co_chair')}
                            className="w-full border border-dashed border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-500 flex items-center justify-center gap-1.5 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Add Co-Chair
                          </button>
                        </div>
                      </td>

                      {/* Members Column */}
                      <td className="px-3.5 py-2.5 align-top border-l border-gray-100">
                        <div className="space-y-1.5">
                          {members.map(m => {
                            const fullName = m.users?.full_name || availableUsers.find(u => u.id === m.user_id)?.full_name;
                            const email = m.users?.email || availableUsers.find(u => u.id === m.user_id)?.email;
                            if (!fullName) return null;
                            return (
                              <div key={m.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
                                <div className="min-w-0 pr-1">
                                  <p className="font-medium text-gray-900 truncate">{fullName}</p>
                                  <p className="text-[10px] text-gray-500 truncate">{email}</p>
                                </div>
                                <button onClick={() => openRemoveConfirm(m.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors shrink-0" title="Remove Member">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                          <button 
                            onClick={() => openAssignModal(area, 'member')}
                            className="w-full border border-dashed border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-500 flex items-center justify-center gap-1.5 hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Add Member
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Assign ${formType === 'area_chair' ? 'Area Chair' : formType === 'co_chair' ? 'Co-Chair' : 'Member'}`}>
        <form onSubmit={handleAssign} className="space-y-5">
          {formError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{formError}</div>}
          
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Target Area</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="font-mono font-bold text-gray-900 mr-2">{selectedArea?.code}</span>
              <span className="text-sm text-gray-600">{selectedArea?.title}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Person</label>
            <select required value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Choose a faculty or staff member...</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {formType === 'member' ? 'This person will be able to upload evidence for this area, but cannot verify it.' : 'This person will be able to review and approve evidence for this area.'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} disabled={!selectedUserId}>Assign</Button>
          </div>
        </form>
      </Modal>

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={removeConfirmOpen}
        onClose={() => { setRemoveConfirmOpen(false); setRemoveTargetId(null); }}
        onConfirm={handleRemove}
        title="Remove this assignment?"
        message="This person will no longer be able to review evidence for this area."
        confirmLabel="Yes, Remove"
        variant="destructive"
        loading={removing}
      />

      {/* Add Area Modal */}
      <Modal
        isOpen={isAddAreaModalOpen}
        onClose={() => setIsAddAreaModalOpen(false)}
        title="Add Accreditation Area"
      >
        <form onSubmit={handleCreateArea} className="space-y-4">
          <Input
            label="Area Code"
            placeholder="e.g. Area I"
            required
            value={newAreaCode}
            onChange={(e) => setNewAreaCode(e.target.value)}
          />
          <Input
            label="Area Title"
            placeholder="e.g. Philosophy and Objectives"
            required
            value={newAreaTitle}
            onChange={(e) => setNewAreaTitle(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsAddAreaModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={areaSubmitting}>
              Create Area
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
