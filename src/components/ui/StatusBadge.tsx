import React from 'react';
import { EvidenceStatus, UserRole, RecommendationStatus, CycleStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: EvidenceStatus | UserRole | RecommendationStatus | CycleStatus | string;
  className?: string;
}

const colorMap: Record<string, { bg: string; text: string }> = {
  // Evidence status
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  verified: { bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  // Criterion category colors removed — category column dropped from DB
  // User roles
  system_admin: { bg: 'bg-purple-100', text: 'text-purple-800' },
  qa: { bg: 'bg-rose-100', text: 'text-rose-700' },
  dean: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  program_head: { bg: 'bg-violet-100', text: 'text-violet-700' },
  faculty: { bg: 'bg-sky-100', text: 'text-sky-700' },
  observer: { bg: 'bg-teal-100', text: 'text-teal-800' },
  alumni_rep: { bg: 'bg-orange-100', text: 'text-orange-700' },
  student_rep: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  // Accreditation scope
  active_scope: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  inactive_scope: { bg: 'bg-gray-100', text: 'text-gray-600' },
  // Readiness
  no_evidence: { bg: 'bg-gray-100', text: 'text-gray-600' },
  weak: { bg: 'bg-amber-100', text: 'text-amber-700' },
  sufficient: { bg: 'bg-green-100', text: 'text-green-700' },
  // Recommendation statuses
  open: { bg: 'bg-red-100', text: 'text-red-700' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-700' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  // Cycle statuses
  upcoming: { bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  certified: { bg: 'bg-indigo-100 border border-indigo-200', text: 'text-indigo-800' },
};

const labelMap: Record<string, string> = {
  system_admin: 'System Admin',
  qa: 'QA Admin',
  dean: 'College Dean',
  program_head: 'Program Head',
  faculty: 'Faculty',
  observer: 'Observer',
  alumni_rep: 'Alumni Rep',
  student_rep: 'Student Rep',
  active_scope: 'Active Cycle',
  inactive_scope: 'Out of Cycle',
  no_evidence: 'No Evidence',
  input: 'Input',
  process: 'Process',
  outcome: 'Outcome',
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  upcoming: 'Upcoming',
  completed: 'Completed',
  certified: 'Certified',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors = colorMap[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  const label = labelMap[status] || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} ${className}`}>
      {label}
    </span>
  );
}
