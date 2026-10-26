import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ImportQuestionsModal } from '../../components/quizzes/ImportQuestionsModal.jsx';
import { DocumentExtractModal } from '../../components/quizzes/DocumentExtractModal.jsx';
import {
  FileQuestion,
  Plus,
  Upload,
  FileText,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  Clock,
  Settings
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

const TIMER_PRESETS = [
  { label: 'Untimed', value: 0 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 }
];

export function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExtractOpen, setIsExtractOpen] = useState(false);
  const [activeQuizForImport, setActiveQuizForImport] = useState(null);

  // New quiz state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingPercentage, setPassingPercentage] = useState(80);
  const [defaultQuestionsPerAttempt, setDefaultQuestionsPerAttempt] = useState(20);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [saving, setSaving] = useState(false);

  // Quick edit settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editTimerMinutes, setEditTimerMinutes] = useState(0);
  const [editPassingScore, setEditPassingScore] = useState(80);
  const [editQuestionsPerAttempt, setEditQuestionsPerAttempt] = useState(20);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const toast = useToast();

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quizzes', { params: { search } });
      if (res.success && res.data?.quizzes) {
        setQuizzes(res.data.quizzes);
        if (res.data.quizzes.length > 0 && !selectedQuiz) {
          setSelectedQuiz(res.data.quizzes[0]);
        }
      }
    } catch (err) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [search]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/quizzes', {
        title,
        description,
        passingPercentage: Number(passingPercentage) || 80,
        defaultQuestionsPerAttempt: Number(defaultQuestionsPerAttempt) || 20,
        timeLimitMinutes: Number(timeLimitMinutes) || 0,
        questions: [
          {
            id: `q_${Date.now()}`,
            prompt: 'Sample initial question prompt',
            type: 'single_choice',
            options: [
              { id: 'A', text: 'Option A' },
              { id: 'B', text: 'Option B' }
            ],
            correctAnswers: ['A'],
            explanation: 'Rationale for option A',
            points: 1
          }
        ]
      });

      toast.success('Quiz created successfully!');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setTimeLimitMinutes(15);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSettings = (quiz) => {
    setEditTimerMinutes(quiz.timeLimitMinutes || 0);
    setEditPassingScore(quiz.passingPercentage || 80);
    setEditQuestionsPerAttempt(quiz.defaultQuestionsPerAttempt || 20);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;
    try {
      setUpdatingSettings(true);
      const res = await api.put(`/quizzes/${selectedQuiz._id}`, {
        timeLimitMinutes: Number(editTimerMinutes) || 0,
        passingPercentage: Number(editPassingScore) || 80,
        defaultQuestionsPerAttempt: Number(editQuestionsPerAttempt) || 20
      });

      if (res.success && res.data?.quiz) {
        toast.success('Assessment timer and settings updated!');
        setSelectedQuiz(res.data.quiz);
        setIsSettingsOpen(false);
        fetchQuizzes();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this assessment quiz and all its questions?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      toast.success('Quiz deleted.');
      if (selectedQuiz?._id === quizId) setSelectedQuiz(null);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.message || 'Deletion failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Knowledge Gates</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-850 tracking-tight">Question Bank &amp; Quizzes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Author assessments, import questions via CSV/JSON, or extract questions from learning documents.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => {
              setActiveQuizForImport(selectedQuiz?._id);
              setIsExtractOpen(true);
            }}
            className="font-bold !rounded-xl"
          >
            Extract from Doc
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => {
              setActiveQuizForImport(selectedQuiz?._id);
              setIsImportOpen(true);
            }}
            className="font-bold !rounded-xl"
          >
            Import CSV/JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
            className="font-bold !rounded-xl shadow-md shadow-purple-600/20"
          >
            New Quiz
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: List of Quizzes */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-xs transition-all"
            />
          </div>

          <div className="space-y-2.5 max-h-[70vh] overflow-y-auto">
            {quizzes.map((q) => {
              const isSelected = selectedQuiz?._id === q._id;
              return (
                <div
                  key={q._id}
                  onClick={() => setSelectedQuiz(q)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50/70 border-purple-300 ring-2 ring-purple-200 shadow-md shadow-purple-500/5'
                      : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between font-extrabold text-slate-850">
                    <span className="line-clamp-1">{q.title}</span>
                    <Badge variant={isSelected ? 'purple' : 'default'} className="font-bold shrink-0 ml-2">
                      {q.questions?.length || 0} Qs
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2 font-medium flex-wrap">
                    <span className="text-purple-700 font-bold">Pass: {q.passingPercentage}%</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 font-bold text-slate-600">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {q.timeLimitMinutes > 0 ? `${q.timeLimitMinutes}m limit` : 'Untimed'}
                    </span>
                    <span>&bull;</span>
                    <span>{q.defaultQuestionsPerAttempt} Qs/try</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Quiz Questions Detail */}
        <div className="md:col-span-2">
          {selectedQuiz ? (
            <Card className="border-slate-100 bg-white space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-slate-850">{selectedQuiz.title}</h3>
                    {selectedQuiz.timeLimitMinutes > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" /> {selectedQuiz.timeLimitMinutes} Mins Timer
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Untimed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{selectedQuiz.description || 'Graded assessment criteria.'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenSettings(selectedQuiz)}
                    icon={Settings}
                    className="font-bold !rounded-xl text-xs"
                  >
                    Edit Timer &amp; Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuiz(selectedQuiz._id)}
                    icon={Trash2}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-bold !rounded-xl"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                    Question Bank ({selectedQuiz.questions?.length || 0})
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setActiveQuizForImport(selectedQuiz._id);
                        setIsImportOpen(true);
                      }}
                      icon={Upload}
                      className="font-bold !rounded-xl text-xs"
                    >
                      Import Questions
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {selectedQuiz.questions?.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-slate-850 leading-snug">
                          {idx + 1}. {q.prompt}
                        </span>
                        <Badge variant="purple" className="font-bold shrink-0">{q.type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options?.map((opt) => {
                          const isCorrect = (q.correctAnswers || []).includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold shadow-xs'
                                  : 'bg-white border-slate-200/80 text-slate-600 font-medium'
                              }`}
                            >
                              <span className="font-mono font-extrabold">{opt.id}:</span>
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="text-[11px] text-slate-500 italic pt-1.5 border-t border-slate-100">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center border-slate-100 bg-white text-slate-400 italic font-medium">
              Select or create a quiz from the left panel to inspect its questions.
            </Card>
          )}
        </div>
      </div>

      {/* Create Quiz Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Assessment Quiz">
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quiz Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Node.js & Microservices Assessment"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Topics tested and grading criteria"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Threshold (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Questions Per Attempt</label>
              <input
                type="number"
                min="1"
                value={defaultQuestionsPerAttempt}
                onChange={(e) => setDefaultQuestionsPerAttempt(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Assessment Timer Quick Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Assessment Countdown Timer
              </label>
              <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {timeLimitMinutes > 0 ? `${timeLimitMinutes} minutes` : 'Untimed (No limit)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {TIMER_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setTimeLimitMinutes(p.value)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    timeLimitMinutes === p.value
                      ? 'bg-amber-500 text-white shadow-sm scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="0"
                max="360"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
                placeholder="0"
              />
              <span className="text-xs text-slate-400">
                Custom minutes (0 = untimed assignment)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={saving} className="font-bold">
              Create Quiz
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Quiz Settings & Timer Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Edit Quiz Timer &amp; Grading Settings"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Updating the timer applies to all future student attempts on this quiz assignment.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Assessment Time Limit
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {editTimerMinutes > 0 ? `${editTimerMinutes} mins` : 'Untimed'}
              </span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {TIMER_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setEditTimerMinutes(p.value)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    editTimerMinutes === p.value
                      ? 'bg-amber-500 text-white shadow-sm scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="360"
                value={editTimerMinutes}
                onChange={(e) => setEditTimerMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-400">minutes (0 = untimed)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passing Score (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={editPassingScore}
                onChange={(e) => setEditPassingScore(parseInt(e.target.value, 10) || 80)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Questions / Attempt</label>
              <input
                type="number"
                min="1"
                value={editQuestionsPerAttempt}
                onChange={(e) => setEditQuestionsPerAttempt(parseInt(e.target.value, 10) || 20)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={updatingSettings} className="font-bold">
              Save Settings
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV/JSON Import Modal */}
      <ImportQuestionsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        quizId={activeQuizForImport}
        onImportSuccess={fetchQuizzes}
      />

      {/* Document Extract Modal */}
      <DocumentExtractModal
        isOpen={isExtractOpen}
        onClose={() => setIsExtractOpen(false)}
        quizId={activeQuizForImport}
        onImportSuccess={fetchQuizzes}
      />
    </div>
  );
}
