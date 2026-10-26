import React, { useState } from 'react';
import {
  Compass,
  BookOpen,
  Code2,
  FileQuestion,
  Milestone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GitCommit,
  Unlock,
  Lock
} from 'lucide-react';

export function Scene2Transformation() {
  const [selectedStation, setSelectedStation] = useState(1);

  const stations = [
    {
      id: 0,
      code: 'M01',
      title: 'Architectural Foundations',
      category: 'Overview & Setup',
      icon: Compass,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Mastered',
      status: 'completed',
      purpose: 'Establishes mental models, environmental prerequisites, and core execution boundaries.',
      prerequisite: 'None — Onboarding Point',
      unlocks: 'Unlocks M02: Core Data Flow',
      requirements: ['3 Vetted Technical Docs', 'Initial Architecture Setup', 'Environment Validation']
    },
    {
      id: 1,
      code: 'M02',
      title: 'Core Mechanics & Event Flow',
      category: 'In-Depth Module',
      icon: BookOpen,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Active Stage',
      status: 'active',
      purpose: 'Deep dive into asynchronous stream patterns and decoupled worker pipelines.',
      prerequisite: 'Requires M01 completion',
      unlocks: 'Unlocks M03 Assessment Gate',
      requirements: ['2 Core Architectural Papers', 'Hands-on Pipeline Lab', 'Self-Check Checklist']
    },
    {
      id: 2,
      code: 'M03',
      title: 'Gated Assessment Gate',
      category: 'Assessment Gate',
      icon: FileQuestion,
      color: 'from-amber-500 to-orange-500',
      badge: 'Enforced Gate',
      status: 'gated',
      purpose: 'Validates mastery before unlocking production access. Ensures zero learning gaps.',
      prerequisite: 'Requires M02 completion',
      unlocks: 'Unlocks M04 Capstone Milestone',
      requirements: ['80% Minimum Quiz Score', 'Code Review Task Attestation', 'Prerequisite Rule Enforced']
    },
    {
      id: 3,
      code: 'M04',
      title: 'Production Capstone & Mastery',
      category: 'Capstone Outcome',
      icon: Milestone,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Intended Outcome',
      status: 'future',
      purpose: 'The culmination of your journey. Delivering resilient, production-ready software.',
      prerequisite: 'Requires Passing M03 Gate',
      unlocks: 'Platform Certification & Verification',
      requirements: ['End-to-End System Deployment', 'Observability Instrumentation', 'Final Submission']
    }
  ];

  return (
    <section id="scene-transformation" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden border-t border-slate-900 bg-slate-950">
      {/* Background radial gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>The Transformation: From Tasks to a Journey</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Your learning deserves{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            a blueprint.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          Your instructor plans the route. Every milestone has a purpose. Every step builds on the last. You always know what you're learning, why it matters, and where it leads.
        </p>
      </div>

      {/* The Visual Centerpiece: Connected Roadmap Pathway */}
      <div className="max-w-6xl mx-auto mt-16 w-full relative z-10">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Top Roadmap Track Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Desktop continuous path line indicator */}
            <div className="hidden md:block absolute top-7 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 -z-0 opacity-40" />

            {stations.map((st) => {
              const Icon = st.icon;
              const isSelected = selectedStation === st.id;

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st.id)}
                  className={`relative z-10 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'bg-slate-800/95 border-indigo-400 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${st.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {st.code}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    {st.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">{st.title}</h3>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold ${
                        st.status === 'completed'
                          ? 'text-emerald-400'
                          : st.status === 'active'
                          ? 'text-indigo-300 font-bold'
                          : st.status === 'gated'
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {st.badge}
                    </span>
                    {st.status === 'gated' ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : st.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep-Dive Milestone Inspector Card for the Selected Station */}
          {stations[selectedStation] && (
            <div className="mt-8 p-6 rounded-2xl bg-slate-950/90 border border-indigo-500/30 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      Station Inspection: {stations[selectedStation].code}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {stations[selectedStation].category}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">
                    {stations[selectedStation].title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {stations[selectedStation].purpose}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Prerequisite Rule
                      </span>
                      <span className="text-slate-200 font-medium">
                        {stations[selectedStation].prerequisite}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Downstream Progression
                      </span>
                      <span className="text-indigo-300 font-medium">
                        {stations[selectedStation].unlocks}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-6 pt-4 lg:pt-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Curated Learning Criteria
                  </span>
                  <ul className="space-y-2">
                    {stations[selectedStation].requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed">
                      💡 <strong>Key Difference:</strong> Unlike an isolated to-do item, this milestone cannot be bypassed without meeting mastery conditions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
