import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton.jsx';
import {
  GitFork,
  Users,
  Award,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Send,
  Sparkles
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
      <div className="space-y-8 max-w-7xl mx-auto pb-12" aria-busy="true" aria-label="Loading Studio overview">
        {/* Banner Skeleton */}
        <div className="rounded-3xl bg-slate-900/40 p-8 sm:p-10 border border-slate-800 space-y-4">
          <Skeleton className="h-6 w-40 rounded-full bg-slate-800" />
          <Skeleton className="h-9 w-72 rounded-xl bg-slate-800" />
          <Skeleton className="h-4 w-96 rounded-lg bg-slate-800" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner (Orion Deep Purple / Amber Hero Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2A114B] via-[#3B185F] to-[#4C1D95] p-8 sm:p-10 text-white shadow-xl shadow-purple-950/15">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" aria-hidden="true" />
        <div className="absolute -right-12 -bottom-12 size-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>Curriculum Control Suite</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white text-balance">
              Roadmap Studio Workspace
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed font-medium text-pretty">
              Architect gated milestone pathways, attach knowledge assessments, and monitor learner progression in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/admin/roadmaps">
              <Button
                variant="accent"
                size="md"
                icon={Plus}
                className="font-bold shadow-lg shadow-orange-500/25"
              >
                New Roadmap
              </Button>
            </Link>
            <Link to="/admin/assignments">
              <Button
                variant="secondary"
                size="md"
                icon={Send}
                className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20 font-bold"
              >
                Assign Learners
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card hover className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Roadmaps</span>
            <div className="size-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-xs">
              <GitFork className="size-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-850 font-mono tracking-tight tabular-nums">{m.totalRoadmaps || 0}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-medium tabular-nums">
            <span className="text-emerald-600 font-bold">{m.publishedRoadmaps || 0} published</span>
            <span aria-hidden="true">&bull;</span>
            <span>{m.draftRoadmaps || 0} drafts</span>
          </div>
        </Card>

        <Card hover className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Learners</span>
            <div className="size-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-xs">
              <Users className="size-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-850 font-mono tracking-tight tabular-nums">{m.totalClients || 0}</div>
          <div className="text-xs text-slate-500 mt-2 font-medium tabular-nums">
            <span className="text-amber-700 font-bold">{m.outstandingInvitations || 0} pending invites</span>
          </div>
        </Card>

        <Card hover className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Active Journeys</span>
            <div className="size-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Award className="size-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-850 font-mono tracking-tight tabular-nums">{m.activeAssignments || 0}</div>
          <div className="text-xs text-slate-500 mt-2 font-medium tabular-nums">
            <span className="text-emerald-600 font-bold">{m.completedAssignments || 0} completed</span>
          </div>
        </Card>

        <Card hover className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Assessment Average</span>
            <div className="size-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
              <TrendingUp className="size-4 stroke-[2.5]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-850 font-mono tracking-tight tabular-nums">{m.avgQuizPercentage || 0}%</div>
          <div className="text-xs text-slate-500 mt-2 font-medium tabular-nums">
            <span className="text-slate-600">{m.totalPassedAttempts || 0} of {m.totalQuizAttempts || 0} passed</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Updated Roadmaps */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-2 text-balance">
              <GitFork className="size-4 text-purple-600" aria-hidden="true" />
              Recently Created Roadmaps
            </h3>
            <Link to="/admin/roadmaps" className="text-xs text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg px-1.5 py-0.5">
              View All <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recentRoadmaps || []).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-xs font-semibold text-slate-500">No roadmaps created yet.</p>
                <Link to="/admin/roadmaps" className="inline-block mt-3">
                  <Button variant="accent" size="sm" icon={Plus}>
                    Create First Roadmap
                  </Button>
                </Link>
              </div>
            ) : (
              (data?.recentRoadmaps || []).map((r) => (
                <div key={r._id} className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-all duration-150">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850">{r.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                      <span className="text-slate-600">{r.category || 'Curriculum'}</span>
                      <span aria-hidden="true">&bull;</span>
                      <Clock className="size-3.5" aria-hidden="true" />
                      <span className="tabular-nums">{r.estimatedDuration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Badge variant={r.status === 'published' ? 'success' : 'default'} className="font-bold">
                      {r.status}
                    </Badge>
                    <Link to={`/admin/roadmaps/${r._id}/builder`}>
                      <Button variant="secondary" size="sm" className="font-bold !rounded-xl">
                        Studio
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Client Learning Activity */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-2 text-balance">
              <Clock className="size-4 text-indigo-600" aria-hidden="true" />
              Recent Learner Checkpoints
            </h3>
            <Link to="/admin/assignments" className="text-xs text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg px-1.5 py-0.5">
              Manage Assignments <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recentActivities || []).length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-xs font-semibold text-slate-500">No learner checkpoints completed yet.</p>
                <Link to="/admin/assignments" className="inline-block mt-3">
                  <Button variant="secondary" size="sm" icon={Send}>
                    Assign Learners to Paths
                  </Button>
                </Link>
              </div>
            ) : (
              (data?.recentActivities || []).map((act, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between text-xs transition-all duration-150">
                  <div>
                    <div className="font-extrabold text-slate-850">
                      {act.assignment?.client?.name || act.assignment?.targetEmail}
                    </div>
                    <div className="text-slate-400 mt-0.5 font-medium">
                      {act.assignment?.roadmap?.title} &bull; Checkpoint: <span className="font-mono text-purple-700 font-bold tabular-nums">{act.nodeId}</span>
                    </div>
                  </div>
                  <Badge variant={act.status === 'completed' ? 'success' : 'warning'} className="font-bold">
                    {act.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
