import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { AddYouTubeVideoModal } from '../../components/resources/AddYouTubeVideoModal.jsx';
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from '../../utils/youtube.js';
import {
  FolderArchive,
  Plus,
  Upload,
  FileText,
  Link as LinkIcon,
  Video,
  Play,
  BookOpen,
  Trash2,
  Search,
  ExternalLink,
  Sparkles,
  Clock
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(false);
  const [isYouTubeOpen, setIsYouTubeOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  // Markdown note state
  const [mdTitle, setMdTitle] = useState('');
  const [mdDesc, setMdDesc] = useState('');
  const [mdContent, setMdContent] = useState('');
  const [mdMinutes, setMdMinutes] = useState(15);
  const [savingMd, setSavingMd] = useState(false);

  const toast = useToast();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources', { params: { search, limit: 100 } });
      if (res.success && res.data?.resources) {
        setResources(res.data.resources);
      }
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search]);

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('description', uploadDesc);
      formData.append('isProtected', 'true');

      const res = await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Resource file uploaded successfully!');
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDesc('');
      fetchResources();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateMarkdown = async (e) => {
    e.preventDefault();
    try {
      setSavingMd(true);
      const res = await api.post('/resources', {
        title: mdTitle,
        description: mdDesc,
        type: 'markdown',
        content: mdContent,
        estimatedMinutes: mdMinutes,
        isProtected: true
      });

      toast.success('Markdown resource created!');
      setIsMarkdownOpen(false);
      setMdTitle('');
      setMdDesc('');
      setMdContent('');
      fetchResources();
    } catch (err) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setSavingMd(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Delete this resource from the library?')) return;
    try {
      await api.delete(`/resources/${resourceId}`);
      toast.success('Resource deleted.');
      fetchResources();
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
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Learning Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-850 tracking-tight">Resource Library</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curate Markdown notes, upload PDFs and assets, and manage links attached to learning milestones.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            icon={Video}
            onClick={() => setIsYouTubeOpen(true)}
            className="font-bold !rounded-xl !bg-red-600 hover:!bg-red-700 text-white shadow-md shadow-red-600/20"
          >
            Add YouTube Video
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => setIsMarkdownOpen(true)}
            className="font-bold !rounded-xl"
          >
            New Markdown Note
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => setIsUploadOpen(true)}
            className="font-bold !rounded-xl"
          >
            Upload File
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, description, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="font-bold text-slate-600 text-sm">Loading curriculum resources...</span>
        </div>
      ) : resources.length === 0 ? (
        <Card className="p-12 text-center border-slate-100 bg-white">
          <div className="w-14 h-14 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <FolderArchive className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">No resources found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Upload PDFs or write Markdown study notes to attach to your roadmap stations.
          </p>
          <Button variant="primary" size="sm" icon={Upload} onClick={() => setIsUploadOpen(true)} className="font-bold">
            Upload First Resource
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const ytId = extractYouTubeId(res.externalUrl);
            const isVideo = res.type === 'video' || Boolean(ytId);

            return (
              <Card
                key={res._id}
                hover
                className="flex flex-col justify-between border-slate-100 bg-white p-6 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={isVideo ? 'danger' : res.type === 'markdown' ? 'purple' : res.type === 'pdf' ? 'danger' : 'primary'}
                      className="font-bold flex items-center gap-1"
                    >
                      {isVideo ? <Video className="w-3 h-3 text-red-500" /> : null}
                      {isVideo ? 'YOUTUBE VIDEO' : res.type.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] font-bold text-slate-400">{res.estimatedMinutes || 15} mins study</span>
                  </div>

                  {/* YouTube Thumbnail Preview */}
                  {ytId && (
                    <div
                      onClick={() => setPreviewVideo(res)}
                      className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group shadow-sm border border-slate-200"
                    >
                      <img
                        src={getYouTubeThumbnail(ytId, 'hq')}
                        alt={res.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-sm text-white text-[10px] font-mono font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-amber-300" /> {res.estimatedMinutes || 15}m
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-850 leading-snug line-clamp-1">{res.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                      {res.description || 'Reference document for curriculum milestones.'}
                    </p>
                  </div>

                  {res.originalFilename && (
                    <div className="text-[11px] text-slate-400 font-mono truncate pt-2 border-t border-slate-100">
                      File: {res.originalFilename} ({(res.sizeBytes / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                  <button
                    onClick={() => handleDelete(res._id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {isVideo && (
                      <button
                        onClick={() => setPreviewVideo(res)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Play className="w-3 h-3 fill-red-600" /> Watch
                      </button>
                    )}

                    {res.externalUrl ? (
                      <a
                        href={res.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
                      >
                        Open <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : res.storageKey ? (
                      <a
                        href={`/api/v1/resources/${res._id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
                      >
                        Preview File <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        In-App Note
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload File Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Learning Resource">
        <form onSubmit={handleUploadFile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title</label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Whitepaper (PDF)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              placeholder="Context and learning objectives for students"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select File (PDF, TXT, MD)</label>
            <input
              type="file"
              required
              accept=".pdf,.txt,.md,.json"
              onChange={(e) => setUploadFile(e.target.files[0] || null)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white file:cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={uploading} icon={Upload} className="font-bold">
              Upload Resource
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Markdown Note Modal */}
      <Modal isOpen={isMarkdownOpen} onClose={() => setIsMarkdownOpen(false)} title="Author Markdown Study Note" maxWidth="max-w-3xl">
        <form onSubmit={handleCreateMarkdown} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Note Title</label>
            <input
              type="text"
              required
              value={mdTitle}
              onChange={(e) => setMdTitle(e.target.value)}
              placeholder="e.g. Asynchronous Microtask Fundamentals"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Summary Description</label>
              <input
                type="text"
                value={mdDesc}
                onChange={(e) => setMdDesc(e.target.value)}
                placeholder="Brief takeaway"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Est. Reading Minutes</label>
              <input
                type="number"
                min="1"
                value={mdMinutes}
                onChange={(e) => setMdMinutes(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Markdown Body</label>
            <textarea
              rows={12}
              required
              value={mdContent}
              onChange={(e) => setMdContent(e.target.value)}
              placeholder="# Lesson Title&#10;&#10;Key Concepts:&#10;- Point 1&#10;- Point 2&#10;&#10;```javascript&#10;console.log('Code example');&#10;```"
              className="w-full bg-slate-50 font-mono text-xs text-slate-800 border border-slate-200 rounded-2xl p-3.5 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsMarkdownOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingMd} icon={FileText} className="font-bold">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add YouTube Video Modal */}
      <AddYouTubeVideoModal
        isOpen={isYouTubeOpen}
        onClose={() => setIsYouTubeOpen(false)}
        onSuccess={fetchResources}
      />

      {/* Video Preview Modal */}
      {previewVideo && (
        <Modal
          isOpen={Boolean(previewVideo)}
          onClose={() => setPreviewVideo(null)}
          title={previewVideo.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
              <iframe
                src={getYouTubeEmbedUrl(extractYouTubeId(previewVideo.externalUrl), { autoplay: 1 })}
                title={previewVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-slate-600 leading-relaxed">{previewVideo.description}</p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                <span>⏱️ {previewVideo.estimatedMinutes || 15} minutes duration</span>
                <span>&bull;</span>
                <a
                  href={previewVideo.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 font-bold hover:underline flex items-center gap-1"
                >
                  Watch on YouTube <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setPreviewVideo(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
