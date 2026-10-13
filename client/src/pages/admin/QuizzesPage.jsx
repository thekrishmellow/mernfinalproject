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
  Layers
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

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
  const [saving, setSaving] = useState(false);

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
        passingPercentage,
        defaultQuestionsPerAttempt,
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
      fetchQuizzes();
    } catch (err) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Question Bank &amp; Quizzes</h1>
          <p className="text-sm text-slate-400">
            Author assessments, import questions via CSV/JSON, or extract questions from PDF/MD documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => {
              setActiveQuizForImport(selectedQuiz?._id);
              setIsExtractOpen(true);
            }}
          >
            Extract from Doc
          </Button>
          <Button
            variant="secondary"
            icon={Upload}
            onClick={() => {
              setActiveQuizForImport(selectedQuiz?._id);
              setIsImportOpen(true);
            }}
          >
            Import CSV/JSON
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            New Quiz
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: List of Quizzes */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {quizzes.map((q) => (
              <div
                key={q._id}
                onClick={() => setSelectedQuiz(q)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedQuiz?._id === q._id
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{q.title}</span>
                  <Badge variant="primary">{q.questions?.length || 0} Qs</Badge>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>Pass: {q.passingPercentage}%</span>
                  <span>&bull;</span>
                  <span>Attempt Qs: {q.defaultQuestionsPerAttempt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Quiz Questions Detail */}
        <div className="md:col-span-2">
          {selectedQuiz ? (
            <Card className="p-6 border-slate-800 bg-slate-900/90 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedQuiz.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedQuiz.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuiz(selectedQuiz._id)}
                    icon={Trash2}
                    className="text-rose-400"
                  >
                    Delete Quiz
                  </Button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Question Bank ({selectedQuiz.questions?.length || 0})
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveQuizForImport(selectedQuiz._id);
                        setIsImportOpen(true);
                      }}
                      icon={Upload}
                    >
                      Import to Quiz
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {selectedQuiz.questions?.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-200">
                          {idx + 1}. {q.prompt}
                        </span>
                        <Badge variant="default">{q.type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options?.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                              (q.correctAnswers || []).includes(opt.id)
                                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-medium'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="font-mono font-bold">{opt.id}:</span>
                            <span>{opt.text}</span>
                            {(q.correctAnswers || []).includes(opt.id) && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center border-slate-800 bg-slate-900/40 text-slate-400 italic">
              Select or create a quiz to inspect its question bank.
            </Card>
          )}
        </div>
      </div>

      {/* Create Quiz Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Assessment Quiz">
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Quiz Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Node.js & Microservices Assessment"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Topics tested and grading criteria"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Passing Threshold (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Questions Per Attempt</label>
              <input
                type="number"
                min="1"
                value={defaultQuestionsPerAttempt}
                onChange={(e) => setDefaultQuestionsPerAttempt(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              Create Quiz
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
