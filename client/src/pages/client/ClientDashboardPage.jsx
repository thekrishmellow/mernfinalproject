import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  ArrowRight,
  TrendingUp,
  FileQuestion
} from 'lucide-react';
import { api } from '../../services/api.js';

export function ClientDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/client/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load learner dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading your learning dashboard...</span>
      </div>
    );
  }

  const assignments = data?.assignments || [];
  const stats = data?.stats || {};
  const recentAttempts = data?.recentAttempts || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <BookOpen className="w-3.5 h-3.5" /> Learner Space
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Resume your personalized learning path below. Complete required exercises, take assessments,
            and satisfy prerequisites to unlock next modules.
          </p>
        </div>
      </div>

      {/* Progress Breakdown Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.completed || 0}</div>
          <span className="text-[11px] text-emerald-400">Nodes mastered</span>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.in_progress || 0}</div>
          <span className="text-[11px] text-amber-400">Currently studying</span>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Available</span>
            <Unlock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.available || 0}</div>
          <span className="text-[11px] text-blue-400">Unlocked &amp; ready</span>
        </Card>

        <Card className="p-5 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Gated / Locked</span>
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.locked || 0}</div>
          <span className="text-[11px] text-slate-500">Prerequisites needed</span>
        </Card>
      </div>

      {/* Assigned Roadmaps List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-400" />
          Your Assigned Pathways
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <Card key={a._id} hover className="p-6 border-slate-800 bg-slate-900/90 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={a.status === 'completed' ? 'success' : 'primary'}>
                    {a.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    Version {a.publishedVersion?.versionNumber || 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">{a.roadmap?.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {a.roadmap?.description || 'Study this structured learning pathway.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pathway Progress</span>
                    <span className="font-mono font-bold text-white">{a.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${a.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {a.roadmap?.estimatedDuration || '4 weeks'}
                </span>
                <Link to={`/client/assignments/${a._id}/roadmap`}>
                  <Button variant="primary" size="sm" icon={ArrowRight}>
                    Open Visual Roadmap
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
          {assignments.length === 0 && (
            <div className="col-span-2 p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-slate-400 italic">
              No roadmaps assigned yet. Please contact your instructor.
            </div>
          )}
        </div>
      </div>

      {/* Recent Quiz Scores */}
      {recentAttempts.length > 0 && (
        <Card className="p-6 border-slate-800 bg-slate-900/90 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-amber-400" />
            Recent Assessment History
          </h3>
          <div className="space-y-2.5">
            {recentAttempts.map((attempt) => (
              <div key={attempt._id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white">{attempt.quizId?.title || 'Assessment'}</span>
                  <span className="text-slate-400 ml-2">Node: {attempt.nodeId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white">{attempt.percentage}%</span>
                  <Badge variant={attempt.passed ? 'success' : 'danger'}>
                    {attempt.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
