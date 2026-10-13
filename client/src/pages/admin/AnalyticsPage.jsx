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
  GitFork
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
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Computing analytics &amp; progression metrics...</span>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Progression &amp; Analytics</h1>
        <p className="text-sm text-slate-400">
          Inspect aggregate assessment performance, completion rates, and client learning metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Assessment Pass Rate</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {m.totalQuizAttempts > 0
              ? Math.round((m.totalPassedAttempts / m.totalQuizAttempts) * 100)
              : 0}%
          </div>
          <div className="text-xs text-slate-400">
            {m.totalPassedAttempts || 0} passed out of {m.totalQuizAttempts || 0} total attempts across all gates
          </div>
        </Card>

        <Card className="p-6 border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Roadmap Completion Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {m.activeAssignments + m.completedAssignments > 0
              ? Math.round(
                  (m.completedAssignments /
                    (m.activeAssignments + m.completedAssignments)) *
                    100
                )
              : 0}%
          </div>
          <div className="text-xs text-slate-400">
            {m.completedAssignments || 0} completed of{' '}
            {(m.activeAssignments || 0) + (m.completedAssignments || 0)} assignments
          </div>
        </Card>

        <Card className="p-6 border-slate-800 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Average Quiz Performance</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {m.avgQuizPercentage || 0}%
          </div>
          <div className="text-xs text-slate-400">
            Average learner score across all question banks
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="p-6 border-slate-800 bg-slate-900/90 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Latest Client Progression Events
        </h3>

        <div className="space-y-3">
          {(data?.recentActivities || []).map((act, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white">
                  {act.assignment?.client?.name || act.assignment?.targetEmail}
                </span>
                <span className="text-slate-400 ml-2">
                  progressed in <strong>{act.assignment?.roadmap?.title}</strong>
                </span>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Node: {act.nodeId} &bull; {new Date(act.lastActivityAt).toLocaleString()}
                </div>
              </div>
              <Badge variant={act.status === 'completed' ? 'success' : 'primary'}>
                {act.status}
              </Badge>
            </div>
          ))}
          {(!data?.recentActivities || data.recentActivities.length === 0) && (
            <div className="text-xs text-slate-400 italic py-6 text-center">
              No progression events recorded yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
