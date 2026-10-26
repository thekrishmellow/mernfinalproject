import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import {
  Video,
  Play,
  Clock,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from '../../utils/youtube.js';
import { api } from '../../services/api.js';
import { useToast } from '../ui/Toast.jsx';

const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60];

export function AddYouTubeVideoModal({
  isOpen,
  onClose,
  onSuccess,
  initialUrl = ''
}) {
  const [url, setUrl] = useState(initialUrl);
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialUrl) {
        setUrl(initialUrl);
        const id = extractYouTubeId(initialUrl);
        setVideoId(id || '');
      }
    } else {
      setUrl('');
      setVideoId('');
      setTitle('');
      setDescription('');
      setEstimatedMinutes(15);
      setTags('');
      setPreviewActive(false);
    }
  }, [isOpen, initialUrl]);

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    const id = extractYouTubeId(val);
    setVideoId(id || '');
    if (id && !title) {
      // Friendly auto-suggested title if empty
      setTitle('Video Concept Lesson');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoId) {
      toast.error('Please enter a valid YouTube video URL or ID.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please provide a title for the video.');
      return;
    }

    try {
      setSaving(true);
      const embedUrl = `https://www.youtube.com/watch?v= ${videoId}`.replace(' ', '');

      const res = await api.post('/resources', {
        title: title.trim(),
        description: description.trim(),
        type: 'video',
        externalUrl: embedUrl,
        estimatedMinutes: Number(estimatedMinutes) || 15,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        isProtected: false
      });

      if (res.success && res.data?.resource) {
        toast.success(`Video lesson "${title}" added to library!`);
        if (onSuccess) {
          onSuccess(res.data.resource);
        }
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save YouTube video resource');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add In-App YouTube Video"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* URL Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-red-500" /> YouTube Video URL or Video ID
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Supports youtube.com, youtu.be, shorts &amp; embeds
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={url}
              onChange={handleUrlChange}
              placeholder="e.g. https://www.youtube.com/watch?v=kqtD5dpn9C8 or youtu.be/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
            />
            {videoId && (
              <span className="absolute right-3 top-2.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> ID: {videoId}
              </span>
            )}
          </div>
        </div>

        {/* Live BYJU'S-Style Preview Card */}
        {videoId ? (
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-md">
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {previewActive ? (
                <iframe
                  src={getYouTubeEmbedUrl(videoId, { autoplay: 1 })}
                  title="YouTube video player preview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div
                  onClick={() => setPreviewActive(true)}
                  className="relative w-full h-full cursor-pointer group flex items-center justify-center"
                >
                  <img
                    src={getYouTubeThumbnail(videoId, 'maxres')}
                    onError={(e) => {
                      e.target.src = getYouTubeThumbnail(videoId, 'hq');
                    }}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transform group-hover:scale-110 transition-all">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <span className="font-bold flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ready for BYJU'S In-App Classroom
                    </span>
                    <span className="text-[11px] bg-red-600/80 px-2 py-0.5 rounded-full font-mono font-bold">
                      Click to Test
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : url.trim().length > 5 ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Could not extract video ID from this URL. Please verify the link.</span>
          </div>
        ) : null}

        {/* Video Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Lesson / Video Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Photosynthesis & Cellular Respiration - Core Concept"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </div>

        {/* Description / Key Concepts */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Learning Objectives &amp; Summary (In-App Study Notes)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline what learners will master in this video lesson..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none"
          />
        </div>

        {/* Duration Quick Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Estimated Watch Duration (Minutes)
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-600">
              {estimatedMinutes} min{estimatedMinutes === 1 ? '' : 's'}
            </span>
          </label>

          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {DURATION_PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setEstimatedMinutes(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  estimatedMinutes === m
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/25 scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          <input
            type="number"
            min="1"
            max="300"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. Science, Biology, High School, Foundations"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            loading={saving}
            className="font-bold !bg-red-600 hover:!bg-red-700 text-white shadow-md shadow-red-600/25"
          >
            Add Video Lesson
          </Button>
        </div>
      </form>
    </Modal>
  );
}
