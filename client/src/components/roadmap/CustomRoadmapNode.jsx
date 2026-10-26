import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Compass,
  BookOpen,
  Code2,
  FileQuestion,
  Milestone,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  CheckSquare,
  Layers
} from 'lucide-react';

const NODE_TYPE_META = {
  start: {
    label: 'Overview',
    icon: Compass,
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/20',
    badgeVariant: 'bg-blue-50 text-blue-700 border-blue-200/80',
    borderActive: 'border-blue-500'
  },
  learning: {
    label: 'Module',
    icon: BookOpen,
    gradient: 'from-purple-600 to-indigo-600',
    shadow: 'shadow-purple-500/20',
    badgeVariant: 'bg-purple-50 text-purple-700 border-purple-200/80',
    borderActive: 'border-purple-600'
  },
  practice: {
    label: 'Exercise',
    icon: Code2,
    gradient: 'from-teal-500 to-emerald-600',
    shadow: 'shadow-teal-500/20',
    badgeVariant: 'bg-teal-50 text-teal-700 border-teal-200/80',
    borderActive: 'border-teal-500'
  },
  quiz: {
    label: 'Quiz Gate',
    icon: FileQuestion,
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-orange-500/20',
    badgeVariant: 'bg-amber-50 text-amber-800 border-amber-200/80',
    borderActive: 'border-amber-500'
  },
  project: {
    label: 'Milestone',
    icon: Milestone,
    gradient: 'from-rose-500 to-pink-600',
    shadow: 'shadow-rose-500/20',
    badgeVariant: 'bg-rose-50 text-rose-700 border-rose-200/80',
    borderActive: 'border-rose-500'
  },
  completion: {
    label: 'Final Goal',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    badgeVariant: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    borderActive: 'border-emerald-500'
  }
};

const STATUS_ICONS = {
  locked: { icon: Lock, color: 'text-slate-400', bg: 'bg-slate-100', label: 'Locked' },
  available: { icon: Unlock, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Available' },
  in_progress: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' }
};

export const CustomRoadmapNode = memo(({ data, selected }) => {
  const meta = NODE_TYPE_META[data.type] || NODE_TYPE_META.learning;
  const Icon = meta.icon;

  const status = data.status || 'available';
  const statusMeta = STATUS_ICONS[status] || STATUS_ICONS.available;
  const StatusIcon = statusMeta.icon;

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <div
      className={`relative min-w-[250px] max-w-[290px] rounded-3xl bg-white border-2 transition-all duration-200 shadow-sm hover:shadow-xl group select-none ${
        selected
          ? 'border-purple-600 ring-4 ring-purple-100 shadow-xl shadow-purple-500/15 scale-[1.02]'
          : 'border-slate-200/80 hover:border-slate-300'
      } ${
        isLocked
          ? 'opacity-80 bg-slate-50/80'
          : isCompleted
          ? 'ring-2 ring-emerald-400/40 border-emerald-400'
          : ''
      }`}
    >
      {/* Top Input Handle for prerequisites */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-purple-600 !border-2 !border-white !rounded-full shadow-md transition-transform hover:scale-125 -top-2"
      />

      {/* Top Gradient Banner Strip */}
      <div className={`h-2 w-full bg-gradient-to-r ${meta.gradient} rounded-t-[22px]`} />

      <div className="p-4 space-y-3">
        {/* Type Badge & Status Row */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${meta.badgeVariant}`}>
            {meta.label}
          </span>

          {data.status && (
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${statusMeta.bg} ${statusMeta.color}`}>
              <StatusIcon className="w-3 h-3 stroke-[2.5]" />
              <span>{statusMeta.label}</span>
            </div>
          )}
        </div>

        {/* Node Icon + Title */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${meta.gradient} text-white flex items-center justify-center shrink-0 shadow-md ${meta.shadow} group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-extrabold text-slate-850 leading-snug line-clamp-2">
              {data.title || 'Untitled Module'}
            </h4>
            {data.description && (
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                {data.description}
              </p>
            )}
          </div>
        </div>

        {/* Requirements badges footer */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.estimatedDuration && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                <Clock className="w-3 h-3" />
                {data.estimatedDuration}
              </span>
            )}
            {data.tasks && data.tasks.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                <CheckSquare className="w-3 h-3" />
                {data.tasks.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {data.quizConfig?.isRequired && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/60">
                Quiz Gate
              </span>
            )}
            {data.resourceIds && data.resourceIds.length > 0 && (
              <span className="text-[10px] text-slate-400">
                {data.resourceIds.length} doc{data.resourceIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Output Handle for downstream dependencies */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-4 !h-4 !bg-amber-500 !border-2 !border-white !rounded-full shadow-md transition-transform hover:scale-125 -bottom-2"
      />
    </div>
  );
});
