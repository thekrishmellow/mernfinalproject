import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import {
  LayoutDashboard,
  GitFork,
  Users,
  FileQuestion,
  FolderArchive,
  BarChart3,
  BookOpen,
  Award
} from 'lucide-react';

export function Sidebar() {
  const { isAdmin } = useAuth();

  const adminNav = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Roadmap Studio', to: '/admin/roadmaps', icon: GitFork },
    { label: 'Client Assignments', to: '/admin/assignments', icon: Users },
    { label: 'Quiz Bank', to: '/admin/quizzes', icon: FileQuestion },
    { label: 'Resource Library', to: '/admin/resources', icon: FolderArchive },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 }
  ];

  const clientNav = [
    { label: 'Learning Dashboard', to: '/client/dashboard', icon: BookOpen },
    { label: 'Assigned Paths', to: '/client/dashboard', icon: Award }
  ];

  const items = isAdmin ? adminNav : clientNav;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm shrink-0 hidden md:flex flex-col py-6 px-3">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
        {isAdmin ? 'Administration' : 'Learning Workspace'}
      </div>
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="px-3 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col gap-1">
        <span>Pathfinder Engine v1.0</span>
        <span className="text-[10px] text-slate-400">Strict Gated Progression</span>
      </div>
    </aside>
  );
}
