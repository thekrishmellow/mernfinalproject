import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  FileQuestion,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  FileText,
  Clock,
  ShieldAlert,
  Award
} from 'lucide-react';

export function Scene4MilestonePurpose() {
  const [activeStageTab, setActiveStageTab] = useState('learn'); // 'learn' | 'practice' | 'demonstrate' | 'advance'

  const stages = [
    {
      id: 'learn',
      title: '1. Learn',
      subtitle: 'Curated Lessons & Readings',
      icon: BookOpen,
      badge: 'Knowledge Acquisition',
      color: 'border-blue-500 bg-blue-500/10 text-blue-400',
      description:
        'Instead of drowning in hundreds of open browser tabs, your mentor provides the exact reading and reference materials required for this stage.',
      items: [
        { title: 'Core Engine Architecture Deep-Dive', type: 'PDF Document', meta: '18 pages • 25m read' },
        { title: 'Asynchronous Event Stream Patterns', type: 'Technical Note', meta: 'Annotated by Instructor' },
        { title: 'Fault-Tolerant Pipeline Design Principles', type: 'Case Study', meta: 'Real-world System Breakdown' }
      ]
    },
    {
      id: 'practice',
      title: '2. Practice',
      subtitle: 'Hands-on Labs & Implementation',
      icon: Code2,
      badge: 'Deliberate Application',
      color: 'border-purple-500 bg-purple-500/10 text-purple-400',
      description:
        'Theory without implementation creates an illusion of understanding. This step asks you to build and test before moving forward.',
      items: [
        { title: 'Implement Worker Queue with Exponential Backoff', type: 'Code Exercise', meta: 'Required Task' },
        { title: 'Build Fallback Circuit-Breaker Mechanism', type: 'Hands-on Lab', meta: 'Required Task' },
        { title: 'Verify Local Pipeline Benchmark Tests', type: 'Self-Check Task', meta: 'Attestation Required' }
      ]
    },
    {
      id: 'demonstrate',
      title: '3. Demonstrate',
      subtitle: 'Gated Assessment & Validation',
      icon: FileQuestion,
      badge: 'Proof of Mastery',
      color: 'border-amber-500 bg-amber-500/10 text-amber-400',
      description:
        'A short, focused assessment that verifies comprehension. No guesswork. If you understand the concepts, you advance. If not, review and retry.',
      items: [
        { title: 'Architectural Concurrency Diagnostic', type: 'Gated Quiz', meta: '10 Questions • Multiple Choice' },
        { title: 'Passing Threshold Requirement', type: 'Enforced Rule', meta: '80% (8/10) minimum score to unlock' },
        { title: 'Unlimited Re-attempts with Randomization', type: 'Mastery Policy', meta: 'Encourages genuine learning' }
      ]
    },
    {
      id: 'advance',
      title: '4. Advance',
      subtitle: 'Automated Milestone Unlock',
      icon: Unlock,
      badge: 'Sequential Progress',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
      description:
        'Once all conditions are satisfied, the progression engine illuminates your roadmap and unlocks Milestone 03 automatically.',
      items: [
        { title: 'Milestone 02 Marked Complete', type: 'Progress Updated', meta: 'Persisted to learner record' },
        { title: 'Milestone 03: Performance Optimization Unlocked', type: 'Subsequent Stage', meta: 'Now Active & Accessible' },
        { title: 'Instructor Dashboard Updated', type: 'Audit Sync', meta: 'Teacher sees your verified completion' }
      ]
    }
  ];

  const currentStage = stages.find((s) => s.id === activeStageTab) || stages[0];

  return (
    <section id="scene-milestones" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden border-t border-slate-900 bg-slate-950">
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[500px] bg-teal-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Every Milestone Has a Purpose</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Know what it takes to{' '}
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-300 bg-clip-text text-transparent">
            move forward.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          No more guessing what to study next. Each milestone brings together the resources, instructions, and work your guide has prepared for you.
        </p>
      </div>

      {/* The 4-Stage Learning Lifecycle Demonstration Card */}
      <div className="max-w-5xl mx-auto mt-16 w-full relative z-10">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Milestone Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/20">
                02
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                  Example Milestone Inspection
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Milestone 02: Understand the Foundations
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                Active Learning Stage
              </span>
            </div>
          </div>

          {/* 4 Interactive Stages Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8">
            {stages.map((st) => {
              const Icon = st.icon;
              const isActive = activeStageTab === st.id;

              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStageTab(st.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-800/95 border-indigo-400 shadow-lg text-white scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">{st.title}</span>
                  </div>
                  <span className="text-[11px] block text-slate-400 leading-snug">{st.subtitle}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Details Panel */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  Stage Dimension: {currentStage.badge}
                </span>
                <h4 className="text-xl font-extrabold text-white">{currentStage.subtitle}</h4>
              </div>
              <span className="text-xs text-slate-400 max-w-sm sm:text-right leading-relaxed">
                {currentStage.description}
              </span>
            </div>

            {/* Stage items list */}
            <div className="space-y-3">
              {currentStage.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{item.title}</h5>
                      <span className="text-xs text-slate-400">{item.meta}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-300 bg-slate-800 px-3 py-1 rounded-full self-start sm:self-center">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Stages are interconnected. Completing them prepares you for the next milestone.
              </span>
              <span className="font-mono text-indigo-400 hidden sm:inline">Pathfinder Core Principle</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
