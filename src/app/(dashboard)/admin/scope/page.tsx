'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/Toast';
import { Program, Department, AccreditationLevel } from '@/lib/types';
import { logAuditEvent } from '@/lib/audit';
import { toggleProgramActiveScope } from '@/app/actions/academicActions';
import {
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  FolderTree,
  Award,
  Search,
  AlertCircle,
} from 'lucide-react';

export default function AccreditationScopePage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<AccreditationLevel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const canToggle = user?.role === 'qa';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, progRes, lvlRes] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('programs').select('*, departments(*), accreditation_levels(*)').order('code'),
        supabase.from('accreditation_levels').select('*').order('level_number'),
      ]);

      if (deptRes.data) setDepartments(deptRes.data as Department[]);
      if (progRes.data) setPrograms(progRes.data as Program[]);
      if (lvlRes.data) setLevels(lvlRes.data as AccreditationLevel[]);
    } catch (err: unknown) {
      console.error('Error fetching accreditation scope data:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleScope = async (prog: Program) => {
    if (!canToggle) {
      showToast('error', 'Only QA Administrators can modify the institutional accreditation scope.');
      return;
    }

    const nextState = prog.is_accreditation_active === false;
    setTogglingId(prog.id);

    try {
      const res = await toggleProgramActiveScope(prog.id, nextState);
      if (!res.success) {
        throw new Error(res.error || 'Failed to update scope');
      }

      await logAuditEvent('accreditation_scope_updated', 'programs', prog.id, {
        program_code: prog.code,
        program_name: prog.name,
        is_accreditation_active: nextState,
      });

      // Update local state
      setPrograms((prev) =>
        prev.map((p) => (p.id === prog.id ? { ...p, is_accreditation_active: nextState } : p))
      );

      showToast(
        'success',
        `${prog.code} is now ${nextState ? 'ACTIVE in' : 'REMOVED from'} current accreditation cycle`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', msg || 'Failed to update scope');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const activeCount = programs.filter((p) => p.is_accreditation_active !== false).length;
  const inactiveCount = programs.length - activeCount;

  if (user && !['qa', 'system_admin'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <SlidersHorizontal className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-800">Access Restricted</p>
        <p className="text-sm mt-1 max-w-md text-center text-gray-500">
          Only QA Administrators and System Administrators can configure institutional accreditation scope.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-3">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Accreditation Scope Manager</h1>
            <p className="text-[11px] text-gray-500 leading-tight">
              QA Authority: Select which academic programs are active for survey visits & evidence collection
            </p>
          </div>
        </div>

        {/* Quick Scope Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active in Scope: {activeCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-gray-400" />
            <span>Out of Cycle (Archived): {inactiveCount}</span>
          </div>
        </div>
      </div>

      {/* Guidance Alert */}
      <div className="shrink-0 bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-950">Accreditation Scope Governance</p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Programs toggled <strong>Active</strong> allow committee members and faculty to upload evidence, self-evaluate criteria, and submit for verification.
            Programs marked <strong>Out of Cycle</strong> are preserved in defensible read-only archive mode — historical scores and documents remain searchable, but all upload and verification actions are locked.
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="shrink-0 bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search programs by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-[11px] text-gray-500">
          Showing {filteredPrograms.length} of {programs.length} programs
        </span>
      </div>

      {/* Main Table */}
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
                  <th className="px-4 py-2.5">Program</th>
                  <th className="px-4 py-2.5">College / Department</th>
                  <th className="px-4 py-2.5">Current Level</th>
                  <th className="px-4 py-2.5">Accreditation Scope Status</th>
                  <th className="px-4 py-2.5 text-right">Scope Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No degree programs found.
                    </td>
                  </tr>
                ) : (
                  filteredPrograms.map((prog) => {
                    const dept = departments.find((d) => d.id === prog.department_id);
                    const isActive = prog.is_accreditation_active !== false;
                    const level = levels.find((l) => l.id === prog.current_level_id);
                    const isToggling = togglingId === prog.id;

                    return (
                      <tr
                        key={prog.id}
                        className={`transition-colors ${
                          isActive ? 'hover:bg-gray-50/60' : 'bg-gray-50/40 text-gray-500 hover:bg-gray-100/50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold px-1.5 py-0.5 rounded text-xs ${
                                isActive ? 'text-gray-900 bg-gray-100' : 'text-gray-500 bg-gray-200/60'
                              }`}
                            >
                              {prog.code}
                            </span>
                            <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                              {prog.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[11px]">
                            <FolderTree className="w-3 h-3 text-gray-400" />
                            {dept?.code || 'Unassigned'}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            {level?.label || 'Candidate Status'}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200/60">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active for Accreditation
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200">
                              <XCircle className="w-3.5 h-3.5 text-gray-400" />
                              Out of Cycle (Archive Only)
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {canToggle ? (
                            <button
                              disabled={isToggling}
                              onClick={() => handleToggleScope(prog)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                isActive
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                            >
                              {isToggling ? (
                                'Updating...'
                              ) : isActive ? (
                                'Deactivate from Scope'
                              ) : (
                                'Activate for Scope'
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">View Only</span>
                          )}
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
          <span>
            Total Degree Programs: <strong className="text-gray-800">{programs.length}</strong>
          </span>
          <span className="text-[10px] text-gray-400">
            Changes to accreditation scope take effect immediately across all dashboard, evidence, and scoring views.
          </span>
        </div>
      </div>
    </div>
  );
}
