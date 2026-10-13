import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext.jsx';
import { ProgressRing } from '../../components/learner/ProgressRing.jsx';
import { ByjuStepperTrack } from '../../components/learner/ByjuJourneyTrack.jsx';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  ArrowRight,
  TrendingUp,
  FileQuestion,
  Play,
  Calendar,
  Sparkles,
  Zap,
  Users,
  Compass,
  Star,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api.js';

export function ClientDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeRoadmapData, setActiveRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/client/dashboard');
        if (res.success && res.data) {
          setData(res.data);

          // If assignments exist, fetch the first one's full roadmap nodes for the Byju stepper
          const firstAssignment = res.data.assignments?.[0];
          if (firstAssignment) {
            const rmRes = await api.get(`/client/assignments/${firstAssignment._id}/roadmap`);
            if (rmRes.success && rmRes.data) {
              setActiveRoadmapData(rmRes.data);
            }
          }
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
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500 bg-[#F8F9FE]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-600">Loading your learning space...</span>
        </div>
      </div>
    );
  }

  const assignments = data?.assignments || [];
  const stats = data?.stats || {};
  const recentAttempts = data?.recentAttempts || [];
  const dynamicXP = data?.dynamicXP || 0;
  const streakDays = data?.streakDays || 1;
  const leaderboard = data?.leaderboard || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const primaryAssignment = assignments[0];
  const roadmapNodes = activeRoadmapData?.version?.nodes || [];

  // Dynamically compute available categories from user assignments
  const availableCategories = [
    'All',
    ...Array.from(new Set(assignments.map((a) => a.roadmap?.category).filter(Boolean)))
  ];
  const filteredAssignments =
    activeCategory === 'All'
      ? assignments
      : assignments.filter((a) => a.roadmap?.category === activeCategory);

  const handleResumeNode = (nodeId) => {
    if (primaryAssignment) {
      navigate(`/client/assignments/${primaryAssignment._id}/nodes/${nodeId}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Welcome Greeting & Active Pathway Hero (Orion & Byju's style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Hero Card */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#6C3483] via-[#5B2C6F] to-[#4A235A] text-white shadow-xl shadow-purple-900/20 relative overflow-hidden flex flex-col justify-between">
          {/* Decorative glowing gradient orbs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Continue Learning
              </span>
              <span className="text-xs text-white/80 font-mono">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Learner'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-lg leading-relaxed">
                You're on track to master your curriculum. Complete your checklist tasks and take the assessment to unlock the next module!
              </p>
            </div>
          </div>

          {primaryAssignment && (
            <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl">
              <div className="flex items-center gap-4">
                <ProgressRing
                  percentage={primaryAssignment.progressPercentage || 0}
                  size={64}
                  strokeWidth={6}
                  strokeColor="#F59E0B"
                  trackColor="rgba(255, 255, 255, 0.2)"
                  textColor="text-white"
                />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Active Curriculum</span>
                  <h3 className="text-sm sm:text-base font-bold text-white">{primaryAssignment.roadmap?.title}</h3>
                  <div className="text-xs text-purple-200 mt-0.5">
                    {primaryAssignment.progressPercentage || 0}% Completed &bull; Est. {primaryAssignment.roadmap?.estimatedDuration || '4 weeks'}
                  </div>
                </div>
              </div>

              <Link to={`/client/assignments/${primaryAssignment._id}/roadmap`}>
                <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-extrabold text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-slate-900" />
                  Resume Learning
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mini Daily Motivation & Quick Stats Card */}
        <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Progress</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-500" /> {streakDays} Day Streak
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80">
              <div className="text-xl font-black text-amber-600 font-mono">{stats.completed || 0}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Completed</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/80">
              <div className="text-xl font-black text-blue-600 font-mono">{stats.available || 0}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Available</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100/80">
              <div className="text-xl font-black text-purple-600 font-mono">{stats.in_progress || 0}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">In Progress</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xl font-black text-slate-500 font-mono">{stats.locked || 0}</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Gated / Locked</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Earned Points</span>
              <span className="text-amber-600 font-bold font-mono">{dynamicXP} XP</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, dynamicXP % 500 / 5))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. BYJU'S Iconic Milestone Stepper Track (Warmup ➔ Strides ➔ Sprint ➔ Laps ➔ Race) */}
      {roadmapNodes.length > 0 && (
        <ByjuStepperTrack
          nodes={roadmapNodes}
          onSelectNode={(node) => handleResumeNode(node.id)}
          onResume={handleResumeNode}
        />
      )}

      {/* 3. Knowledge Graph Visualizer Card (Directly inspired by Image 3) */}
      {primaryAssignment && (
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-50 via-orange-50 to-purple-50 border border-amber-200/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-orange-500/20 shrink-0">
              🧬
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Interactive Curriculum Graph</span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">Visualise Knowledge Graph</h3>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Visualise concepts and prerequisite dependencies! Explore what's needed to understand and master each topic before moving forward.
              </p>
            </div>
          </div>

          <Link to={`/client/assignments/${primaryAssignment._id}/roadmap`}>
            <button className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 border-2 border-amber-400 text-amber-700 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 shrink-0">
              <Compass className="w-4 h-4 text-amber-500" />
              Open Interactive Graph
            </button>
          </Link>
        </div>
      )}

      {/* 4. Grid of Assigned Pathways & Right Sidebar Schedule/Leaderboard (Images 1 & 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Assigned Pathways */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Your Enrolled Courses</h2>
              <p className="text-xs text-slate-500 mt-0.5">Explore courses assigned by your instructor</p>
            </div>

            {/* Category Chips (Image 1) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAssignments.map((a, idx) => {
              const ringColors = ['#F59E0B', '#6C3483', '#06B6D4', '#10B981'];
              const color = ringColors[idx % ringColors.length];

              return (
                <div
                  key={a._id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Course Icon Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                      {idx === 0 ? '💻' : '⚡'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          {a.roadmap?.category || 'Curriculum'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          v{a.publishedVersion?.versionNumber || 1}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 leading-snug">{a.roadmap?.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {a.roadmap?.description || 'Study this structured learning pathway.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-3">
                      <ProgressRing
                        percentage={a.progressPercentage || 0}
                        size={52}
                        strokeWidth={5}
                        strokeColor={color}
                        trackColor="#F1F5F9"
                        textColor="text-slate-800"
                      />
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800">{a.progressPercentage || 0}%</div>
                        <div className="text-[10px] text-slate-400">Progress</div>
                      </div>
                    </div>

                    <Link to={`/client/assignments/${a._id}/roadmap`}>
                      <button className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5">
                        Open Path <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Schedule & Leaderboard (Image 1 & 2) */}
        <div className="space-y-6">
          {/* Calendar / Study Schedule Card (Image 1 top right) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Study Calendar
              </h3>
              <span className="text-xs font-bold text-purple-600">Oct 2026</span>
            </div>

            {/* Calendar Mini Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isToday = day === 13;
                const hasSchedule = [7, 13, 16, 26].includes(day);

                return (
                  <div
                    key={i}
                    className={`h-7 flex items-center justify-center rounded-full text-xs transition-all ${
                      isToday
                        ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/30'
                        : hasSchedule
                        ? 'text-amber-600 font-bold bg-amber-50'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Upcoming Milestones */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Upcoming Milestones</div>
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((dl, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-slate-700 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <div className="font-bold text-purple-900 truncate">{dl.title}</div>
                      <div className="text-[10px] text-purple-600 truncate">{dl.roadmapTitle || 'Active Track'}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-700 shrink-0">
                      {dl.hasQuiz ? `${dl.passingPercentage}% Quiz` : dl.estimatedDuration}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-center text-xs">
                  All current milestones completed! 🎉
                </div>
              )}
            </div>
          </div>

          {/* Gamified Leaderboard Card (Image 2) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Study Warriors Leaderboard
              </h3>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Global
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {leaderboard.length > 0 ? (
                leaderboard.map((learner) => (
                  <div
                    key={learner.id || learner.rank}
                    className={`p-2.5 rounded-2xl flex items-center justify-between transition-all ${
                      learner.isMe
                        ? 'bg-amber-50 border border-amber-200 text-slate-800 font-bold shadow-sm'
                        : 'bg-slate-50/80 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-center font-bold text-slate-400">{learner.badge}</span>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">
                        {learner.name?.charAt(0) || 'L'}
                      </div>
                      <span className="truncate max-w-[120px]">{learner.isMe ? `${learner.name} (You)` : learner.name}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-600">{learner.points}</span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 font-bold flex items-center justify-between">
                  <span>{user?.name || 'You'}</span>
                  <span className="font-mono text-amber-600 font-bold">{dynamicXP} XP</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
