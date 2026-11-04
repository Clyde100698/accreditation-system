'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types';
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  LogOut,
  GraduationCap,
  FlaskConical,
  Users,
  ListChecks,
  History,
  FolderOpen,
  Building2,
  UserCog,
  SlidersHorizontal,
} from 'lucide-react';

interface SidebarProps {
  userRole: UserRole;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  isFlagship?: boolean;
}

const allNavItems: NavItem[] = [
  // System Admin IT Operations & Academic Registry
  { href: '/admin/programs', label: 'Academic Registry', icon: Building2, roles: ['system_admin', 'qa'] },
  { href: '/admin/framework', label: 'Framework Config', icon: SlidersHorizontal, roles: ['system_admin', 'qa'] },
  { href: '/admin/users', label: 'User Accounts', icon: UserCog, roles: ['system_admin'] },

  // General & QA Operations
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['system_admin', 'qa', 'dean', 'program_head', 'faculty', 'alumni_rep', 'student_rep'] },
  { href: '/admin/scope', label: 'Accreditation Scope', icon: SlidersHorizontal, roles: ['qa'] },
  { href: '/criteria', label: 'Criteria', icon: FileText, roles: ['qa'] },
  { href: '/areas', label: 'Areas & Chairs', icon: Users, roles: ['qa', 'program_head'] },
  { href: '/evidence', label: 'Evidence Library', icon: FolderOpen, roles: ['qa', 'dean', 'program_head', 'faculty'] },
  { href: '/verification', label: 'Review & Approve', icon: CheckCircle, roles: ['qa', 'program_head', 'faculty'] },
  { href: '/simulation', label: 'What-If Simulation', icon: FlaskConical, roles: ['qa', 'dean', 'program_head'], isFlagship: true },
  { href: '/recommendations', label: 'Recommendations', icon: ListChecks, roles: ['qa', 'dean', 'program_head', 'faculty'] },
  { href: '/audit-log', label: 'Audit Trail', icon: History, roles: ['system_admin', 'qa', 'dean'] },
];

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bypass_user');
      localStorage.removeItem('accreditation_mock_db');
    }
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push('/login');
  };

  return (
    <aside className="w-[230px] flex-shrink-0 h-full bg-white border-r border-gray-200 flex flex-col z-30 select-none">
      {/* Logo */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-gray-900 leading-tight truncate">Accreditation</h1>
            <p className="text-[10px] text-gray-500 leading-tight truncate">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-2.5 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isFlagship = item.isFlagship;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : isFlagship
                    ? 'text-primary bg-primary/5 hover:bg-primary/10 border border-dashed border-primary/30 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${
                  isActive 
                    ? 'text-primary'
                    : isFlagship ? 'text-primary' : 'text-gray-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>
              {isFlagship && !isActive && (
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold flex-shrink-0">
                  Flagship
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2.5 py-2.5 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
