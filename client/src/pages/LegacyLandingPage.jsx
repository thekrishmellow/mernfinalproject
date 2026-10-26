import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import {
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Code2,
  Target,
  Milestone,
  Sparkles,
  GraduationCap,
  Shield,
  Layout,
  Layers,
  TrendingUp,
  ChevronDown,
  Play,
  Lock,
  Unlock,
  Award,
  Users,
  BarChart3,
  FileQuestion,
  ClipboardCheck,
  Route,
  Zap,
  Eye
} from 'lucide-react';

/* ─── Scroll-reveal observer hook ─── */
function useScrollReveal() {
  const observerRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (prefersReduced) {
              entry.target.classList.add('landed-visible');
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'none';
            } else {
              entry.target.classList.add('landed-visible');
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = document.querySelectorAll('.land-reveal');
    targets.forEach((t) => observerRef.current.observe(t));

    return () => observerRef.current?.disconnect();
  }, []);
}

/* ─── Animated Roadmap SVG (hero illustration) ─── */
function HeroRoadmapSVG() {
  return (
    <div className="hero-roadmap-container" aria-hidden="true">
      <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Grid dots */}
        {Array.from({ length: 15 }).map((_, row) =>
          Array.from({ length: 20 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={40 + col * 40}
              cy={30 + row * 35}
              r="1.2"
              fill="rgba(148,163,184,0.12)"
            />
          ))
        )}

        {/* Connection paths */}
        <path
          d="M120 100 C200 100, 200 180, 280 180"
          stroke="url(#pathGrad1)"
          strokeWidth="2.5"
          strokeDasharray="8 4"
          className="hero-path hero-path-1"
          strokeLinecap="round"
        />
        <path
          d="M280 180 C360 180, 360 100, 440 100"
          stroke="url(#pathGrad2)"
          strokeWidth="2.5"
          strokeDasharray="8 4"
          className="hero-path hero-path-2"
          strokeLinecap="round"
        />
        <path
          d="M440 100 C520 100, 520 220, 600 220"
          stroke="url(#pathGrad3)"
          strokeWidth="2.5"
          strokeDasharray="8 4"
          className="hero-path hero-path-3"
          strokeLinecap="round"
        />
        <path
          d="M600 220 C660 220, 660 340, 700 340"
          stroke="url(#pathGrad4)"
          strokeWidth="2.5"
          className="hero-path hero-path-4"
          strokeLinecap="round"
        />

        {/* Node 1 — Start */}
        <g className="hero-node hero-node-1">
          <rect x="70" y="72" width="100" height="56" rx="16" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
          <rect x="70" y="72" width="100" height="56" rx="16" fill="url(#nodeGlow1)" opacity="0.3" />
          <text x="120" y="96" textAnchor="middle" className="hero-node-label" fill="#93c5fd" fontSize="10" fontWeight="600">OVERVIEW</text>
          <text x="120" y="114" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Getting Started</text>
        </g>

        {/* Node 2 — Learning */}
        <g className="hero-node hero-node-2">
          <rect x="230" y="152" width="100" height="56" rx="16" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
          <rect x="230" y="152" width="100" height="56" rx="16" fill="url(#nodeGlow2)" opacity="0.3" />
          <text x="280" y="176" textAnchor="middle" className="hero-node-label" fill="#c4b5fd" fontSize="10" fontWeight="600">MODULE</text>
          <text x="280" y="194" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Core Concepts</text>
        </g>

        {/* Node 3 — Practice */}
        <g className="hero-node hero-node-3">
          <rect x="390" y="72" width="100" height="56" rx="16" fill="#1e293b" stroke="#14b8a6" strokeWidth="2" />
          <rect x="390" y="72" width="100" height="56" rx="16" fill="url(#nodeGlow3)" opacity="0.3" />
          <text x="440" y="96" textAnchor="middle" className="hero-node-label" fill="#5eead4" fontSize="10" fontWeight="600">EXERCISE</text>
          <text x="440" y="114" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Hands-on Lab</text>
        </g>

        {/* Node 4 — Quiz Gate */}
        <g className="hero-node hero-node-4">
          <rect x="550" y="192" width="100" height="56" rx="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          <rect x="550" y="192" width="100" height="56" rx="16" fill="url(#nodeGlow4)" opacity="0.3" />
          <text x="600" y="216" textAnchor="middle" className="hero-node-label" fill="#fcd34d" fontSize="10" fontWeight="600">QUIZ GATE</text>
          <text x="600" y="234" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Assessment</text>
        </g>

        {/* Node 5 — Goal */}
        <g className="hero-node hero-node-5">
          <rect x="650" y="312" width="100" height="56" rx="16" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
          <rect x="650" y="312" width="100" height="56" rx="16" fill="url(#nodeGlow5)" opacity="0.4" />
          <text x="700" y="336" textAnchor="middle" className="hero-node-label" fill="#6ee7b7" fontSize="10" fontWeight="600">GOAL</text>
          <text x="700" y="354" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Mastery ✦</text>
        </g>

        {/* Scattered chaos nodes (scene 1 — before transformation) */}
        <g className="hero-chaos-nodes">
          <rect x="60" y="320" width="72" height="32" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" opacity="0.4" />
          <text x="96" y="340" textAnchor="middle" fill="#64748b" fontSize="9">Random task</text>

          <rect x="180" y="380" width="72" height="32" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" opacity="0.4" />
          <text x="216" y="400" textAnchor="middle" fill="#64748b" fontSize="9">Scattered</text>

          <rect x="310" y="350" width="72" height="32" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" opacity="0.35" />
          <text x="346" y="370" textAnchor="middle" fill="#64748b" fontSize="9">No order</text>

          <rect x="460" y="390" width="72" height="32" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" opacity="0.3" />
          <text x="496" y="410" textAnchor="middle" fill="#64748b" fontSize="9">Lost progress</text>
        </g>

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="pathGrad1" x1="120" y1="100" x2="280" y2="180">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="pathGrad2" x1="280" y1="180" x2="440" y2="100">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="pathGrad3" x1="440" y1="100" x2="600" y2="220">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="pathGrad4" x1="600" y1="220" x2="700" y2="340">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <radialGradient id="nodeGlow1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="transparent" /></radialGradient>
          <radialGradient id="nodeGlow2"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="transparent" /></radialGradient>
          <radialGradient id="nodeGlow3"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="transparent" /></radialGradient>
          <radialGradient id="nodeGlow4"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="transparent" /></radialGradient>
          <radialGradient id="nodeGlow5"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="transparent" /></radialGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ─── Milestone Card (Scene 4) ─── */
function MilestoneDetail() {
  return (
    <div className="w-full max-w-lg mx-auto land-reveal">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-purple-900/10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Milestone 02</span>
              <h4 className="text-base font-bold text-white -mt-0.5">Understand the Foundations</h4>
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="px-6 py-5 space-y-4">
          {[
            { icon: BookOpen, color: 'blue', label: 'Learn', desc: 'Curated lessons, reading material & video lectures' },
            { icon: Code2, color: 'teal', label: 'Practice', desc: 'Guided hands-on exercise with clear instructions' },
            { icon: FileQuestion, color: 'amber', label: 'Demonstrate', desc: 'Short assessment to confirm understanding' },
            { icon: Unlock, color: 'emerald', label: 'Advance', desc: 'Unlock the next milestone when requirements are met' }
          ].map((stage, i) => {
            const colors = {
              blue: 'from-blue-600 to-blue-500 text-blue-300 border-blue-800/60',
              teal: 'from-teal-600 to-teal-500 text-teal-300 border-teal-800/60',
              amber: 'from-amber-600 to-amber-500 text-amber-300 border-amber-800/60',
              emerald: 'from-emerald-600 to-emerald-500 text-emerald-300 border-emerald-800/60'
            };
            const Icon = stage.icon;
            return (
              <div key={stage.label} className={`flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-800/60 bg-slate-950/50 milestone-stage milestone-stage-${i + 1}`}>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors[stage.color].split(' ').slice(0, 2).join(' ')} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className={`text-xs font-bold ${colors[stage.color].split(' ')[2]}`}>{stage.label}</span>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Progress Journey (Scene 5) ─── */
function ProgressJourney() {
  const milestones = [
    { label: 'Getting Started', status: 'completed', icon: CheckCircle2 },
    { label: 'Core Concepts', status: 'completed', icon: CheckCircle2 },
    { label: 'Hands-on Lab', status: 'current', icon: Play },
    { label: 'Assessment Gate', status: 'locked', icon: Lock },
    { label: 'Mastery ✦', status: 'locked', icon: Award }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto land-reveal">
      <div className="relative flex flex-col gap-0">
        {milestones.map((m, i) => {
          const isCompleted = m.status === 'completed';
          const isCurrent = m.status === 'current';
          const isLocked = m.status === 'locked';
          const Icon = m.icon;

          return (
            <div key={m.label} className="flex items-start gap-4 relative">
              {/* Vertical connector */}
              {i < milestones.length - 1 && (
                <div
                  className={`absolute left-[19px] top-[40px] w-[2px] h-[calc(100%-8px)] ${
                    isCompleted ? 'bg-gradient-to-b from-emerald-500 to-emerald-500/30' : 'bg-slate-800'
                  }`}
                />
              )}

              {/* Icon circle */}
              <div
                className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isCompleted
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                    : isCurrent
                    ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20 scale-110 progress-pulse'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-600'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>

              {/* Label */}
              <div className={`pb-8 pt-2 ${isLocked ? 'opacity-40' : ''}`}>
                <span
                  className={`text-sm font-bold ${
                    isCompleted ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {m.label}
                </span>
                {isCurrent && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                    IN PROGRESS
                  </span>
                )}
                {isCompleted && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    COMPLETE
                  </span>
                )}
                {isLocked && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 font-bold border border-slate-700">
                    LOCKED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Perspective Cards (Scene 6) ─── */
function PerspectiveCard({ title, icon: Icon, color, items }) {
  const colorMap = {
    indigo: 'from-indigo-600 to-purple-600 shadow-indigo-500/20 border-indigo-500/30',
    blue: 'from-blue-600 to-cyan-600 shadow-blue-500/20 border-blue-500/30'
  };

  return (
    <div className="land-reveal flex-1 min-w-[280px]">
      <div className={`rounded-3xl border bg-slate-900/80 backdrop-blur-xl p-6 h-full ${colorMap[color].split(' ').slice(2).join(' ')}`}>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color].split(' ').slice(0, 2).join(' ')} flex items-center justify-center mb-4 shadow-xl ${colorMap[color].split(' ')[2]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h4 className="text-lg font-bold text-white mb-4">{title}</h4>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ════════════════════════════════════════ */
export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useScrollReveal();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="landing-root bg-slate-950 text-slate-100 overflow-x-hidden">

      {/* ──── Sticky Nav ──── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-slate-800/60 shadow-xl shadow-black/20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">
              Pathfinder
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>


      {/* ════════════════════════════════════
          SCENE 1 — The Problem: Without a Path
         ════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="land-reveal">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
              <Route className="w-3.5 h-3.5" />
              Personalized Learning Roadmaps
            </span>
          </div>

          <h1 className="land-reveal text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Stop collecting tasks.<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Start making progress.
            </span>
          </h1>

          <p className="land-reveal text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Learning something new shouldn't mean juggling endless checklists, scattered resources, and wondering what to do next. You deserve a path designed around where you're going.
          </p>

          <div className="land-reveal flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/25 hover:shadow-blue-600/35 transition-all"
            >
              Start your journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm px-5 py-3 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all bg-slate-900/50 hover:bg-slate-800/50"
            >
              I'm on my journey — Sign in
            </Link>
          </div>
        </div>

        {/* Hero Roadmap Illustration */}
        <div className="relative z-10 w-full max-w-4xl mx-auto land-reveal">
          <HeroRoadmapSVG />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 scroll-hint">
          <span className="text-[10px] uppercase tracking-widest font-bold">Discover</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>


      {/* ════════════════════════════════════
          SCENE 2 — From Tasks to a Journey
         ════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="land-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            The Transformation
          </span>

          <h2 className="land-reveal text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Your learning deserves<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              a blueprint.
            </span>
          </h2>

          <p className="land-reveal text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-16">
            Your instructor plans the route. Every milestone has a purpose. Every step builds on the last. You always know what you're learning, why it matters, and where it leads.
          </p>

          {/* Visual: Chaos → Structure transformation */}
          <div className="land-reveal max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Before */}
              <div className="p-6 rounded-3xl border border-slate-800/60 bg-slate-900/50 backdrop-blur relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 to-transparent" />
                <div className="relative z-10">
                  <span className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Before</span>
                  <h4 className="text-sm font-bold text-slate-300 mt-2 mb-4">Scattered checklist</h4>
                  <div className="space-y-2">
                    {['Read Ch. 1–3', 'Watch some video', 'Try exercises?', 'Find a tutorial', '???'].map((t, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs text-slate-500 p-2 rounded-lg border border-slate-800/50 bg-slate-950/50 ${i > 2 ? 'opacity-50 rotate-1' : i > 1 ? '-rotate-0.5' : ''}`}>
                        <div className="w-3.5 h-3.5 rounded border border-slate-600 shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="p-6 rounded-3xl border border-purple-500/30 bg-slate-900/50 backdrop-blur relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 to-transparent" />
                <div className="relative z-10">
                  <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">After</span>
                  <h4 className="text-sm font-bold text-white mt-2 mb-4">Guided learning journey</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Overview', color: 'blue', done: true },
                      { label: 'Core Concepts', color: 'purple', done: true },
                      { label: 'Hands-on Lab', color: 'teal', done: false, current: true },
                      { label: 'Assessment', color: 'amber', done: false },
                      { label: 'Mastery ✦', color: 'emerald', done: false }
                    ].map((s, i) => {
                      const dotColor = s.done ? 'bg-emerald-500' : s.current ? 'bg-blue-500 ring-2 ring-blue-500/30' : 'bg-slate-700';
                      return (
                        <div key={i} className="flex items-center gap-3">
                          {i > 0 && <div className={`absolute ml-[7px] -mt-5 w-[2px] h-3 ${s.done || s.current ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />}
                          <div className={`relative w-4 h-4 rounded-full ${dotColor} shrink-0 flex items-center justify-center`}>
                            {s.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                            {s.current && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`text-xs font-semibold ${s.done ? 'text-emerald-400' : s.current ? 'text-white' : 'text-slate-500'}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          SCENE 3 — Meet the Journey Creator
         ════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="land-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6">
              <Layout className="w-3.5 h-3.5" />
              Roadmap Studio
            </span>

            <h2 className="land-reveal text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Designed by your guide.<br />
              <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Experienced by you.
              </span>
            </h2>

            <p className="land-reveal text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Teachers, instructors, and mentors turn their expertise into structured learning journeys. They decide the milestones, organize the resources, set expectations, and define what it means to be ready for the next stage.
            </p>
          </div>

          {/* Studio mockup: illustrative canvas */}
          <div className="land-reveal">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl shadow-black/20">
              {/* Mock toolbar */}
              <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono ml-3">Roadmap Studio — JavaScript Mastery Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">Published</span>
                </div>
              </div>

              {/* Mock canvas content */}
              <div className="p-6 sm:p-8 min-h-[300px] relative bg-[radial-gradient(circle,_rgba(148,163,184,0.06)_1px,_transparent_1px)] bg-[length:24px_24px]">
                {/* Canvas nodes */}
                <div className="flex flex-wrap items-start gap-4 sm:gap-6">
                  {[
                    { label: 'Introduction', type: 'OVERVIEW', color: 'border-blue-500/60 bg-blue-950/30', badge: 'text-blue-400 bg-blue-500/10' },
                    { label: 'Variables & Types', type: 'MODULE', color: 'border-purple-500/60 bg-purple-950/30', badge: 'text-purple-400 bg-purple-500/10' },
                    { label: 'Functions Lab', type: 'EXERCISE', color: 'border-teal-500/60 bg-teal-950/30', badge: 'text-teal-400 bg-teal-500/10' },
                    { label: 'Mid-term Quiz', type: 'QUIZ GATE', color: 'border-amber-500/60 bg-amber-950/30', badge: 'text-amber-400 bg-amber-500/10' },
                    { label: 'Async Mastery', type: 'GOAL', color: 'border-emerald-500/60 bg-emerald-950/30', badge: 'text-emerald-400 bg-emerald-500/10' }
                  ].map((n, i) => (
                    <div
                      key={n.label}
                      className={`p-4 rounded-2xl border backdrop-blur ${n.color} min-w-[140px] studio-node studio-node-${i + 1}`}
                    >
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${n.badge}`}>{n.type}</span>
                      <p className="text-sm font-bold text-white mt-2">{n.label}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                        <FileText className="w-3 h-3" />
                        <span>3 resources</span>
                        <ClipboardCheck className="w-3 h-3 ml-1" />
                        <span>2 tasks</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap gap-2 mt-8">
                  {['Connected Milestones', 'Resource Attachments', 'Quiz Gates', 'Prerequisites', 'Assignments'].map((f) => (
                    <span key={f} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 font-medium border border-slate-700/60">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          SCENE 4 — Every Milestone Has Purpose
         ════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="land-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold mb-6">
              <Target className="w-3.5 h-3.5" />
              Milestone Anatomy
            </span>

            <h2 className="land-reveal text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Know what it takes<br />
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                to move forward.
              </span>
            </h2>

            <p className="land-reveal text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              No more guessing what to study next. Each milestone brings together the resources, instructions, and work your guide has prepared for you.
            </p>
          </div>

          <MilestoneDetail />
        </div>
      </section>


      {/* ════════════════════════════════════
          SCENE 5 — Progress That Means Something
         ════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="land-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              Meaningful Progression
            </span>

            <h2 className="land-reveal text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Progress is more than<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                checking a box.
              </span>
            </h2>

            <p className="land-reveal text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Completing a step matters. Understanding it matters more. Your journey follows the progression your instructor designed, so every milestone prepares you for what comes next.
            </p>
          </div>

          <ProgressJourney />
        </div>
      </section>


      {/* ════════════════════════════════════
          SCENE 6 — Two Perspectives
         ════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="land-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6">
              <Users className="w-3.5 h-3.5" />
              Two Perspectives
            </span>

            <h2 className="land-reveal text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
              One journey.<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                A guide who plans it. A learner who lives it.
              </span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <PerspectiveCard
              title="For Instructors & Creators"
              icon={Shield}
              color="indigo"
              items={[
                'Build structured roadmaps on a visual canvas',
                'Organize milestones, prerequisites & resources',
                'Attach assignments, study material & quizzes',
                'Assign journeys to individual or multiple learners',
                'Define progression & completion requirements'
              ]}
            />
            <PerspectiveCard
              title="For Learners"
              icon={GraduationCap}
              color="blue"
              items={[
                'Access journeys assigned by your guide',
                'Follow a clear sequence of learning milestones',
                'Study curated resources & complete required work',
                'Take assessments where configured',
                'Track progress & unlock subsequent stages'
              ]}
            />
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          SCENE 7 — Final CTA → Auth
         ════════════════════════════════════ */}
      <section className="relative py-24 sm:py-36 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="land-reveal inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-2xl shadow-blue-500/30 mb-8">
            <Compass className="w-8 h-8" />
          </div>

          <h2 className="land-reveal text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Your next chapter starts<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              with a clear path.
            </span>
          </h2>

          <p className="land-reveal text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
            Whether you're creating a learning journey for others or following one toward your own goals, start with a plan that takes you somewhere.
          </p>

          <div className="land-reveal flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/25 hover:shadow-blue-600/35 transition-all"
            >
              Start your journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold text-base px-6 py-4 rounded-2xl border border-slate-700 hover:border-slate-500 transition-all bg-slate-900/50 hover:bg-slate-800/50"
            >
              I'm already on my journey — Sign in
            </Link>
          </div>
        </div>
      </section>


      {/* ──── Footer ──── */}
      <footer className="border-t border-slate-800/60 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Compass className="w-4 h-4" />
            <span className="font-bold text-slate-400">Pathfinder</span>
            <span>&mdash; Personalized Learning Roadmaps</span>
          </div>
          <div className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Pathfinder Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
