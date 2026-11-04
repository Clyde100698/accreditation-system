'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AuditLog } from '@/lib/types';
import {
  History,
  Shield,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Trash2,
  UserCheck,
  UserX,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';

export default function AuditLogPage() {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data } = await supabase
        .from('audit_log')
        .select('*, users!user_id(full_name, email, role)')
        .order('created_at', { ascending: false })
        .limit(150);

      if (data) {
        setLogs(data as AuditLog[]);
      }
    } catch (err: unknown) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesEntity = selectedEntity === 'all' || log.entity_type === selectedEntity;
    
    if (!matchesAction || !matchesEntity) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const actorName = log.users?.full_name?.toLowerCase() || '';
    const actorEmail = log.users?.email?.toLowerCase() || '';
    const action = log.action.toLowerCase();
    const metaStr = JSON.stringify(log.metadata || {}).toLowerCase();

    return (
      actorName.includes(query) ||
      actorEmail.includes(query) ||
      action.includes(query) ||
      metaStr.includes(query)
    );
  });

  // Export to CSV for audit defensibility
  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Actor Role', 'Action', 'Entity Type', 'Entity ID', 'Metadata Details'];
    const rows = filteredLogs.map((log) => [
      new Date(log.created_at).toISOString(),
      `"${log.users?.full_name || 'System / Deleted'}"`,
      `"${log.users?.email || ''}"`,
      `"${log.users?.role || ''}"`,
      `"${log.action}"`,
      `"${log.entity_type}"`,
      `"${log.entity_id || ''}"`,
      `"${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `accreditation_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper badge for actions
  const renderActionBadge = (action: string) => {
    switch (action) {
      case 'evidence_verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Evidence Approved
          </span>
        );
      case 'evidence_rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Evidence Rejected
          </span>
        );
      case 'evidence_uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Upload className="w-3.5 h-3.5 text-blue-600" /> Evidence Uploaded
          </span>
        );
      case 'criterion_created':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            <FileText className="w-3.5 h-3.5 text-teal-600" /> Criterion Created
          </span>
        );
      case 'criterion_edited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <FileText className="w-3.5 h-3.5 text-amber-600" /> Criterion Edited
          </span>
        );
      case 'criterion_deleted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Criterion Deleted
          </span>
        );
      case 'area_assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Area Assigned
          </span>
        );
      case 'area_assignment_removed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <UserX className="w-3.5 h-3.5 text-slate-600" /> Assignment Removed
          </span>
        );
      case 'simulation_run':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 border border-violet-300">
            <FlaskConical className="w-3.5 h-3.5 text-violet-600" /> Simulation Executed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            <Clock className="w-3.5 h-3.5 text-gray-600" /> {action}
          </span>
        );
    }
  };

  if (authLoading || !user) return <TableSkeleton rows={6} cols={5} />;

  // Restrict to QA Admin and Dean
  if (!['qa', 'dean'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Shield className="w-14 h-14 mb-4 text-gray-300" />
        <h3 className="text-xl font-bold text-gray-800">Access Restricted</h3>
        <p className="text-sm mt-1 max-w-md text-center text-gray-500">
          The compliance Audit Trail contains defensible institutional records and is accessible only to QA Administrators and the Dean.
        </p>
      </div>
    );
  }

  // Summary Metrics
  const totalEvents = logs.length;
  const verifiedCount = logs.filter((l) => l.action === 'evidence_verified').length;
  const rejectedCount = logs.filter((l) => l.action === 'evidence_rejected').length;
  const uploadCount = logs.filter((l) => l.action === 'evidence_uploaded').length;

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Header (Shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 tracking-tight truncate">Accreditation Audit Trail</h1>
            <p className="text-xs text-gray-500 truncate">
              Defensible, immutable ledger of all compliance operations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={exportToCSV} disabled={filteredLogs.length === 0}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={fetchLogs}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row (Shrink-0) */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Recorded</span>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{totalEvents}</p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Events logged</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Evidence Uploads</span>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{uploadCount}</p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Submissions</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Approvals</span>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{verifiedCount}</p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Verified</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">Rejections</span>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{rejectedCount}</p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Returned</span>
        </div>
      </div>

      {/* Filters Bar (Shrink-0) */}
      <div className="shrink-0 bg-white rounded-xl border border-gray-200 px-3 py-1.5 flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actor, action, metadata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Action:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="all">All Actions</option>
              <option value="evidence_uploaded">Evidence Uploaded</option>
              <option value="evidence_verified">Evidence Approved</option>
              <option value="evidence_rejected">Evidence Rejected</option>
              <option value="criterion_created">Criterion Created</option>
              <option value="criterion_edited">Criterion Edited</option>
              <option value="criterion_deleted">Criterion Deleted</option>
              <option value="area_assigned">Area Assigned</option>
              <option value="area_assignment_removed">Assignment Removed</option>
              <option value="simulation_run">Simulation Executed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Entity:</span>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="all">All Entities</option>
              <option value="evidence_documents">Evidence Documents</option>
              <option value="accreditation_criteria">Accreditation Criteria</option>
              <option value="area_assignments">Area Assignments</option>
              <option value="simulations">Simulations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Feed Table Container */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 min-h-0 p-4">
            <TableSkeleton rows={8} cols={5} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex-1 min-h-0 p-8 text-center flex flex-col items-center justify-center">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-gray-700">No matching audit events</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Actions will appear here in real-time as faculty upload documents or chairs review evidence.
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider z-10">
                <tr>
                  <th className="px-3.5 py-2">Timestamp</th>
                  <th className="px-3.5 py-2">Actor</th>
                  <th className="px-3.5 py-2">Action</th>
                  <th className="px-3.5 py-2">Entity & Details</th>
                  <th className="px-3.5 py-2 text-right">Audit Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const date = new Date(log.created_at);
                  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const formattedDate = date.toLocaleDateString();

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <p className="font-semibold text-gray-800">{formattedTime}</p>
                        <p className="text-[10px] text-gray-400">{formattedDate}</p>
                      </td>

                      {/* Actor */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                            {log.users?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {log.users?.full_name || 'System / Direct API'}
                            </p>
                            <span className="text-[10px] text-gray-400 capitalize truncate block">
                              {log.users?.role ? log.users.role.replace('_', ' ') : '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        {renderActionBadge(log.action)}
                      </td>

                      {/* Summary Details */}
                      <td className="px-3.5 py-2">
                        <div className="text-xs text-gray-800">
                          {Boolean(log.metadata?.criterion_code) && (
                            <span className="font-mono font-bold text-primary bg-primary/10 px-1 py-0.5 rounded mr-1 text-[11px]">
                              {String(log.metadata.criterion_code)}
                            </span>
                          )}
                          {Boolean(log.metadata?.criterion_title) && (
                            <span className="text-gray-700 font-medium">{String(log.metadata.criterion_title)}</span>
                          )}
                          {Boolean(log.metadata?.area_code) && (
                            <span className="font-bold text-gray-900 mr-1">{String(log.metadata.area_code)}: {String(log.metadata.area_title || '')}</span>
                          )}
                          {Boolean(log.metadata?.document_type) && (
                            <span className="text-[10px] text-gray-500 block mt-0.5">Doc Type: {String(log.metadata.document_type)}</span>
                          )}
                          {Boolean(log.metadata?.assigned_user_name) && (
                            <span className="text-[10px] text-gray-600 block mt-0.5">Assigned to: <strong>{String(log.metadata.assigned_user_name)}</strong></span>
                          )}
                          {log.action === 'simulation_run' && (
                            <span className="text-[11px] text-primary font-semibold block mt-0.5">
                              Simulated {String(log.metadata?.simulated_criteria_count || '')} criteria → Projected {String(log.metadata?.projected_score || '')}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Metadata Toggle */}
                      <td className="px-3.5 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <>Hide <ChevronDown className="w-3 h-3" /></>
                          ) : (
                            <>Inspect <ChevronRight className="w-3 h-3" /></>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-2.5 bg-gray-50 text-gray-800 rounded-lg text-left text-xs font-mono overflow-x-auto border border-gray-200 max-w-sm ml-auto">
                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 border-b border-gray-200 pb-0.5">
                              Entity: {log.entity_type} (ID: {log.entity_id || 'N/A'})
                            </p>
                            <pre className="whitespace-pre-wrap leading-relaxed text-[10px] text-gray-700">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
