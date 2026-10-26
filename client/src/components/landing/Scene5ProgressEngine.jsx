import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileQuestion,
  Award
} from 'lucide-react';

export function Scene5ProgressEngine() {
  const [unlockedNext, setUnlockedNext] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulatePass = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setUnlockedNext(true);
      setIsSimulating(false);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully if canvas-confetti context is unavailable
      }
    }, 700);
  };

  const handleReset = () => {
    setUnlockedNext(false);
  };

  return (
    <section id="scene-progression" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden border-t border-slate-900 bg-slate-950">
      <div className="absolute top-1/2 right-1/3 w-[600px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>Meaningful Progression Engine</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Progress is more than{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
            checking a box.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          Completing a step matters. Understanding it matters more. Your journey follows the progression your instructor designed, so every milestone prepares you for what comes next.
        </p>
      </div>

      {/* Interactive Progression Engine Simulator */}
      <div className="max-w-5xl mx-auto mt-16 w-full relative z-10">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                Live Interactive Simulation
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Gated Progression in Action
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {!unlockedNext ? (
                <button
                  onClick={handleSimulatePass}
                  disabled={isSimulating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSimulating ? 'Validating Gated Assessment...' : 'Simulate Passing Assessment'}</span>
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Simulation</span>
                </button>
              )}
            </div>
          </div>

          {/* Sequential Milestone Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative">
            {/* Stage 1: Already Completed */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Milestone 01
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Completed</span>
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Architectural Foundations</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                All prerequisites, study notes, and setup tasks verified by mentor.
              </p>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Score: 100%</span>
                <span className="text-emerald-400 font-medium">Gate Satisfied ✓</span>
              </div>
            </div>

            {/* Stage 2: Active or Just Completed */}
            <div
              className={`p-6 rounded-2xl border transition-all duration-500 relative ${
                unlockedNext
                  ? 'bg-slate-950/80 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
                  : 'bg-indigo-950/30 border-indigo-500/50 shadow-xl shadow-indigo-500/10'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  Milestone 02
                </span>
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    unlockedNext ? 'text-emerald-400' : 'text-indigo-400'
                  }`}
                >
                  {unlockedNext ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Passed & Attested</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span>Active Stage</span>
                    </>
                  )}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Async Event Streams</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {unlockedNext
                  ? 'Gated diagnostic passed with 90%! Requirements verified.'
                  : 'Currently studying resources & completing worker pipeline lab.'}
              </p>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Gated Quiz (80% req)</span>
                <span className={`font-bold ${unlockedNext ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {unlockedNext ? 'Achieved: 90%' : 'Pending submission'}
                </span>
              </div>
            </div>

            {/* Stage 3: Locked or Unlocked */}
            <div
              className={`p-6 rounded-2xl border transition-all duration-500 relative ${
                unlockedNext
                  ? 'bg-indigo-950/30 border-indigo-400 shadow-xl shadow-indigo-500/20 scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full">
                  Milestone 03
                </span>
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    unlockedNext ? 'text-indigo-300' : 'text-amber-400'
                  }`}
                >
                  {unlockedNext ? (
                    <>
                      <Unlock className="w-4 h-4 text-indigo-400 animate-bounce" />
                      <span>Unlocked & Active!</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Locked Gate</span>
                    </>
                  )}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Performance Optimization</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {unlockedNext
                  ? 'Prerequisites satisfied! All curated lessons & lab files are now accessible.'
                  : 'Gated: Requires passing Milestone 02 assessment first.'}
              </p>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Prerequisite: M02</span>
                <span className={unlockedNext ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {unlockedNext ? 'Gate Cleared ✓' : 'Enforced Lock'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Philosophical Note */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Zero Guesswork:</strong> Learners advance strictly on demonstrated comprehension, not arbitrary timelines.
              </span>
            </span>
            <span className="text-slate-500 hidden sm:inline">Pathfinder Progression Engine</span>
          </div>
        </div>
      </div>
    </section>
  );
}
