'use client';

import { provisionAuthUser, deactivateUser, reactivateUser, deleteUser } from '@/app/actions/userActions';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/Toast';
import { User, Department, Program, UserRole, AreaAssignment, AccreditationArea } from '@/lib/types';
import { logAuditEvent } from '@/lib/audit';
import {
  UserCog,
  Plus,
  Pencil,
  Search,
  Mail,
  ShieldAlert,
  Building,
  GraduationCap,
  Filter,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

const AVAILABLE_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'system_admin', label: 'System Admin', description: 'Institution-wide IT administration, accounts, and org structure' },
  { value: 'qa', label: 'QA Admin', description: 'Accreditation oversight, scope selection, criteria and survey instruments' },
  { value: 'dean', label: 'College Dean', description: 'College-wide oversight across all departmental programs' },
  { value: 'program_head', label: 'Program Head', description: 'Program-specific readiness management and area assignments' },
  { value: 'faculty', label: 'Faculty', description: 'Teaching faculty eligible for Area Chair / Member assignments' },
  { value: 'alumni_rep', label: 'Alumni Representative', description: 'Alumni stakeholder with read-only readiness summary access' },
  { value: 'student_rep', label: 'Student Representative', description: 'Student stakeholder with read-only readiness summary access' },
];

export default function UserAccountsPage() {
  const { user: currentUser } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [areaAssignments, setAreaAssignments] = useState<AreaAssignment[]>([]);
  const [areas, setAreas] = useState<AccreditationArea[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formState, setFormState] = useState<{
    full_name: string;
    email: string;
    role: UserRole;
    department_id: string;
    program_id: string;
    assigned_area_id: string;
    assigned_area_type: 'area_chair' | 'co_chair' | 'member';
  }>({
    full_name: '',
    email: '',
    role: 'faculty',
    department_id: '',
    program_id: '',
    assigned_area_id: '',
    assigned_area_type: 'area_chair',
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // userId being acted on
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes, progsRes, assignmentsRes, areasRes] = await Promise.all([
        supabase.from('users').select('*, programs(*)').order('full_name'),
        supabase.from('departments').select('*').order('name'),
        supabase.from('programs').select('*').order('code'),
        supabase.from('area_assignments').select('*'),
        supabase.from('accreditation_areas').select('*').order('display_order'),
      ]);

      if (usersRes.data) setUsers(usersRes.data as User[]);
      if (deptsRes.data) setDepartments(deptsRes.data as Department[]);
      if (progsRes.data) setPrograms(progsRes.data as Program[]);
      if (assignmentsRes.data) setAreaAssignments(assignmentsRes.data as AreaAssignment[]);
      if (areasRes.data) setAreas(areasRes.data as AccreditationArea[]);
    } catch (err: unknown) {
      console.error('Error fetching users data:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Guard for System Admin
  if (currentUser && currentUser.role !== 'system_admin') {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md p-6 bg-white border border-red-200 rounded-xl">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 mt-1">
            User account provisioning and role assignments are restricted to System Administrators.
          </p>
        </div>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingUser(null);
    setFormState({
      full_name: '',
      email: '',
      role: 'faculty',
      department_id: departments[0]?.id || '',
      program_id: programs[0]?.id || '',
      assigned_area_id: '',
      assigned_area_type: 'area_chair',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    const existingAssign = areaAssignments.find((a) => a.user_id === u.id);
    setEditingUser(u);
    setFormState({
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      department_id: u.department_id || '',
      program_id: u.program_id || '',
      assigned_area_id: existingAssign?.area_id || '',
      assigned_area_type: existingAssign?.assignment_type || 'area_chair',
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formState.full_name.trim();
    const trimmedEmail = formState.email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      showToast('error', 'Full name and email are required');
      return;
    }

    // Check duplicate email
    const duplicateEmail = users.find(
      (u) => u.id !== editingUser?.id && u.email.toLowerCase() === trimmedEmail
    );
    if (duplicateEmail) {
      showToast('error', `A user with email "${trimmedEmail}" already exists (${duplicateEmail.full_name})`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: trimmedName,
        email: trimmedEmail,
        role: formState.role,
        department_id: formState.department_id || null,
        program_id: formState.program_id || null,
      };

      let savedUserId = editingUser?.id;

      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update(payload)
          .eq('id', editingUser.id);

        if (error) throw error;
        await logAuditEvent('user_updated', 'users', editingUser.id, {
          email: payload.email,
          role: payload.role,
        });
        showToast('success', `User "${payload.full_name}" updated`);
      } else {
        // Step 1: Create the Supabase Auth user (sets password123, auto-confirms email)
        const authResult = await provisionAuthUser(trimmedEmail, trimmedName);
        if (!authResult.success) {
          throw new Error(`Auth provisioning failed: ${authResult.error}`);
        }

        // Step 2: Insert into public.users, linking the auth_user_id
        const { data, error } = await supabase
          .from('users')
          .insert({ ...payload, auth_user_id: authResult.authUserId })
          .select()
          .single();

        if (error) throw error;
        savedUserId = data.id;
        await logAuditEvent('user_created', 'users', data.id, {
          email: payload.email,
          role: payload.role,
        });
        showToast('success', `User "${payload.full_name}" provisioned — login: ${trimmedEmail} / password123`);
      }

      // Sync Area Assignment for Faculty
      if (savedUserId && formState.role === 'faculty') {
        const existingAssign = areaAssignments.find((a) => a.user_id === savedUserId);
        const assignProgId = formState.program_id || programs[0]?.id;

        if (formState.assigned_area_id) {
          if (existingAssign) {
            await supabase
              .from('area_assignments')
              .update({
                area_id: formState.assigned_area_id,
                assignment_type: formState.assigned_area_type,
                program_id: assignProgId,
              })
              .eq('id', existingAssign.id);
          } else {
            await supabase
              .from('area_assignments')
              .insert({
                user_id: savedUserId,
                area_id: formState.assigned_area_id,
                assignment_type: formState.assigned_area_type,
                program_id: assignProgId,
                assigned_by: currentUser?.id,
              });
          }
        } else if (existingAssign) {
          await supabase.from('area_assignments').delete().eq('id', existingAssign.id);
        }
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (u: User) => {
    if (u.id === currentUser?.id) { showToast('error', 'You cannot deactivate your own account'); return; }
    setActionLoading(u.id);
    const result = await deactivateUser(u.id);
    if (result.success) {
      showToast('success', `${u.full_name} has been deactivated`);
      await logAuditEvent('user_deactivated', 'users', u.id, { email: u.email });
      fetchData();
    } else {
      showToast('error', result.error ?? 'Failed to deactivate user');
    }
    setActionLoading(null);
  };

  const handleReactivate = async (u: User) => {
    setActionLoading(u.id);
    const result = await reactivateUser(u.id);
    if (result.success) {
      showToast('success', `${u.full_name} has been reactivated`);
      await logAuditEvent('user_reactivated', 'users', u.id, { email: u.email });
      fetchData();
    } else {
      showToast('error', result.error ?? 'Failed to reactivate user');
    }
    setActionLoading(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteUser) return;
    if (confirmDeleteUser.id === currentUser?.id) { showToast('error', 'You cannot delete your own account'); return; }
    setActionLoading(confirmDeleteUser.id);
    const result = await deleteUser(confirmDeleteUser.id, confirmDeleteUser.auth_user_id);
    if (result.success) {
      showToast('success', `${confirmDeleteUser.full_name} permanently deleted`);
      setConfirmDeleteUser(null);
      fetchData();
    } else {
      showToast('error', result.error ?? 'Failed to delete user');
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesDept = deptFilter === 'all' || u.department_id === deptFilter;
    return matchesQuery && matchesRole && matchesDept;
  });

  if (currentUser && currentUser.role !== 'system_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <UserCog className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-800">Access Restricted</p>
        <p className="text-sm mt-1 max-w-md text-center text-gray-500">
          Only System Administrators can manage institutional user accounts and roles.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-3">
      {/* Pinned Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <UserCog className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">User Accounts & Roles</h1>
            <p className="text-[11px] text-gray-500 leading-tight">
              Provision institutional accounts, assign system roles, and configure college bindings
            </p>
          </div>
        </div>

        <Button size="sm" onClick={openCreateModal}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Provision User
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-white border border-gray-200 rounded-xl px-3 py-2">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="all">All Roles</option>
              {AVAILABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} />
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 z-10">
                <tr className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-4 py-2.5">User</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Institutional Role</th>
                  <th className="px-4 py-2.5">Assigned Area(s)</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Assigned Program</th>
                  <th className="px-4 py-2.5">Default Password</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                      No user accounts match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const dept = departments.find((d) => d.id === u.department_id);
                    const prog = programs.find((p) => p.id === u.program_id);

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-2.5">
                          <span className="font-semibold text-gray-900 block">{u.full_name}</span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-gray-600 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {u.email}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={u.role} />
                        </td>
                        <td className="px-4 py-2.5">
                          {(() => {
                            const userAssignments = areaAssignments.filter((a) => a.user_id === u.id);
                            if (userAssignments.length > 0) {
                              return (
                                <div className="flex flex-col gap-1">
                                  {userAssignments.map((a) => {
                                    const area = areas.find((ar) => ar.id === a.area_id);
                                    const aProg = programs.find((p) => p.id === a.program_id);
                                    const typeLabel =
                                      a.assignment_type === 'area_chair'
                                        ? 'Area Chair'
                                        : a.assignment_type === 'co_chair'
                                        ? 'Co-Chair'
                                        : 'Member';
                                    return (
                                      <span
                                        key={a.id}
                                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        title={`${area?.code || 'Area'}: ${area?.title || ''} (${typeLabel})`}
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span>
                                          <strong>{area?.code || 'Area'}:</strong> {typeLabel}
                                        </span>
                                        {aProg && (
                                          <span className="text-[10px] text-emerald-700 font-mono bg-emerald-100/60 px-1 rounded">
                                            {aProg.code}
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })}
                                </div>
                              );
                            }
                            if (u.role === 'faculty') {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200">
                                  Unassigned
                                </span>
                              );
                            }
                            if (u.role === 'program_head') {
                              return (
                                <span className="text-[11px] text-gray-500 font-medium">
                                  All Areas ({prog?.code || 'Dept'})
                                </span>
                              );
                            }
                            if (['system_admin', 'qa', 'dean'].includes(u.role)) {
                              return (
                                <span className="text-[11px] text-gray-400 italic">
                                  Institutional Scope
                                </span>
                              );
                            }
                            return <span className="text-[11px] text-gray-400">—</span>;
                          })()}
                        </td>
                        <td className="px-4 py-2.5">
                          {dept ? (
                            <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                              <Building className="w-3 h-3 text-gray-400" />
                              {dept.code}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">Institution-wide</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {prog ? (
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              <GraduationCap className="w-3 h-3 text-primary/70" />
                              {prog.code}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            <KeyRound className="w-2.5 h-2.5 text-gray-400" />
                            password123
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {u.is_active === false ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                              <UserX className="w-3 h-3" /> Inactive
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                              <UserCheck className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1 rounded text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
                              title="Edit User Role / Bindings"
                              disabled={actionLoading === u.id}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {u.is_active === false ? (
                              <button
                                onClick={() => handleReactivate(u)}
                                className="p-1 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                title="Reactivate User"
                                disabled={actionLoading === u.id}
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeactivate(u)}
                                className="p-1 rounded text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                title="Deactivate User (soft disable)"
                                disabled={actionLoading === u.id || u.id === currentUser?.id}
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmDeleteUser(u)}
                              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Permanently Delete User"
                              disabled={actionLoading === u.id || u.id === currentUser?.id}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pinned Footer */}
        <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              Total Accounts: <strong className="text-gray-800">{users.length}</strong>
            </span>
            <span>
              Filtered: <strong className="text-gray-800">{filteredUsers.length}</strong>
            </span>
          </div>
          <span className="text-[10px] text-gray-400 italic">
            Separation of duties: System Admins manage accounts; QA evaluates accreditation criteria.
          </span>
        </div>
      </div>

      {/* User Provisioning Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit Account: ${editingUser.full_name}` : 'Provision User Account'}
      >
        <form onSubmit={handleSaveUser} className="space-y-3.5">
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Jane Smith"
            required
            value={formState.full_name}
            onChange={(e) => setFormState({ ...formState, full_name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. jsmith@sti.edu"
            required
            value={formState.email}
            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
          />

          {!editingUser && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Initial Temporary Password: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-mono">password123</code></span>
              </div>
              <p className="text-[11px] text-amber-800">
                The user logs in with this email and password <span className="font-semibold font-mono">password123</span>. The system binds and activates their credentials on first sign-in.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Institutional Role
            </label>
            <select
              value={formState.role}
              onChange={(e) =>
                setFormState({ ...formState, role: e.target.value as UserRole })
              }
              className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
            >
              {AVAILABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} — {r.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                College / Department
              </label>
              <select
                value={formState.department_id}
                onChange={(e) => setFormState({ ...formState, department_id: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              >
                <option value="">Institution-wide (No Dept)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Assigned Program
              </label>
              <select
                value={formState.program_id}
                onChange={(e) => setFormState({ ...formState, program_id: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              >
                <option value="">None / Department-wide</option>
                {programs
                  .filter((p) => !formState.department_id || p.department_id === formState.department_id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {formState.role === 'faculty' && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Accreditation Area Delegation</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Assign this faculty member to lead or evaluate compliance for an accreditation area.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Assigned Area
                  </label>
                  <select
                    value={formState.assigned_area_id}
                    onChange={(e) => setFormState({ ...formState, assigned_area_id: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
                  >
                    <option value="">None / Unassigned</option>
                    {areas.map((ar) => (
                      <option key={ar.id} value={ar.id}>
                        {ar.code}: {ar.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Committee Role
                  </label>
                  <select
                    value={formState.assigned_area_type}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        assigned_area_type: e.target.value as 'area_chair' | 'co_chair' | 'member',
                      })
                    }
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
                  >
                    <option value="area_chair">Area Chair (Lead)</option>
                    <option value="co_chair">Co-Chair</option>
                    <option value="member">Committee Member</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              {editingUser ? 'Update Account' : 'Provision Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!confirmDeleteUser}
        onClose={() => setConfirmDeleteUser(null)}
        title="Permanently Delete User"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800">
              <p className="font-bold text-sm">This action is irreversible.</p>
              <p className="mt-1">
                Deleting <span className="font-semibold">{confirmDeleteUser?.full_name}</span> ({confirmDeleteUser?.email}) will permanently remove their account from both the accreditation system and authentication records.
              </p>
              <p className="mt-1.5 font-semibold">
                Consider using <span className="text-orange-700">Deactivate</span> instead — it disables login while preserving the audit trail.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDeleteUser(null)}
            >
              Cancel — Keep User
            </Button>
            <button
              onClick={handleDeleteConfirm}
              disabled={actionLoading === confirmDeleteUser?.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {actionLoading === confirmDeleteUser?.id ? 'Deleting...' : 'Yes, Permanently Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
