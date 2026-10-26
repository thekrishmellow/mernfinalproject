import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { cn } from '../../utils/cn.js';
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
    <aside className="w-64 border-r border-slate-200/80 bg-white shrink-0 hidden md:flex flex-col py-6 px-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
        {isAdmin ? 'Studio Workspace' : 'Learning Workspace'}
      </div>
      <nav aria-label="Sidebar Navigation" className="flex-1 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
                  isActive
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50/60 text-purple-700 border border-purple-200/60 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/40 border border-purple-100 text-xs text-slate-600 flex flex-col gap-1.5 mt-auto">
        <div className="flex items-center gap-1.5 font-bold text-purple-900">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>Pathfinder Studio Engine</span>
        </div>
        <span className="text-[11px] text-slate-500 text-pretty">
          Strict gated validation &amp; curriculum release active.
        </span>
      </div>
    </aside>
  );
}

export default Sidebar;
