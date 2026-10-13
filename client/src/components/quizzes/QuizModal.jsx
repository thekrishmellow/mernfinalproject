import React, { useState } from 'react';
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
  RotateCcw
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

  if (!isOpen || !attemptData) return null;

  const questions = attemptData.questions || [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (questionId, optionId, isMultiple = false) => {
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

  const handleResetForRetake = () => {
    setResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    if (onRetake) onRetake();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={quizTitle || 'Assessment Gate'}
      maxWidth="max-w-3xl"
    >
      {!result ? (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="primary">Attempt #{attemptData.attemptNumber}</Badge>
              <span className="text-xs text-slate-400">
                Passing Score: {attemptData.passingPercentage}%
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono">
              Answered {answeredCount} of {totalQuestions}
            </div>
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
