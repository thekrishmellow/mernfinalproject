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
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <Link to={isAdmin ? "/admin/dashboard" : "/client/dashboard"} className="flex items-center gap-3 group">
          <div className="size-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-600/25 group-hover:scale-105 transition-transform">
            <Compass className="size-5 stroke-[2.2]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-850 tracking-tight text-balance">Pathfinder</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-purple-50 text-[10px] text-purple-700 font-extrabold tracking-wide uppercase border border-purple-100">
                Studio
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">Personalized Learning Roadmap Platform</span>
          </div>
        </Link>
        <Badge variant={isAdmin ? 'purple' : 'primary'} className="ml-2 font-bold hidden md:inline-flex">
          {isAdmin ? 'Admin Console' : 'Learner Dashboard'}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">{user.name}</span>
              <span className="text-[11px] text-slate-400 font-medium">{user.email}</span>
            </div>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="size-9 rounded-2xl object-cover border-2 border-white shadow-md shadow-purple-500/20"
              />
            ) : (
              <div className="size-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 border-2 border-white shadow-md shadow-purple-500/20 flex items-center justify-center text-white font-bold text-xs">
                {user.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              icon={LogOut}
              aria-label="Logout"
            >
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
