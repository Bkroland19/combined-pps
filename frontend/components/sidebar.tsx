'use client';

import {
  Activity,
  Settings,
  Eye,
  Home,
  BarChart3,
  Users,
  Pill,
  TestTube,
  Upload,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  sidebarOpen: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems: SidebarItem[] = [
  { id: 'visuals', label: 'Visuals', icon: Eye },
  // { id: 'overview', label: 'Overview', icon: Home },
  // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  // { id: 'patients', label: 'Patients', icon: Users },
  // { id: 'antibiotics', label: 'Antibiotics', icon: Pill },
  // { id: 'specimens', label: 'Specimens', icon: TestTube },
  { id: 'upload', label: 'Data Upload', icon: Upload },
  { id: 'database', label: 'Database', icon: Database },
];

export function Sidebar({
  sidebarOpen,
  activeSection,
  onSectionChange,
}: SidebarProps) {
  return (
    <div
      className={`fixed top-20 bottom-0 left-0 z-40 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            This work is licensed under a{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Creative Commons Attribution 4.0 International License
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
