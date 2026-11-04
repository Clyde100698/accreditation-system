'use client';

import React from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { UserRole } from '@/lib/types';

interface TopbarProps {
  pageTitle: string;
  userName: string;
  userRole: UserRole;
}

export function Topbar({ pageTitle, userName, userRole }: TopbarProps) {
  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeSwitcher />
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-700 hidden sm:inline">{userName}</span>
        <StatusBadge status={userRole} />
      </div>
    </header>
  );
}
