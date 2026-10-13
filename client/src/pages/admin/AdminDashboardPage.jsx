import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  GitFork,
  Users,
  Award,
  CheckCircle2,
  FileQuestion,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Send
} from 'lucide-react';
import { api } from '../../services/api.js';

export function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading Admin Studio metrics...</span>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 shadow-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Studio Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1">
            Construct learning pathways, manage gated progression, and monitor client milestones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/roadmaps">
            <Button variant="primary" icon={Plus}>Create Roadmap</Button>
          </Link>
          <Link to="/admin/assignments">
            <Button variant="secondary" icon={Send}>Assign Learners</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Roadmaps</span>
            <GitFork className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{m.totalRoadmaps || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span className="text-emerald-400 font-medium">{m.publishedRoadmaps || 0} published</span>
            <span>&bull;</span>
            <span>{m.draftRoadmaps || 0} drafts</span>
          </div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Active Clients</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{m.totalClients || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-amber-400 font-medium">{m.outstandingInvitations || 0} pending invites</span>
          </div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Assignments</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{m.activeAssignments || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-medium">{m.completedAssignments || 0} fully completed</span>
          </div>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Avg Quiz Score</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{m.avgQuizPercentage || 0}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span>{m.totalPassedAttempts || 0} of {m.totalQuizAttempts || 0} attempts passed</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Updated Roadmaps */}
        <Card className="p-6 border-slate-800 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <GitFork className="w-4 h-4 text-blue-400" />
              Recently Updated Roadmaps
            </h3>
            <Link to="/admin/roadmaps" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recentRoadmaps || []).map((r) => (
              <div key={r._id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{r.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{r.category || 'General'}</span>
                    <span>&bull;</span>
                    <Clock className="w-3 h-3" />
                    <span>{r.estimatedDuration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === 'published' ? 'success' : 'default'}>
                    {r.status}
                  </Badge>
                  <Link to={`/admin/roadmaps/${r._id}/builder`}>
                    <Button variant="secondary" size="sm">Editor</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Client Learning Activity */}
        <Card className="p-6 border-slate-800 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Client Activity
            </h3>
            <Link to="/admin/assignments" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
              Manage Assignments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recentActivities || []).map((act, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">
                    {act.assignment?.client?.name || act.assignment?.targetEmail}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {act.assignment?.roadmap?.title} &bull; Node: <span className="font-mono text-blue-400">{act.nodeId}</span>
                  </div>
                </div>
                <Badge variant={act.status === 'completed' ? 'success' : 'warning'}>
                  {act.status}
                </Badge>
              </div>
            ))}
            {(!data?.recentActivities || data.recentActivities.length === 0) && (
              <div className="text-xs text-slate-400 italic py-6 text-center">
                No recent activity recorded yet. Assign roadmaps to learners to begin tracking.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
