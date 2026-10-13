import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Compass, LogOut, User, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to={isAdmin ? "/admin/dashboard" : "/client/dashboard"} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">Pathfinder</span>
            <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2 font-mono">Roadmap Core</span>
          </div>
        </Link>
        <Badge variant={isAdmin ? 'purple' : 'primary'} className="ml-2">
          {isAdmin ? 'Admin Studio' : 'Learner Dashboard'}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
              <span className="text-xs text-slate-400 font-mono">{user.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              {isAdmin ? <ShieldCheck className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-blue-400" />}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} icon={LogOut}>
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
