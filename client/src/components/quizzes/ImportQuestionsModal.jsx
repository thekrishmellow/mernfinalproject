import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Upload, Download, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../ui/Toast.jsx';

export function ImportQuestionsModal({ isOpen, onClose, quizId, onImportSuccess }) {
  const [format, setFormat] = useState('json'); // 'json' or 'csv'
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewErrors, setPreviewErrors] = useState([]);
  const toast = useToast();

  if (!isOpen) return null;

  const sampleJson = `[
  {
    "prompt": "What HTTP method is used to retrieve a resource without side effects?",
    "type": "single_choice",
    "options": [
      { "id": "A", "text": "GET" },
      { "id": "B", "text": "POST" },
      { "id": "C", "text": "DELETE" }
    ],
    "correctAnswers": ["A"],
    "explanation": "GET is safe and idempotent.",
    "points": 1
  }
]`;

  const sampleCsv = `prompt,type,option_A,option_B,option_C,option_D,correct_answer,explanation
"Which cookie flag prevents JavaScript access?","single_choice","Secure","HttpOnly","SameSite","Domain","B","HttpOnly prevents script access"`;

  const handleDownloadSample = () => {
    const content = format === 'json' ? sampleJson : sampleCsv;
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question_bank_template.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setPreviewErrors([]);

      let parsedQuestions = [];

      if (format === 'json') {
        try {
          parsedQuestions = JSON.parse(rawText);
        } catch (err) {
          throw new Error('Invalid JSON format. Please verify syntax.');
        }
      } else {
        // Simple CSV parser
        const lines = rawText.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) throw new Error('CSV must have a header row and at least 1 data row.');
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map((s) => s.replace(/^"|"$/g, '').trim());
          if (parts.length >= 7) {
            parsedQuestions.push({
              prompt: parts[0],
              type: parts[1] || 'single_choice',
              options: [
                { id: 'A', text: parts[2] },
                { id: 'B', text: parts[3] },
                { id: 'C', text: parts[4] },
                { id: 'D', text: parts[5] ? parts[5] : 'N/A' }
              ].filter((o) => o.text && o.text !== 'N/A'),
              correctAnswers: [parts[6]],
              explanation: parts[7] || '',
              points: 1
            });
          }
        }
      }

      const res = await api.post('/quizzes/import', {
        questions: parsedQuestions,
        quizId
      });

      toast.success(res.message || 'Questions imported successfully!');
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      if (err.errors) {
        setPreviewErrors(err.errors);
      }
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Structured Questions" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setFormat('json'); setRawText(sampleJson); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                format === 'json' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              JSON Array
            </button>
            <button
              onClick={() => { setFormat('csv'); setRawText(sampleCsv); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                format === 'csv' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              CSV Table
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={handleDownloadSample} icon={Download}>
            Download Template
          </Button>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Paste {format.toUpperCase()} Question Data
          </label>
          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={format === 'json' ? sampleJson : sampleCsv}
            className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-blue-500"
          />
        </div>

        {previewErrors.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs text-rose-300 space-y-1 max-h-36 overflow-y-auto">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" /> Validation Errors:
            </div>
            {previewErrors.map((e, idx) => (
              <div key={idx}>&bull; {e}</div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleImport}
            loading={loading}
            disabled={!rawText.trim()}
            icon={Upload}
          >
            Import Questions
          </Button>
        </div>
      </div>
    </Modal>
  );
}
