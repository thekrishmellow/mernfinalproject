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
import { useToast } from '../../components/ui/Toast.jsx';


export function ClientDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [activeRoadmapData, setActiveRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [acceptingId, setAcceptingId] = useState(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/client/dashboard');
      if (res.success && res.data) {
        setData(res.data);

        // If assignments exist, fetch the first active one's full roadmap nodes for the Byju stepper
        const activeAsgn = res.data.assignments?.find((a) => a.status === 'active') || res.data.assignments?.[0];
        if (activeAsgn) {
          const rmRes = await api.get(`/client/assignments/${activeAsgn._id}/roadmap`);
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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAcceptAssignment = async (assignmentId) => {
    try {
      setAcceptingId(assignmentId);
      const res = await api.post(`/client/assignments/${assignmentId}/accept`);
      toast.success(res.message || 'Roadmap accepted! Your modules are ready.');
      await fetchDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to accept roadmap');
    } finally {
      setAcceptingId(null);
    }
  };


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
  const activityDates = data?.activityDates || [];
  const primaryAssignment = assignments[0];
  const roadmapNodes = activeRoadmapData?.version?.nodes || [];

  // Monthly calendar calculations
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon...
  const todayDateNum = today.getDate();

  // Active contribution days from backend activity timestamps
  const activeDaysSet = new Set(
    activityDates
      .map((dStr) => {
        const d = new Date(dStr);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          return d.getDate();
        }
        return null;
      })
      .filter(Boolean)
  );
  // Also include any recent attempt days from current month
  recentAttempts.forEach((att) => {
    const d = new Date(att.completedAt || att.createdAt);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      activeDaysSet.add(d.getDate());
    }
  });

  const totalNodesCount = (stats.completed || 0) + (stats.available || 0) + (stats.in_progress || 0) + (stats.locked || 0);
  const completionPercentage = totalNodesCount > 0 ? Math.round(((stats.completed || 0) / totalNodesCount) * 100) : 0;

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

        {/* Curriculum Progress Breakdown Card (Clean, purposeful metrics) */}
        <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Curriculum Progress</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
              {completionPercentage}% Mastered
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
              <div className="text-xl font-black text-emerald-600 font-mono">{stats.completed || 0}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Completed</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/80">
              <div className="text-xl font-black text-blue-600 font-mono">{stats.available || 0}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Ready to Learn</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80">
              <div className="text-xl font-black text-amber-600 font-mono">{stats.in_progress || 0}</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">In Progress</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xl font-black text-slate-500 font-mono">{stats.locked || 0}</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Gated / Locked</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Overall Track Completion</span>
              <span className="text-emerald-600 font-bold font-mono">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
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

      {/* 4. Grid of Assigned Pathways & Right Sidebar Activity Calendar */}
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
            {filteredAssignments.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                  📚
                </div>
                <h3 className="text-base font-bold text-slate-800">No Enrolled Courses Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {assignments.length === 0
                    ? `You don't have any roadmaps assigned yet. Once your instructor publishes a learning roadmap to ${user?.email}, it will appear here immediately.`
                    : 'No courses found in this category. Try selecting "All".'}
                </p>
              </div>
            ) : (
              filteredAssignments.map((a, idx) => {
                const ringColors = ['#F59E0B', '#6C3483', '#06B6D4', '#10B981'];
                const color = ringColors[idx % ringColors.length];
                const isPending = a.status === 'pending_acceptance';

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
                          {isPending && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Invitation Ready
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-800 leading-snug">{a.roadmap?.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {a.roadmap?.description || 'Study this structured learning pathway.'}
                        </p>
                        {a.assignedBy?.name && (
                          <p className="text-[11px] text-slate-400">
                            Assigned by: <span className="font-semibold text-slate-600">{a.assignedBy.name}</span>
                          </p>
                        )}
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

                      {isPending ? (
                        <button
                          onClick={() => handleAcceptAssignment(a._id)}
                          disabled={acceptingId === a._id}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                          {acceptingId === a._id ? 'Accepting...' : 'Accept Roadmap'}
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Link to={`/client/assignments/${a._id}/roadmap`}>
                          <button className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5">
                            Open Path <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>


        {/* Right Col: Study Activity & Contribution Calendar */}
        <div className="space-y-6">
          {/* Study Activity & Contribution Calendar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">Study Activity</h3>
                  <p className="text-[10px] text-slate-400">Contribution & progress mapping</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 px-2.5 py-1 rounded-full bg-purple-50">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Monthly Contribution Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {/* Pad leading days before the 1st of the month */}
                {[...Array(firstDayOfWeek)].map((_, i) => (
                  <div key={`pad-${i}`} className="h-7 rounded-xl" />
                ))}

                {/* Actual month days */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const isToday = day === todayDateNum;
                  const isCompletedDay = activeDaysSet.has(day);

                  return (
                    <div
                      key={day}
                      className={`h-7 rounded-xl flex items-center justify-center text-xs font-semibold transition-all relative ${
                        isToday
                          ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/30 ring-2 ring-amber-400/30'
                          : isCompletedDay
                          ? 'bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-400/40'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isToday ? 'Today (Active)' : isCompletedDay ? `Day ${day} - Study Activity Recorded` : `Day ${day}`}
                    >
                      {day}
                      {isCompletedDay && !isToday && (
                        <span className="w-1 h-1 rounded-full bg-emerald-500 absolute bottom-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contribution Legend */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Activity Legend</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-md bg-slate-100 border border-slate-200 inline-block" />
                  <span>Rest</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 inline-block" />
                  <span>Studied</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-md bg-amber-500 inline-block" />
                  <span>Today</span>
                </span>
              </div>
            </div>

            {/* Contribution Quick Stats */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100/70">
                <div className="text-base font-extrabold text-purple-700 font-mono">
                  {stats.completed || 0}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">Mastered Modules</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/70">
                <div className="text-base font-extrabold text-emerald-700 font-mono">
                  {activeDaysSet.size || (stats.completed || 0) + (stats.in_progress || 0)}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">Active Study Days</div>
              </div>
            </div>
          </div>

          {/* Recent Learning Activity Log */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Recent Activity Log
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Personal Log
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((att, idx) => (
                  <div
                    key={att._id || idx}
                    className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-slate-700"
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold text-slate-800 truncate">{att.quizId?.title || 'Knowledge Assessment'}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(att.completedAt || att.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                        att.passed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {att.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">No activity logged yet</p>
                  <p className="text-[11px] text-slate-400">
                    Your completed checkpoints, notes, and quiz submissions will appear in this personal study log.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
