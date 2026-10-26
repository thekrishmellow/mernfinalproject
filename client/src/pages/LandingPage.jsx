import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  Shield,
  GraduationCap,
  Sparkles,
  Zap,
  Target,
  Layers,
  BarChart3,
  Users,
  Award,
  FileText,
  ChevronRight,
  Play
} from 'lucide-react';

export function LandingPage() {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedRole, setSelectedRole] = useState('client');
  const [activePerspective, setActivePerspective] = useState('learner');
  const [activeDemoNode, setActiveDemoNode] = useState(1);

  const handleHeroGoogleClick = () => {
    navigate(`/login?role=${selectedRole}`);
  };

  const demoNodes = [
    {
      id: 1,
      title: 'Foundations & Architecture',
      category: 'Core Concepts',
      status: 'completed',
      score: '100%',
      desc: 'Master the fundamental architecture and system mental models.'
    },
    {
      id: 2,
      title: 'Hands-on Implementation',
      category: 'Practical Coding',
      status: 'available',
      score: 'In Progress',
      desc: 'Build scalable modules, implement robust error handling, and test.'
    },
    {
      id: 3,
      title: 'Production Deployment & Scale',
      category: 'Advanced Mastery',
      status: 'locked',
      score: 'Requires Node 2',
      desc: 'Deploy with zero downtime, configure monitoring, and optimize latency.'
    }
  ];

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      
      {/* ──── Top Navbar ──── */}
      <nav aria-label="Main Navigation" className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Compass className="size-5 stroke-[2.2]" aria-hidden="true" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight text-balance">Pathfinder</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">Learning Platform</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-2 py-1">Features</a>
            <a href="#perspectives" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-2 py-1">Perspectives</a>
            <a href="#demo" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-2 py-1">Interactive Demo</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ──── Hero Section ──── */}
      <section className="relative pt-36 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-blue-600/15 rounded-full blur-[160px] pointer-events-none" aria-hidden="true" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide uppercase mb-6 animate-pulse-slow">
          <Sparkles className="size-3.5 text-indigo-400" aria-hidden="true" />
          <span>The Next-Generation Roadmap Engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1] mb-6 text-balance">
          Personalized learning roadmaps with{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            gated progression.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          Transform scattered tutorials into clear, goal-driven visual paths. Milestones unlock only when prerequisite quizzes and exercises are mastered.
        </p>

        {/* Hero Action: Role Choice + Google Button */}
        <div className="w-full max-w-md p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl mb-12">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 px-1">
            <span>Start Learning Or Teaching:</span>
            <span className="text-indigo-400">1-Click Google Access</span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-3 border border-slate-800/80">
            <button
              type="button"
              onClick={() => setSelectedRole('client')}
              className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'client'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Learner (Client)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Instructor (Admin)</span>
            </button>
          </div>

          <button
            onClick={handleHeroGoogleClick}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-black/20 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google as {selectedRole === 'admin' ? 'Admin' : 'Learner'}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 max-w-4xl w-full border-y border-slate-900 py-6">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">10,000+</div>
            <div className="text-xs text-slate-400 mt-0.5">Learners Empowered</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">100%</div>
            <div className="text-xs text-slate-400 mt-0.5">Gated Invariant Enforced</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">4.9 / 5.0</div>
            <div className="text-xs text-slate-400 mt-0.5">Learner Satisfaction</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">&lt; 1 Second</div>
            <div className="text-xs text-slate-400 mt-0.5">Google Onboarding</div>
          </div>
        </div>
      </section>

      {/* ──── Interactive Demo Section ──── */}
      <section id="demo" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            <Play className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How Gated Progression Works
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Click on the milestones below to experience how Pathfinder ensures structured mastery.
          </p>
        </div>

        {/* Demo Roadmap Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {demoNodes.map((node) => {
            const isSelected = activeDemoNode === node.id;
            const isCompleted = node.status === 'completed';
            const isAvailable = node.status === 'available';
            const isLocked = node.status === 'locked';

            return (
              <div
                key={node.id}
                onClick={() => setActiveDemoNode(node.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-600/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Step {node.id}
                  </span>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <Unlock className="w-3.5 h-3.5" />
                      Ready to Learn
                    </span>
                  )}
                  {isLocked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                      <Lock className="w-3.5 h-3.5" />
                      Prerequisite Locked
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1.5">{node.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{node.desc}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{node.category}</span>
                  <span className={`font-bold ${isCompleted ? 'text-emerald-400' : isAvailable ? 'text-amber-400' : 'text-slate-500'}`}>
                    {node.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──── Core Features Grid ──── */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Serious Skill Mastery
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Every feature is engineered to provide absolute clarity for learners and powerful management for creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Visual Node Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Design multi-branching learning pathways on an infinite visual canvas with drag-and-drop ease and strict cycle-detection.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Assessments</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Attach multiple-choice or short-answer quizzes with custom passing thresholds. Confetti and immediate celebratory feedback when conquered.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Role Boundary Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rigorous backend role enforcement guarantees students cannot bypass prerequisites or alter unpublished roadmaps.
            </p>
          </div>
        </div>
      </section>

      {/* ──── Final CTA ──── */}
      <section className="py-24 px-4 sm:px-8 max-w-5xl mx-auto text-center relative">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-purple-950/40 border border-indigo-800/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">
            Start your personalized journey today.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Join thousands of learners and top educators who learn and teach with structured clarity.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl transition-all"
            >
              <span>Get Started in 1 Click</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm transition-all"
            >
              <span>Sign In with Existing Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="py-8 px-4 sm:px-8 border-t border-slate-900 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white">Pathfinder</span>
          <span>&mdash; Structured Learning for Thousands of Learners</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Pathfinder Learning Platform. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
export default LandingPage;
