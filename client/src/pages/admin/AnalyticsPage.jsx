import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Clock,
  FileQuestion,
  GitFork,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api.js';

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="font-bold text-slate-600 text-sm">Computing analytics &amp; progression metrics...</span>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Performance Metrics</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-850 tracking-tight">Progression &amp; Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect aggregate assessment performance, completion rates, and learner milestone velocity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Assessment Pass Rate</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-850 font-mono tracking-tight">
            {m.totalQuizAttempts > 0
              ? Math.round((m.totalPassedAttempts / m.totalQuizAttempts) * 100)
              : 0}%
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            <span className="text-emerald-600 font-bold">{m.totalPassedAttempts || 0} passed</span> out of {m.totalQuizAttempts || 0} attempts across all gates
          </div>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Curriculum Completion</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-850 font-mono tracking-tight">
            {m.activeAssignments + m.completedAssignments > 0
              ? Math.round(
                  (m.completedAssignments /
                    (m.activeAssignments + m.completedAssignments)) *
                    100
                )
              : 0}%
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            <span className="text-emerald-600 font-bold">{m.completedAssignments || 0} completed</span> of{' '}
            {(m.activeAssignments || 0) + (m.completedAssignments || 0)} assignments
          </div>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Average Quiz Score</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-850 font-mono tracking-tight">
            {m.avgQuizPercentage || 0}%
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Average learner score across all question banks
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            Live Learner Progression Feed
          </h3>
          <span className="text-xs font-bold text-slate-400">Real-time milestones</span>
        </div>

        <div className="space-y-3">
          {(data?.recentActivities || []).map((act, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between text-xs transition-all">
              <div>
                <span className="font-extrabold text-slate-850">
                  {act.assignment?.client?.name || act.assignment?.targetEmail}
                </span>
                <span className="text-slate-500 ml-2 font-medium">
                  progressed in <strong className="text-slate-800">{act.assignment?.roadmap?.title}</strong>
                </span>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Checkpoint: <span className="font-mono text-purple-700 font-bold">{act.nodeId}</span> &bull; {new Date(act.lastActivityAt).toLocaleString()}
                </div>
              </div>
              <Badge variant={act.status === 'completed' ? 'success' : 'primary'} className="font-bold">
                {act.status}
              </Badge>
            </div>
          ))}
          {(!data?.recentActivities || data.recentActivities.length === 0) && (
            <div className="text-xs text-slate-400 italic py-8 text-center font-medium">
              No progression events recorded yet. Assign learning paths to clients to populate events.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
