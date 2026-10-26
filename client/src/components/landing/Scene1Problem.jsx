import React, { useState } from 'react';
import {
  CheckSquare,
  AlertCircle,
  HelpCircle,
  XCircle,
  FileText,
  Bookmark,
  Layers,
  ArrowDown,
  Sparkles,
  ZapOff
} from 'lucide-react';

export function Scene1Problem({ onExploreBlueprint }) {
  const [activeChaosCard, setActiveChaosCard] = useState(null);

  const scatteredTasks = [
    {
      id: 1,
      title: 'Watch 4.5h YouTube Crash Course',
      tag: 'Tutorial Trap',
      status: 'Checked, but zero retention',
      note: 'Watched at 1.5x speed. Still have no clue how to build from scratch.',
      rotation: '-rotate-2',
      color: 'border-rose-500/30 bg-rose-500/5'
    },
    {
      id: 2,
      title: 'Bookmark 38 Documentation Tabs',
      tag: 'Information Overload',
      status: 'Tabs open for 3 weeks',
      note: 'Conflicting versions, outdated Medium articles, no clear order.',
      rotation: 'rotate-3',
      color: 'border-amber-500/30 bg-amber-500/5'
    },
    {
      id: 3,
      title: 'Install 14 npm Packages Blindly',
      tag: 'Dependency Chaos',
      status: 'Copied from StackOverflow',
      note: 'Broke build. Nobody explained what the core architecture actually needs.',
      rotation: '-rotate-1',
      color: 'border-purple-500/30 bg-purple-500/5'
    },
    {
      id: 4,
      title: 'Start Tutorial Project #6',
      tag: 'False Progress',
      status: 'Abandoned at 60%',
      note: 'Hit an architectural wall. No mentor or milestones to guide recovery.',
      rotation: 'rotate-2',
      color: 'border-blue-500/30 bg-blue-500/5'
    }
  ];

  return (
    <section id="scene-problem" className="relative min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide uppercase">
          <ZapOff className="w-3.5 h-3.5 text-rose-400" />
          <span>The Problem: Learning Without a Path</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
          Stop collecting tasks.{' '}
          <span className="block mt-2 bg-gradient-to-r from-rose-400 via-amber-300 to-indigo-400 bg-clip-text text-transparent">
            Start making progress.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          Learning something new shouldn't mean juggling endless checklists, scattered resources, and wondering what to do next. You deserve a path designed around where you're going.
        </p>

        {/* Metric / Dilemma Comparison Pill */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <strong className="text-white">Busy ≠ Progress:</strong> Checkboxes satisfy the mind, but leave you stranded.
          </div>
        </div>
      </div>

      {/* Visual Direction: Disconnected floating tasks & chaos demonstration */}
      <div className="max-w-5xl mx-auto mt-16 w-full relative z-10">
        <div className="relative p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          {/* Header indicator */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  The Checklist Trap
                </span>
                <span className="text-[11px] text-slate-400">
                  Tasks floating without sequence, prerequisites, or guided outcomes
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Disconnected State
            </span>
          </div>

          {/* Interactive Scattered Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 relative z-10">
            {scatteredTasks.map((task) => (
              <div
                key={task.id}
                onMouseEnter={() => setActiveChaosCard(task.id)}
                onMouseLeave={() => setActiveChaosCard(null)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${task.color} ${
                  activeChaosCard === task.id
                    ? 'scale-[1.02] shadow-xl shadow-black/60 bg-slate-800/90 border-slate-600'
                    : task.rotation
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-rose-400/40 bg-rose-500/10 flex items-center justify-center text-[10px] text-rose-400 font-bold">
                      ✕
                    </div>
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                      {task.tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-400/90 bg-rose-500/10 px-2 py-0.5 rounded-md">
                    {task.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{task.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{task.note}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-500" /> Prerequisite: Unknown
                  </span>
                  <span>Missing Instructor Guidance</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Philosophical Callout */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-slate-200">A roadmap is not a to-do list.</strong> It is a guided journey from where you are today to what you want to become.
              </span>
            </div>
            <button
              onClick={onExploreBlueprint}
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer shrink-0"
            >
              <span>See the transformation</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
