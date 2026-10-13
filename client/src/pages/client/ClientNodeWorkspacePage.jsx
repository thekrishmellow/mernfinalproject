import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { MarkdownViewer } from '../../components/resources/MarkdownViewer.jsx';
import { QuizModal } from '../../components/quizzes/QuizModal.jsx';
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
  Play
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import confetti from 'canvas-confetti';

export function ClientNodeWorkspacePage() {
  const { assignmentId, nodeId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lockedError, setLockedError] = useState(null);
  const [activeResource, setActiveResource] = useState(null);

  // Quiz state
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
          setActiveResource(res.data.resources[0]);
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

      fetchWorkspace(); // Refresh progress
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
      <div className="h-64 flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading learning workspace...</span>
      </div>
    );
  }

  // Locked Gate Rejection View
  if (lockedError) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <Link to={`/client/assignments/${assignmentId}/roadmap`}>
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Back to Roadmap Canvas
          </Button>
        </Link>

        <Card className="p-8 text-center border-amber-900/40 bg-slate-900/90 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">This Learning Node is Locked</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            You cannot access this protected learning workspace or download its materials until the backend
            progression engine verifies all mandatory prerequisites.
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2">
            <div className="font-semibold text-amber-400">Required Prerequisite Steps:</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              {lockedError.lockReasons?.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          <Link to={`/client/assignments/${assignmentId}/roadmap`}>
            <Button variant="primary">Return to Roadmap</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const node = data?.node;
  const progress = data?.progress;
  const resources = data?.resources || [];
  const quiz = data?.quiz;
  const isCompleted = progress?.status === 'completed';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link to={`/client/assignments/${assignmentId}/roadmap`}>
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Roadmap
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{node?.title}</h1>
              <Badge variant={isCompleted ? 'success' : progress?.status === 'in_progress' ? 'warning' : 'primary'}>
                {progress?.status?.toUpperCase()}
              </Badge>
            </div>
            {node?.estimatedDuration && (
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" /> Est. {node.estimatedDuration}
              </span>
            )}
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All Node Requirements Satisfied!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Study Area (Markdown Viewer / Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Objectives */}
          {node?.learningObjectives && node.learningObjectives.length > 0 && (
            <Card className="p-5 border-slate-800 bg-slate-900/60 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Learning Objectives
              </h3>
              <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                {node.learningObjectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Active Resource Viewer */}
          <Card className="p-6 border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {activeResource ? activeResource.title : 'Learning Materials'}
                </h3>
              </div>

              {activeResource && (
                <div className="flex items-center gap-2">
                  {activeResource.storageKey && (
                    <a
                      href={`/api/v1/resources/${activeResource._id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Protected File
                    </a>
                  )}
                  {activeResource.externalUrl && (
                    <a
                      href={activeResource.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5"
                    >
                      Open Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* In-App Reader */}
            {activeResource?.type === 'markdown' ? (
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <MarkdownViewer content={activeResource.content} />
              </div>
            ) : activeResource?.type === 'pdf' ? (
              <div className="p-8 text-center space-y-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <BookOpen className="w-10 h-10 text-rose-400 mx-auto" />
                <h4 className="text-sm font-semibold text-white">{activeResource.title}</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This document is securely stored and authenticated for your active enrollment.
                </p>
                <a
                  href={`/api/v1/resources/${activeResource._id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  <Download className="w-4 h-4" /> Open In Browser PDF Viewer
                </a>
              </div>
            ) : activeResource ? (
              <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                <p className="mb-3">{activeResource.description}</p>
                {activeResource.externalUrl && (
                  <a
                    href={activeResource.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {activeResource.externalUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-8 text-center">
                Select a learning resource on the right panel to study.
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Task Checklist, Materials Picker & Assessment Gate */}
        <div className="space-y-6">
          {/* Required Task Checklist */}
          <Card className="p-5 border-slate-800 bg-slate-900/90 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>Required Task Checklist</span>
              <span className="font-mono text-blue-400">
                {(progress?.completedTasks || []).length} / {node?.tasks?.length || 0}
              </span>
            </h3>

            <div className="space-y-2">
              {node?.tasks?.map((task) => {
                const isChecked = (progress?.completedTasks || []).includes(task.id);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleToggleTask(task.id, isChecked)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                      isChecked
                        ? 'bg-emerald-950/15 border-emerald-800/40 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <span className={isChecked ? 'line-through text-slate-400' : ''}>
                      {task.text}
                    </span>
                  </button>
                );
              })}
              {(!node?.tasks || node.tasks.length === 0) && (
                <div className="text-xs text-slate-400 italic">No checklist tasks for this module.</div>
              )}
            </div>
          </Card>

          {/* Module Resources List */}
          <Card className="p-5 border-slate-800 bg-slate-900/90 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Learning Materials ({resources.length})
            </h3>

            <div className="space-y-2">
              {resources.map((res) => {
                const isCompletedRes = (progress?.completedResources || []).includes(res._id);
                const isSelected = activeResource?._id === res._id;

                return (
                  <div
                    key={res._id}
                    onClick={() => setActiveResource(res)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-semibold truncate">{res.title}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                        {res.type} &bull; {res.estimatedMinutes}m
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleResource(res._id, isCompletedRes);
                      }}
                      title={isCompletedRes ? 'Mark unread' : 'Mark completed'}
                      className="p-1 text-slate-400 hover:text-emerald-400"
                    >
                      {isCompletedRes ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Assessment Gate Section */}
          {quiz && (
            <Card className="p-5 border-slate-800 bg-slate-900/90 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <FileQuestion className="w-4 h-4 text-amber-400" />
                  Assessment Gate
                </h3>
                <Badge variant={progress?.passedQuiz ? 'success' : 'warning'}>
                  {progress?.passedQuiz ? 'Passed' : 'Pending'}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="font-medium text-white">{quiz.title}</div>
                <div className="text-slate-400">
                  Required Passing Score: <strong>{node?.quizConfig?.passingPercentage || 80}%</strong>
                </div>
                <div className="text-slate-400">
                  Questions per attempt: <strong>{node?.quizConfig?.questionsPerAttempt || 20}</strong>
                </div>
              </div>

              <Button
                variant={progress?.passedQuiz ? 'secondary' : 'primary'}
                className="w-full"
                onClick={handleStartQuiz}
                icon={Play}
              >
                {progress?.passedQuiz ? 'Retake Assessment' : 'Start Assessment'}
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
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
