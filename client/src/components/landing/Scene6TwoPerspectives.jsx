import React, { useState } from 'react';
import {
  Compass,
  GraduationCap,
  Shield,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  BarChart3,
  Unlock,
  Award,
  BookOpen
} from 'lucide-react';

export function Scene6TwoPerspectives() {
  const [activePerspective, setActivePerspective] = useState('instructor'); // 'instructor' | 'learner'

  const instructorPoints = [
    'Build structured roadmaps on a responsive visual drag-and-drop canvas.',
    'Organize sequential milestones, prerequisites, and gated assessment checkpoints.',
    'Upload and attach private resources (PDFs, study notes, repos, and video lectures).',
    'Assign custom journey blueprints directly to client learner email accounts.',
    'Audit cohort progression and diagnose student bottlenecks in real time.'
  ];

  const learnerPoints = [
    'Access roadmaps assigned exclusively to your verified learner email account.',
    'Follow a crystal-clear sequence of learning milestones with guaranteed direction.',
    'Study curated, distraction-free resources without searching across 40 browser tabs.',
    'Take short gated assessments that confirm mastery before advancing.',
    'Experience the pride of unlocking successive milestones along an illuminated path.'
  ];

  return (
    <section id="scene-perspectives" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden border-t border-slate-900 bg-slate-950">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold tracking-wide uppercase">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>One Platform, Two Perspectives</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          One journey.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            A guide who plans it. A learner who lives it.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          The teacher's vision becomes the student's reality. Designed together to eliminate ambiguity and build true mastery.
        </p>

        {/* Perspective Switcher Toggle */}
        <div className="pt-4 inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <button
            onClick={() => setActivePerspective('instructor')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activePerspective === 'instructor'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>For Instructors & Creators</span>
          </button>
          <button
            onClick={() => setActivePerspective('learner')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activePerspective === 'learner'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>For Learners & Clients</span>
          </button>
        </div>
      </div>

      {/* Perspective Showcase Card */}
      <div className="max-w-5xl mx-auto mt-12 w-full relative z-10">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Key Capabilities List */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  {activePerspective === 'instructor' ? 'The Journey Architect' : 'The Guided Traveler'}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white">
                {activePerspective === 'instructor'
                  ? 'Turn your curriculum into an interactive experience'
                  : 'Follow an unambiguous roadmap built for your success'}
              </h3>

              <div className="space-y-3 pt-2">
                {(activePerspective === 'instructor' ? instructorPoints : learnerPoints).map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual Graphic Preview Card */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-white">
                    {activePerspective === 'instructor' ? 'Studio Control Console' : 'Learner Journey Experience'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {activePerspective === 'instructor' ? 'Admin Access' : 'Client Access'}
                </span>
              </div>

              {activePerspective === 'instructor' ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">Fullstack Web Architecture</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        v2.1 Published
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Assigned to 14 active learners &bull; 4 Milestone Gates configured
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Gating Rule Enforced</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      "Learner cannot access Milestone 03 until Milestone 02 Assessment is passed with ≥ 80%."
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
                    ✓ Instructor maintains single source of truth & creates structured client assignments.
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">Current Milestone: Async Streams</span>
                      <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        Stage 2 of 4
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[50%]" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">What to do next:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      "Read 'Event Streams in Depth' and take the 10-question diagnostic to unlock Milestone 03."
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
                    ✓ Learner always knows where they stand, why it matters, and what to study next.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
