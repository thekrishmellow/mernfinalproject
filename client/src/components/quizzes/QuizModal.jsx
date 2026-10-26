import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import {
  FileQuestion,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Clock,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function QuizModal({
  isOpen,
  onClose,
  quizTitle,
  attemptData,
  onSubmitAttempt,
  onRetake,
  isSubmitting = false
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: [optionId, ...] }
  const [result, setResult] = useState(null);

  // Timer states
  const timeLimitMinutes = attemptData?.timeLimitMinutes || 0;
  const isTimed = timeLimitMinutes > 0;
  const totalLimitSeconds = timeLimitMinutes * 60;

  const [secondsRemaining, setSecondsRemaining] = useState(totalLimitSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const autoSubmittedRef = useRef(false);

  // Initialize and tick timer
  useEffect(() => {
    if (!isOpen || !attemptData || result) return;

    autoSubmittedRef.current = false;
    setHasTimedOut(false);

    const startTime = attemptData.startedAt
      ? new Date(attemptData.startedAt).getTime()
      : Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((now - startTime) / 1000));

      if (isTimed) {
        const remaining = Math.max(0, totalLimitSeconds - diffSeconds);
        setSecondsRemaining(remaining);

        if (remaining <= 0 && !autoSubmittedRef.current) {
          autoSubmittedRef.current = true;
          setHasTimedOut(true);
          // Auto submit
          handleAutoSubmit();
        }
      } else {
        setElapsedSeconds(diffSeconds);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, attemptData, result, isTimed, totalLimitSeconds]);

  if (!isOpen || !attemptData) return null;

  const questions = attemptData.questions || [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (questionId, optionId, isMultiple = false) => {
    if (hasTimedOut || result) return;
    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId]
        };
      }
      return {
        ...prev,
        [questionId]: [optionId]
      };
    });
  };

  const answeredCount = Object.keys(selectedAnswers).filter(
    (k) => selectedAnswers[k]?.length > 0
  ).length;

  const handleSubmit = async () => {
    const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOptions]) => ({
      questionId,
      selectedOptions
    }));

    const res = await onSubmitAttempt(formattedAnswers);
    if (res?.passed) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    setResult(res);
  };

  const handleAutoSubmit = async () => {
    const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOptions]) => ({
      questionId,
      selectedOptions
    }));

    try {
      const res = await onSubmitAttempt(formattedAnswers);
      if (res?.passed) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
      setResult(res);
    } catch (err) {
      // handled in parent
    }
  };

  const handleResetForRetake = () => {
    setResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setHasTimedOut(false);
    autoSubmittedRef.current = false;
    if (onRetake) onRetake();
  };

  // Format MM:SS helper
  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Remaining percentage for progress bar
  const timePercent = isTimed && totalLimitSeconds > 0
    ? Math.max(0, Math.min(100, (secondsRemaining / totalLimitSeconds) * 100))
    : 100;

  const isCriticalTime = isTimed && secondsRemaining <= 60;
  const isWarningTime = isTimed && secondsRemaining <= totalLimitSeconds * 0.25;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={quizTitle || 'Assessment Gate'}
      maxWidth="max-w-3xl"
    >
      {!result ? (
        <div className="space-y-6">
          {/* Enhanced Progress & Live Timer Header */}
          <div className="space-y-3 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="primary">Attempt #{attemptData.attemptNumber}</Badge>
                <span className="text-xs text-slate-400">
                  Passing Score: <strong>{attemptData.passingPercentage}%</strong>
                </span>
              </div>

              {/* Live Countdown Clock / Stopwatch */}
              <div className="flex items-center gap-3">
                {isTimed ? (
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all ${
                      isCriticalTime
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                        : isWarningTime
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 ${isCriticalTime ? 'animate-spin' : ''}`} />
                    <span>Time Left: {formatTime(secondsRemaining)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Elapsed: {formatTime(elapsedSeconds)}</span>
                  </div>
                )}

                <div className="text-xs text-slate-300 font-mono">
                  Answered {answeredCount}/{totalQuestions}
                </div>
              </div>
            </div>

            {/* Linear Countdown Progress Bar */}
            {isTimed && (
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isCriticalTime
                      ? 'bg-red-500'
                      : isWarningTime
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                  }`}
                  style={{ width: `${timePercent}%` }}
                />
              </div>
            )}

            {/* Urgent Timeout Banner */}
            {isCriticalTime && secondsRemaining > 0 && (
              <div className="px-3.5 py-1.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-[11px] font-bold flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 animate-bounce" />
                <span>Less than 1 minute remaining! Any unsaved choices will be auto-submitted.</span>
              </div>
            )}
          </div>

          {/* Question Body */}
          {currentQ && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs shrink-0 mt-0.5">
                  {currentQuestionIndex + 1}
                </span>
                <h4 className="text-base font-medium text-slate-100 leading-relaxed">
                  {currentQ.prompt}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2 pl-10">
                {currentQ.options?.map((opt) => {
                  const isChecked = (selectedAnswers[currentQ.id] || []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.id, currentQ.type === 'multiple_choice')}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-150 flex items-center gap-3 ${
                        isChecked
                          ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold transition-colors ${
                          isChecked
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'border-slate-600 text-slate-400'
                        }`}
                      >
                        {opt.id}
                      </div>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              icon={ChevronLeft}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] px-2">
              {questions.map((q, idx) => {
                const isAnswered = (selectedAnswers[q.id] || []).length > 0;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-6 h-6 rounded text-[11px] font-mono flex items-center justify-center transition-colors ${
                      idx === currentQuestionIndex
                        ? 'bg-blue-600 text-white font-bold'
                        : isAnswered
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="accent"
                size="sm"
                onClick={handleSubmit}
                loading={isSubmitting}
                icon={CheckCircle2}
              >
                Submit Attempt
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border text-center space-y-3 ${
              result.passed
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-slate-900 border border-current">
              {result.passed ? (
                <Award className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
            </div>
            <h4 className="text-xl font-bold text-white">
              {result.passed ? 'Assessment Passed!' : 'Assessment Failed'}
            </h4>
            <div className="text-3xl font-extrabold font-mono text-white">
              {result.percentage}%
            </div>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              You scored {result.score} out of {result.maxScore} points. Required threshold is{' '}
              {result.passingPercentage}%.
              {result.passed
                ? ' The gating criteria for this node have been satisfied!'
                : ' Subsequent dependent nodes remain locked until this assessment is passed.'}
            </p>
          </div>

          {/* Graded Details */}
          {result.gradedDetails && result.gradedDetails.length > 0 && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <h5 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Detailed Feedback
              </h5>
              {result.gradedDetails.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    item.isCorrect
                      ? 'bg-emerald-950/10 border-emerald-800/40 text-slate-200'
                      : 'bg-rose-950/10 border-rose-800/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>Q{idx + 1}: {item.prompt}</span>
                    <span className={item.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  {item.correctAnswers && item.correctAnswers.length > 0 && (
                    <div className="text-slate-400">
                      Correct Answer: <span className="font-mono text-emerald-400">{item.correctAnswers.join(', ')}</span>
                    </div>
                  )}
                  {item.explanation && (
                    <div className="text-slate-300 italic pt-1 border-t border-slate-800/60">
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            {!result.passed && (
              <Button variant="primary" size="sm" onClick={handleResetForRetake} icon={RotateCcw}>
                Retake Assessment
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
