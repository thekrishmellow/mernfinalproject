import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import {
  Compass,
  Search,
  LogOut,
  User
} from 'lucide-react';

export function LearnerNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-18 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <Link to="/client/dashboard" className="flex items-center gap-2.5 group">
          <div className="size-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Compass className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-extrabold text-lg text-slate-800 tracking-tight flex items-center gap-1.5 text-balance">
              Pathfinder
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Learning App
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Personalized Journey</span>
          </div>
        </Link>
      </div>

      {/* Middle Search (Accessible input with aria-label) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-8">
        <div className="relative w-full">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search modules and quizzes"
            placeholder="Search modules, quizzes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 focus-visible:outline-none focus-visible:border-amber-500 focus-visible:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right User Profile & Switcher */}
      <div className="flex items-center gap-3">
        {/* Active Enrolled Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold tabular-nums">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>Active Learning</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="size-9 rounded-full object-cover border border-purple-200 shadow-md"
              />
            ) : (
              <div className="size-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                {user?.name?.charAt(0) || 'S'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-medium">{user?.role === 'admin' ? 'Administrator' : 'Learner'}</div>
            </div>
          </div>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              Admin Studio
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-colors"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default LearnerNavbar;
