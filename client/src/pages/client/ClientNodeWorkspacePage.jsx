import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MarkdownViewer } from '../../components/resources/MarkdownViewer.jsx';
import { QuizModal } from '../../components/quizzes/QuizModal.jsx';
import { ProgressRing } from '../../components/learner/ProgressRing.jsx';
import { ByjuVideoPlayer } from '../../components/learner/ByjuVideoPlayer.jsx';
import { extractYouTubeId } from '../../utils/youtube.js';
import {
  ArrowLeft,
  CheckSquare,
  Square,
  FileQuestion,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Download,
  AlertTriangle,
  Play,
  Check,
  Zap,
  Sparkles,
  ChevronRight,
  Video,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { api, getAuthDownloadUrl } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import confetti from 'canvas-confetti';

function isImageResource(res) {
  if (!res) return false;
  return (
    res.type === 'image' ||
    Boolean(res.mimeType?.startsWith('image/')) ||
    Boolean(res.originalFilename?.match(/\.(png|jpe?g|webp|gif|svg)$/i)) ||
    Boolean(res.url?.match(/\.(png|jpe?g|webp|gif|svg)($|\?)/i)) ||
    Boolean(res.externalUrl?.match(/\.(png|jpe?g|webp|gif|svg)($|\?)/i))
  );
}

function isVideoResource(res) {
  if (!res) return false;
  return (
    res.type === 'video' ||
    Boolean(extractYouTubeId(res.externalUrl || res.url || res.content)) ||
    Boolean(res.mimeType?.startsWith('video/')) ||
    Boolean(res.originalFilename?.match(/\.(mp4|webm|ogg|mov)$/i))
  );
}

export function ClientNodeWorkspacePage() {
  const { assignmentId, nodeId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lockedError, setLockedError] = useState(null);
  const [activeResource, setActiveResource] = useState(null);

  // Quiz modal state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      setLockedError(null);
      const res = await api.get(`/client/assignments/${assignmentId}/nodes/${nodeId}`);
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.resources && res.data.resources.length > 0 && !activeResource) {
          const priority = res.data.resources.find((r) => isVideoResource(r) || isImageResource(r)) || res.data.resources[0];
          setActiveResource(priority);
        }
      }
    } catch (err) {
      if (err.status === 403) {
        setLockedError({
          message: err.message,
          lockReasons: err.lockReasons || []
        });
      } else {
        toast.error(err.message || 'Failed to load node workspace');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [assignmentId, nodeId]);

  const handleToggleTask = async (taskId, currentState) => {
    try {
      const res = await api.post(
        `/client/assignments/${assignmentId}/nodes/${nodeId}/tasks/${taskId}/complete`,
        { isCompleted: !currentState }
      );

      setData((prev) => ({
        ...prev,
        progress: res.data.progress
      }));

      if (res.data.completed) {
        confetti({ particleCount: 70, spread: 60 });
        toast.success('Congratulations! Node requirements fulfilled.');
      }
    } catch (err) {
      toast.error('Failed to update task state');
    }
  };

  const handleToggleResource = async (resourceId, currentState) => {
    try {
      const res = await api.post(
        `/client/assignments/${assignmentId}/nodes/${nodeId}/resources/${resourceId}/complete`,
        { isCompleted: !currentState }
      );

      setData((prev) => ({
        ...prev,
        progress: res.data.progress
      }));

      if (res.data.completed) {
        confetti({ particleCount: 70, spread: 60 });
        toast.success('Congratulations! Node requirements fulfilled.');
      }
    } catch (err) {
      toast.error('Failed to update resource state');
    }
  };

  const handleStartQuiz = async () => {
    try {
      const res = await api.post(`/client/assignments/${assignmentId}/nodes/${nodeId}/quiz/start`);
      if (res.success && res.data) {
        setCurrentAttempt(res.data);
        setIsQuizModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Cannot start quiz attempt');
    }
  };

  const handleSubmitQuiz = async (answers) => {
    if (!currentAttempt) return;
    try {
      setSubmittingAttempt(true);
      const res = await api.post(
        `/client/assignments/${assignmentId}/nodes/${nodeId}/quiz/attempts/${currentAttempt.attemptId}/submit`,
        { answers }
      );

      fetchWorkspace();
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
      throw err;
    } finally {
      setSubmittingAttempt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-500 bg-[#F8F9FE]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-600">Loading module workspace...</span>
        </div>
      </div>
    );
  }

  // Locked Gate Rejection View (Byju's Style Locked Station)
  if (lockedError) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 space-y-6">
        <Link to={`/client/assignments/${assignmentId}/roadmap`}>
          <button className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Roadmap Canvas
          </button>
        </Link>

        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Gated Milestone</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">This Module is Locked</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              In our structured learning model, you must complete all predecessor checkpoints before this module unlocks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-left text-xs space-y-2">
            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" /> Complete Previous Prerequisites:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              {lockedError.lockReasons?.map((reason, idx) => (
                <li key={idx} className="font-medium">{reason}</li>
              ))}
            </ul>
          </div>

          <Link to={`/client/assignments/${assignmentId}/roadmap`}>
            <button className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 transition-all">
              Return to Active Milestones
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const node = data?.node;
  const progress = data?.progress;
  const resources = data?.resources || [];
  const quiz = data?.quiz;
  const isCompleted = progress?.status === 'completed';

  const completedTaskCount = (progress?.completedTasks || []).length;
  const totalTaskCount = node?.tasks?.length || 0;
  const taskPercentage = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={`/client/assignments/${assignmentId}/roadmap`}>
            <button className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {node?.type?.toUpperCase() || 'MODULE'}
              </span>
              {isCompleted ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Mastered
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {progress?.status?.toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{node?.title}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {node?.estimatedDuration || '1 week'}</span>
              <span>&bull;</span>
              <span>{resources.length} learning resources</span>
              <span>&bull;</span>
              <span>{totalTaskCount} practice tasks</span>
            </p>
          </div>
        </div>

        {isCompleted && (
          <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Checkpoint Completed!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Learning Station (Orion style Reader/Player) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Objectives banner */}
          {node?.learningObjectives && node.learningObjectives.length > 0 && (
            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Key Learning Takeaways
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {node.learningObjectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Lesson Content Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {activeResource ? activeResource.title : 'Study Materials'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">In-App Learning Content</span>
                </div>
              </div>

              {activeResource && (
                <div className="flex items-center gap-2">
                  {(activeResource.storageKey || activeResource._id) && (
                    <a
                      href={getAuthDownloadUrl(activeResource._id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isImageResource(activeResource) ? 'View Image' : activeResource.type === 'pdf' ? 'Download PDF' : 'Download File'}
                    </a>
                  )}
                  {activeResource.externalUrl && (
                    <a
                      href={activeResource.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      Open Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* In-App Reader (BYJU'S In-App Video / Image / Markdown / PDF style) */}
            {activeResource && isVideoResource(activeResource) ? (
              <ByjuVideoPlayer
                resource={activeResource}
                isCompleted={(progress?.completedResources || []).includes(activeResource._id)}
                onToggleComplete={handleToggleResource}
              />
            ) : activeResource && isImageResource(activeResource) ? (
              <div className="space-y-4">
                <div className="relative group bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-2 min-h-[360px] max-h-[65vh]">
                  <img
                    src={
                      activeResource.storageKey || activeResource._id
                        ? getAuthDownloadUrl(activeResource._id)
                        : (activeResource.externalUrl || activeResource.url)
                    }
                    alt={activeResource.title || 'Lesson Visual Guide'}
                    className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                  <a
                    href={
                      activeResource.storageKey || activeResource._id
                        ? getAuthDownloadUrl(activeResource._id)
                        : (activeResource.externalUrl || activeResource.url)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Full Resolution
                  </a>
                </div>

                {activeResource.description && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-800 block mb-1">Diagram Overview:</span>
                    {activeResource.description}
                  </div>
                )}
              </div>
            ) : activeResource?.type === 'markdown' ? (
              <div className="max-h-[65vh] overflow-y-auto pr-2 bg-slate-950/95 p-6 rounded-2xl border border-slate-800">
                <MarkdownViewer content={activeResource.content} />
              </div>
            ) : activeResource?.type === 'pdf' ? (
              <div className="p-10 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 mx-auto flex items-center justify-center text-2xl shadow-sm">
                  📄
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-800">{activeResource.title}</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Authenticated PDF document delivered via secure stream for enrolled clients.
                  </p>
                </div>
                <a
                  href={getAuthDownloadUrl(activeResource._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md shadow-orange-500/20"
                >
                  <Download className="w-4 h-4" /> View Full PDF Document
                </a>
              </div>
            ) : activeResource ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3">
                <p className="leading-relaxed">{activeResource.description}</p>
                {activeResource.externalUrl && (
                  <a
                    href={activeResource.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 font-bold hover:underline flex items-center gap-1"
                  >
                    {activeResource.externalUrl} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-12 text-center">
                Select a learning material on the right panel to begin studying.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Stepper, Task Checklist, and Byju Assessment Gate */}
        <div className="space-y-6">
          {/* Module Progress Stepper Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Module Laps</span>
                <h3 className="text-sm font-extrabold text-slate-800">Checklist Completion</h3>
              </div>
              <ProgressRing
                percentage={taskPercentage}
                size={54}
                strokeWidth={5}
                strokeColor="#F59E0B"
                trackColor="#F1F5F9"
                textColor="text-slate-800"
              />
            </div>

            <div className="space-y-2.5 pt-2">
              {node?.tasks?.map((task) => {
                const isChecked = (progress?.completedTasks || []).includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, isChecked)}
                    className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-amber-50/60 border-amber-200/80 text-amber-900 shadow-sm'
                        : 'bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-amber-500 text-white' : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className={`font-medium ${isChecked ? 'line-through text-slate-400' : ''}`}>
                        {task.text}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      {isChecked ? 'Done' : 'Do'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Materials Playlist (Orion Video Checklist style) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800">Learning Materials</h3>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                {resources.length} Items
              </span>
            </div>

            <div className="space-y-2">
              {resources.map((res, idx) => {
                const isCompletedRes = (progress?.completedResources || []).includes(res._id);
                const isSelected = activeResource?._id === res._id;

                return (
                  <div
                    key={res._id}
                    onClick={() => setActiveResource(res)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-300 text-purple-900 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <span className="w-5 text-slate-400 font-mono font-bold text-[11px]">
                        00{idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="font-bold truncate">{res.title}</div>
                        {isVideoResource(res) ? (
                          <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 font-mono mt-0.5">
                            <Video className="w-3 h-3 text-red-500 shrink-0" /> Video &bull; {res.estimatedMinutes || 15} mins
                          </div>
                        ) : isImageResource(res) ? (
                          <div className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 font-mono mt-0.5">
                            <ImageIcon className="w-3 h-3 text-indigo-500 shrink-0" /> Diagram &bull; Image
                          </div>
                        ) : res.type === 'pdf' ? (
                          <div className="text-[10px] text-rose-500 font-bold flex items-center gap-1 font-mono mt-0.5">
                            <FileText className="w-3 h-3 text-rose-500 shrink-0" /> PDF Document &bull; {res.estimatedMinutes || 10} mins
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                            {res.type || 'resource'} &bull; {res.estimatedMinutes || 5} mins
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleResource(res._id, isCompletedRes);
                      }}
                      title={isCompletedRes ? 'Mark unread' : 'Mark completed'}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isCompletedRes
                          ? 'bg-emerald-500 text-white'
                          : 'border border-slate-300 text-slate-400 hover:border-emerald-500'
                      }`}
                    >
                      {isCompletedRes && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessment Gate Section (BYJU'S Knowledge Check) */}
          {quiz && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    <FileQuestion className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold">Knowledge Gate</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-orange-600 text-[11px] font-black shadow-sm">
                  {progress?.passedQuiz ? 'Passed ✓' : 'Required Gate'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-white/95">
                <div className="font-bold text-base leading-tight">{quiz.title}</div>
                <div className="text-white/80 text-[11px] flex items-center gap-2 flex-wrap pt-0.5">
                  <span>Pass: <strong>{node?.quizConfig?.passingPercentage || quiz.passingPercentage || 80}%</strong></span>
                  <span>&bull;</span>
                  <span>{node?.quizConfig?.questionsPerAttempt || quiz.defaultQuestionsPerAttempt || 20} Qs</span>
                  {(node?.quizConfig?.timeLimitMinutes || quiz.timeLimitMinutes) > 0 && (
                    <>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-full font-bold text-amber-200">
                        <Clock className="w-3 h-3 text-amber-300" />
                        {node?.quizConfig?.timeLimitMinutes || quiz.timeLimitMinutes}m Timer
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full py-3 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-slate-900" />
                {progress?.passedQuiz ? 'Retake Assessment' : 'Take Knowledge Exam'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Examination Modal */}
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quizTitle={quiz?.title}
        attemptData={currentAttempt}
        onSubmitAttempt={handleSubmitQuiz}
        onRetake={handleStartQuiz}
        isSubmitting={submittingAttempt}
      />
    </div>
  );
}
