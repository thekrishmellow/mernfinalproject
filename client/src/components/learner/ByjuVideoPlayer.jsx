import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Maximize2,
  Minimize2,
  BookOpen,
  FileText,
  HelpCircle,
  Copy,
  Check,
  Zap,
  Award
} from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '../../utils/youtube.js';
import { useToast } from '../ui/Toast.jsx';

export function ByjuVideoPlayer({
  resource,
  isCompleted = false,
  onToggleComplete
}) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'notes' | 'doubts'
  const [isTheater, setIsTheater] = useState(false);
  const [notes, setNotes] = useState('');
  const [copiedNotes, setCopiedNotes] = useState(false);
  const toast = useToast();

  const rawVideoUrl = resource?.externalUrl || resource?.url || resource?.content || '';
  const videoId = extractYouTubeId(rawVideoUrl);
  const isDirectVideo = !videoId && Boolean(rawVideoUrl?.match(/\.(mp4|webm|ogg)$/i) || resource?.mimeType?.startsWith('video/'));
  const storageNotesKey = resource?._id ? `lesson_notes_${resource._id}` : null;

  // Load saved learner notes for this lesson
  useEffect(() => {
    if (storageNotesKey) {
      const saved = localStorage.getItem(storageNotesKey);
      if (saved) setNotes(saved);
      else setNotes('');
    }
  }, [storageNotesKey]);

  const handleNotesChange = (val) => {
    setNotes(val);
    if (storageNotesKey) {
      localStorage.setItem(storageNotesKey, val);
    }
  };

  const handleCopyNotes = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setCopiedNotes(true);
    toast.success('Notes copied to clipboard!');
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  if (!resource || (!videoId && !isDirectVideo && !rawVideoUrl)) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200">
        <p className="text-xs text-slate-500">Invalid or missing video stream source.</p>
      </div>
    );
  }

  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId, { autoplay: 0 }) : rawVideoUrl;

  return (
    <div className={`space-y-4 transition-all duration-300 ${isTheater ? 'lg:-mx-12' : ''}`}>
      {/* Video Station Container */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        {/* Top Video Classroom Ribbon */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> BYJU'S In-App Video Lesson
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-amber-400" />
              {resource.estimatedMinutes || 15} Mins
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTheater(!isTheater)}
              title={isTheater ? 'Default view' : 'Theater mode'}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              {isTheater ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" /> Exit Theater
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" /> Theater Mode
                </>
              )}
            </button>

            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Open on YouTube"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 16:9 Aspect Ratio Cinematic Player */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {videoId ? (
            <iframe
              src={embedUrl}
              title={resource.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : isDirectVideo ? (
            <video
              src={rawVideoUrl}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <iframe
              src={rawVideoUrl}
              title={resource.title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}
        </div>

        {/* Player Bottom Bar & Completion Action */}
        <div className="p-4 sm:p-5 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/80">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              {resource.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">
              {resource.description || 'Watch the lecture video completely to master this milestone concept.'}
            </p>
          </div>

          <button
            onClick={() => onToggleComplete && onToggleComplete(resource._id, isCompleted)}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Completed &bull; Rewatch
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark as Watched &amp; Completed
              </>
            )}
          </button>
        </div>
      </div>

      {/* In-App Study Desk Below Video */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {/* Study Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'summary'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Concept Summary
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'notes'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> My Study Notes
            {notes.trim().length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('doubts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'doubts'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Practice Questions
          </button>
        </div>

        {/* Tab 1: Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Concept Overview
              </h4>
              <p className="leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700">
                {resource.description || 'No additional summary provided. Follow along with the video lesson and jot down important takeaways.'}
              </p>
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Keywords:
                </span>
                {resource.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Study Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Jot down timestamps, formulas, or key ideas while watching. Auto-saves locally!
              </span>
              <button
                onClick={handleCopyNotes}
                disabled={!notes}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
              >
                {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedNotes ? 'Copied' : 'Copy Notes'}
              </button>
            </div>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="e.g. 02:45 - Key principle explained&#10;05:12 - Formula to remember: E = mc^2"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Tab 3: Doubts & Practice */}
        {activeTab === 'doubts' && (
          <div className="p-5 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Active Recall Prompt
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Before proceeding to the assessment quiz, summarize the main insight of this video in 2 sentences. If anything is unclear, re-watch the tricky part or check the attached notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
