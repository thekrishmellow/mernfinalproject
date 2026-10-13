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
  Sparkles
} from 'lucide-react';

const NODE_TYPE_META = {
  start: {
    label: 'Introduction',
    icon: Compass,
    color: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-500/40',
    badgeVariant: 'bg-blue-500/10 text-blue-400'
  },
  learning: {
    label: 'Learning Module',
    icon: BookOpen,
    color: 'from-indigo-600 to-violet-600',
    borderColor: 'border-indigo-500/40',
    badgeVariant: 'bg-indigo-500/10 text-indigo-400'
  },
  practice: {
    label: 'Exercise',
    icon: Code2,
    color: 'from-teal-600 to-emerald-600',
    borderColor: 'border-teal-500/40',
    badgeVariant: 'bg-teal-500/10 text-teal-400'
  },
  quiz: {
    label: 'Assessment',
    icon: FileQuestion,
    color: 'from-amber-600 to-orange-600',
    borderColor: 'border-amber-500/40',
    badgeVariant: 'bg-amber-500/10 text-amber-400'
  },
  project: {
    label: 'Project Milestone',
    icon: Milestone,
    color: 'from-purple-600 to-pink-600',
    borderColor: 'border-purple-500/40',
    badgeVariant: 'bg-purple-500/10 text-purple-400'
  },
  completion: {
    label: 'Goal Complete',
    icon: Sparkles,
    color: 'from-emerald-600 to-green-600',
    borderColor: 'border-emerald-500/40',
    badgeVariant: 'bg-emerald-500/10 text-emerald-400'
  }
};

const STATUS_ICONS = {
  locked: { icon: Lock, color: 'text-slate-400', label: 'Locked' },
  available: { icon: Unlock, color: 'text-blue-400', label: 'Available' },
  in_progress: { icon: Clock, color: 'text-amber-400', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Completed' }
};

export const CustomRoadmapNode = memo(({ data, selected }) => {
  const meta = NODE_TYPE_META[data.type] || NODE_TYPE_META.learning;
  const Icon = meta.icon;

  // Learner view status if provided
  const status = data.status || 'available';
  const statusMeta = STATUS_ICONS[status] || STATUS_ICONS.available;
  const StatusIcon = statusMeta.icon;

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <div
      className={`relative min-w-[240px] max-w-[280px] rounded-2xl bg-slate-900/95 border transition-all duration-200 shadow-xl overflow-hidden ${
        selected ? 'ring-2 ring-blue-500 border-blue-500 shadow-blue-500/20' : meta.borderColor
      } ${
        isLocked
          ? 'opacity-75 grayscale-[30%] border-slate-700'
          : isCompleted
          ? 'ring-1 ring-emerald-500/50 border-emerald-500/50'
          : ''
      }`}
    >
      {/* Top Input Handle for prerequisites */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3.5 h-3.5 !bg-blue-500 !border-2 !border-slate-900 transition-transform hover:scale-125"
      />

      {/* Node Accent Header */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${meta.color}`} />

      <div className="p-4">
        {/* Type Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${meta.badgeVariant}`}>
            {meta.label}
          </span>

          {data.status && (
            <div className={`flex items-center gap-1 text-[11px] font-medium ${statusMeta.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusMeta.label}</span>
            </div>
          )}
        </div>

        {/* Node Title */}
        <div className="flex items-start gap-2.5">
          <div className={`p-2 rounded-xl bg-slate-800 text-white shrink-0 mt-0.5`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
              {data.title || 'Untitled Node'}
            </h4>
            {data.estimatedDuration && (
              <span className="text-[11px] text-slate-400 mt-1 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {data.estimatedDuration}
              </span>
            )}
          </div>
        </div>

        {/* Requirements badges footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            {data.quizConfig?.isRequired && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-medium">
                Quiz ({data.quizConfig?.passingPercentage || 80}%)
              </span>
            )}
            {data.tasks && data.tasks.length > 0 && (
              <span>{data.tasks.length} tasks</span>
            )}
          </div>
          {data.resourceIds && data.resourceIds.length > 0 && (
            <span>{data.resourceIds.length} resources</span>
          )}
        </div>
      </div>

      {/* Bottom Output Handle for downstream dependencies */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3.5 h-3.5 !bg-blue-500 !border-2 !border-slate-900 transition-transform hover:scale-125"
      />
    </div>
  );
});
