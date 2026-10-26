import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { GoogleAuthCard } from '../../components/auth/GoogleAuthCard.jsx';
import {
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  GraduationCap,
  Shield,
  Zap,
  Users,
  Target
} from 'lucide-react';

export function LoginPage({ initialView = 'login' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const requestedRole = queryParams.get('role') || 'client';
  const isRegister = initialView === 'register' || location.pathname === '/register';

  // If already logged in, redirect to appropriate role dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/client/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 size-[600px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 size-[500px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" aria-hidden="true" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="size-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Compass className="size-5 stroke-[2.2]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-white tracking-tight text-balance">Pathfinder</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-wider uppercase border border-indigo-500/30">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Personalized Learning Roadmap Platform
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Explore Platform
          </Link>
          <Link
            to={isRegister ? '/login' : '/register'}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 hover:text-white hover:border-slate-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isRegister ? 'Sign In Instead' : 'Create Account'}
          </Link>
        </div>
      </header>

      {/* Main Content: Split-Screen Hero + Google Auth */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        
        {/* Left Side: Value Proposition & High-Trust Metrics */}
        <div className="flex-1 max-w-xl text-left hidden lg:block">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles className="size-4 text-indigo-400" aria-hidden="true" />
            <span>Next-Generation Learning Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-5 text-balance">
            Turn complex skills into{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              clear, mastered paths.
            </span>
          </h1>

          <p className="text-base text-slate-400 leading-relaxed mb-8 text-pretty">
            Whether you're an instructor designing gated learning curriculums or a learner mastering new technologies, Pathfinder gives you clarity, structure, and real momentum.
          </p>

          {/* Core Feature Bullets */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3.5">
              <div className="size-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Target className="size-4 text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Gated Progression Invariants</h4>
                <p className="text-xs text-slate-400 mt-0.5 text-pretty">
                  Milestones only unlock when prerequisites and assessments are strictly met.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="size-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Users className="size-4 text-purple-400" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Dual Perspectives for Teams & Students</h4>
                <p className="text-xs text-slate-400 mt-0.5 text-pretty">
                  Instructors get visual drag-and-drop studio controls; learners get a distraction-free workspace.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="size-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Zap className="size-4 text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Instant One-Click Google Authentication</h4>
                <p className="text-xs text-slate-400 mt-0.5 text-pretty">
                  Frictionless access with instant role selection. Zero cumbersome signup forms.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof / Metrics Bar */}
          <div className="pt-6 border-t border-slate-900 grid grid-cols-3 gap-4 tabular-nums">
            <div>
              <div className="text-2xl font-black text-white">10,000+</div>
              <div className="text-[11px] text-slate-400 font-medium">Active Learners</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">99.4%</div>
              <div className="text-[11px] text-slate-400 font-medium">Concept Retention</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">4.9 / 5.0</div>
              <div className="text-[11px] text-slate-400 font-medium">Learner Rating</div>
            </div>
          </div>
        </div>

        {/* Right Side: The Google Authentication Card */}
        <div className="w-full flex-1 flex justify-center">
          <GoogleAuthCard
            initialRole={requestedRole}
            defaultView={isRegister ? 'register' : 'login'}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Pathfinder Platform. Enterprise Grade.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-slate-200 transition-colors">Features</Link>
          <Link to="/login" className="hover:text-slate-200 transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-slate-200 transition-colors">Sign Up</Link>
        </div>
      </footer>

    </div>
  );
}

export function RegisterPage() {
  return <LoginPage initialView="register" />;
}
