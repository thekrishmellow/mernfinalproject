import React from 'react';
import {
  Check,
  Lock,
  Play,
  Clock,
  Flag,
  Award,
  Zap,
  BookOpen,
  HelpCircle,
  FileQuestion,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const STEP_LABELS = ['Warmup', 'Strides', 'Sprint', 'Laps', 'Race', 'Mastery'];

export function ByjuStepperTrack({ nodes = [], onSelectNode, onResume }) {
  // Find current active node (first available or in_progress node)
  const activeIndex = nodes.findIndex((n) => n.status === 'available' || n.status === 'in_progress');
  const activeNode = activeIndex >= 0 ? nodes[activeIndex] : nodes[0];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Practice Journey</span>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Learning Milestones</h3>
          <p className="text-xs text-slate-500 mt-1">
            Practice makes perfect. Complete each lap to unlock advanced assessments!
          </p>
        </div>

        {activeNode && (
          <button
            onClick={() => onResume && onResume(activeNode.id)}
            className="self-start sm:self-auto px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Resume Practice
          </button>
        )}
      </div>

      {/* Stepper Track */}
      <div className="relative pt-4 pb-2">
        <div className="flex items-center justify-between relative z-10 overflow-x-auto pb-4 gap-4 sm:gap-6">
          {nodes.map((node, index) => {
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'available' || node.status === 'in_progress';
            const isLocked = node.status === 'locked';
            const stepLabel = STEP_LABELS[index % STEP_LABELS.length];

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode && onSelectNode(node)}
                className="flex flex-col items-center min-w-[76px] cursor-pointer group"
              >
                {/* Node Icon Circle */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                    isCompleted
                      ? 'border-2 border-amber-500 bg-amber-50 text-amber-600 shadow-md shadow-amber-500/10'
                      : isActive
                      ? 'border-3 border-orange-500 bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/30 scale-110 ring-4 ring-orange-100'
                      : 'border-2 border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <div className="relative">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    </div>
                  ) : isActive ? (
                    <Zap className="w-6 h-6 fill-white text-white animate-pulse" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Milestone label */}
                <span
                  className={`text-xs mt-2.5 font-bold tracking-tight text-center ${
                    isActive ? 'text-orange-600 font-extrabold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {stepLabel}
                </span>

                <span className="text-[10px] text-slate-400 text-center line-clamp-1 max-w-[80px] mt-0.5">
                  {node.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Connecting track line */}
        <div className="absolute top-11 left-8 right-8 h-1 bg-slate-100 z-0 hidden sm:block">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{
              width: `${
                nodes.length > 1
                  ? (nodes.filter((n) => n.status === 'completed').length / (nodes.length - 1)) * 100
                  : 0
              }%`
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ByjuWindingTrail({ nodes = [], onSelectNode, onResume }) {
  const activeIndex = nodes.findIndex((n) => n.status === 'available' || n.status === 'in_progress');
  const activeNode = activeIndex >= 0 ? nodes[activeIndex] : nodes[0];

  const pillColors = [
    { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-400', shadow: 'shadow-emerald-500/25', ring: 'border-emerald-500' },
    { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-400', shadow: 'shadow-cyan-500/25', ring: 'border-cyan-500' },
    { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-400', shadow: 'shadow-orange-500/25', ring: 'border-orange-500' },
    { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-400', shadow: 'shadow-rose-500/25', ring: 'border-rose-500' },
    { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-400', shadow: 'shadow-purple-500/25', ring: 'border-purple-500' }
  ];

  return (
    <div className="relative py-8 px-4 max-w-2xl mx-auto">
      {/* 3D Mockup Container Frame */}
      <div className="relative bg-gradient-to-b from-white via-slate-50 to-white rounded-[40px] p-6 sm:p-10 border-4 border-slate-200 shadow-2xl shadow-slate-300/50">
        {/* Top Camera Speaker Notch */}
        <div className="w-24 h-1.5 bg-slate-300 rounded-full mx-auto mb-8" />

        {/* Header inside Phone */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-orange-500/20">
              🎓
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Your Curriculum Track</div>
              <h4 className="text-sm font-bold text-slate-800">Learning Journey</h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>20 Min Goal</span>
          </div>
        </div>

        {/* Trail Items in S-Curve */}
        <div className="relative space-y-12">
          {/* Dotted connecting SVG path behind nodes */}
          <div className="absolute inset-y-6 left-1/2 -translate-x-1/2 w-1 border-r-2 border-dashed border-blue-400/60 z-0 pointer-events-none" />

          {nodes.map((node, idx) => {
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'available' || node.status === 'in_progress';
            const isLocked = node.status === 'locked';
            const color = pillColors[idx % pillColors.length];

            // Alternating alignment: even index left-leaning, odd index right-leaning
            const isLeft = idx % 2 === 0;

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode && onSelectNode(node)}
                className={`relative z-10 flex items-center gap-4 cursor-pointer group transition-all duration-300 ${
                  isLeft ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Center Station Ring */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center bg-white border-4 transition-all shrink-0 ${
                    isCompleted
                      ? 'border-emerald-500 shadow-md shadow-emerald-500/20'
                      : isActive
                      ? `${color.ring} ring-8 ring-orange-100 shadow-xl scale-110`
                      : 'border-slate-300 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? `${color.bg} text-white animate-pulse`
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                </div>

                {/* 3D Pill Node Card */}
                <div
                  className={`flex-1 max-w-[280px] p-4 rounded-2xl border transition-all duration-200 transform group-hover:-translate-y-1 ${
                    isCompleted
                      ? 'bg-white border-slate-200 shadow-md hover:shadow-lg'
                      : isActive
                      ? `${color.bg} ${color.border} text-white shadow-xl ${color.shadow}`
                      : 'bg-slate-50/90 border-slate-200 text-slate-400 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? 'text-white/90' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      Module {idx + 1}
                    </span>

                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
                        Current Lap
                      </span>
                    )}
                  </div>

                  <h4
                    className={`text-sm font-bold leading-snug line-clamp-1 ${
                      isActive ? 'text-white' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {node.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-black/5">
                    <span
                      className={`text-[11px] ${
                        isActive ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {node.estimatedDuration || '1 week'}
                    </span>

                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isActive ? 'text-white' : 'text-blue-600'
                      }`}
                    >
                      {isActive ? 'Start' : 'View'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Floating Avatar Pin beside active node */}
                {isActive && (
                  <div className="hidden sm:flex flex-col items-center animate-bounce shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-md border-2 border-white">
                      You
                    </div>
                    <div className="w-2 h-2 bg-blue-600 rotate-45 -mt-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Finish Goal Flag */}
        <div className="mt-12 text-center pt-6 border-t border-slate-100">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
            <Flag className="w-4 h-4 text-orange-500" />
            Curriculum Completion Flag
          </div>
        </div>

        {/* Bottom Phone Bar */}
        <div className="mt-8 flex items-center justify-center gap-8 py-2">
          <div className="w-6 h-6 border-2 border-slate-300 rounded-md" />
          <div className="w-6 h-6 border-2 border-purple-400 rounded-md" />
          <div className="w-8 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
