import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Upload, FileText, CheckCircle2, AlertTriangle, Trash2, Edit3 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../ui/Toast.jsx';

export function DocumentExtractModal({ isOpen, onClose, quizId, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleUploadAndExtract = async () => {
    if (!file) return;
    try {
      setExtracting(true);
      const formData = new FormData();
      formData.append('document', file);

      const res = await api.post('/quizzes/extract-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success && res.data?.extractedQuestions) {
        setExtractedQuestions(res.data.extractedQuestions);
        toast.success(`Extracted ${res.data.extractedQuestions.length} candidate questions! Please review.`);
      }
    } catch (err) {
      toast.error(err.message || 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const handleUpdateQuestion = (index, field, value) => {
    setExtractedQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteQuestion = (index) => {
    setExtractedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmAndInsert = async () => {
    try {
      setConfirming(true);
      const res = await api.post('/quizzes/import', {
        questions: extractedQuestions,
        quizId
      });
      toast.success(res.message || 'Approved questions imported successfully!');
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document-Based Question Extraction"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {extractedQuestions.length === 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Upload a study guide, exam paper, syllabus notes, or quiz document (PDF, Markdown, or Text).
              Our pipeline will parse questions, choices, and answer keys, then present them for your approval.
            </p>

            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <div className="text-sm text-slate-200 font-medium mb-1">
                {file ? file.name : 'Choose a PDF, MD, or TXT file'}
              </div>
              <p className="text-xs text-slate-400 mb-4">Max file size 10MB</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".pdf,.md,.txt"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
                <span className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer transition-colors">
                  Browse File
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!file}
                loading={extracting}
                onClick={handleUploadAndExtract}
                icon={Upload}
              >
                Extract Questions
              </Button>
            </div>
          </div>
        ) : (
          /* Extraction Review & Approval Interface */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Review &amp; Approve Extracted Questions ({extractedQuestions.length})
                </h4>
                <p className="text-xs text-slate-400">
                  Inspect candidate questions, verify correct answers, and refine wording before importing.
                </p>
              </div>
              <Button
                variant="accent"
                size="sm"
                onClick={handleConfirmAndInsert}
                loading={confirming}
                icon={CheckCircle2}
              >
                Approve &amp; Import All
              </Button>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {extractedQuestions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-blue-400">Q{idx + 1}</span>
                    <div className="flex items-center gap-2">
                      {q.confidence === 'review_required' && (
                        <Badge variant="warning">Review Key Needed</Badge>
                      )}
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Discard question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Prompt</label>
                    <textarea
                      rows={2}
                      value={q.prompt}
                      onChange={(e) => handleUpdateQuestion(idx, 'prompt', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Options</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options?.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="w-5 font-mono font-bold text-slate-400">{opt.id}:</span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updatedOpts = [...q.options];
                              updatedOpts[optIdx] = { ...opt, text: e.target.value };
                              handleUpdateQuestion(idx, 'options', updatedOpts);
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Correct Answer (e.g. A or true)
                      </label>
                      <input
                        type="text"
                        value={(q.correctAnswers || []).join(', ')}
                        onChange={(e) =>
                          handleUpdateQuestion(
                            idx,
                            'correctAnswers',
                            e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Explanation</label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                        placeholder="Optional rationale"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setExtractedQuestions([]); setFile(null); }}
              >
                Start Over
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleConfirmAndInsert}
                  loading={confirming}
                  icon={CheckCircle2}
                >
                  Approve &amp; Import ({extractedQuestions.length})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
