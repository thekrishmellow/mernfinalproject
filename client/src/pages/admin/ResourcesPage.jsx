import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  FolderArchive,
  Plus,
  Upload,
  FileText,
  Link as LinkIcon,
  Video,
  BookOpen,
  Trash2,
  Search,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMarkdownOpen, setIsMarkdownOpen] = useState(false);

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Resource Library</h1>
          <p className="text-sm text-slate-400">
            Curate Markdown notes, upload PDFs and assets, and manage links attached to learning nodes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={FileText} onClick={() => setIsMarkdownOpen(true)}>
            New Markdown Note
          </Button>
          <Button variant="primary" icon={Upload} onClick={() => setIsUploadOpen(true)}>
            Upload File
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, description, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res) => (
          <Card key={res._id} hover className="flex flex-col justify-between border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={res.type === 'markdown' ? 'purple' : res.type === 'pdf' ? 'danger' : 'primary'}>
                  {res.type.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-slate-400">{res.estimatedMinutes} mins read</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">{res.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{res.description || 'No description provided.'}</p>
              </div>

              {res.originalFilename && (
                <div className="text-[11px] text-slate-500 font-mono truncate">
                  File: {res.originalFilename} ({(res.sizeBytes / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleDelete(res._id)}
                className="text-slate-500 hover:text-rose-400 p-1"
                title="Delete resource"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {res.externalUrl ? (
                <a
                  href={res.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Visit Link <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : res.storageKey ? (
                <a
                  href={`/api/v1/resources/${res._id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Preview File <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-[11px] text-emerald-400">In-App Note</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Upload File Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Learning Resource">
        <form onSubmit={handleUploadFile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Title</label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Whitepaper (PDF)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              placeholder="Context for students"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select File (PDF, TXT, MD)</label>
            <input
              type="file"
              required
              accept=".pdf,.txt,.md,.json"
              onChange={(e) => setUploadFile(e.target.files[0] || null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-600 file:text-white file:cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={uploading} icon={Upload}>
              Upload Resource
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Markdown Note Modal */}
      <Modal isOpen={isMarkdownOpen} onClose={() => setIsMarkdownOpen(false)} title="Author Markdown Study Note" maxWidth="max-w-3xl">
        <form onSubmit={handleCreateMarkdown} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Note Title</label>
            <input
              type="text"
              required
              value={mdTitle}
              onChange={(e) => setMdTitle(e.target.value)}
              placeholder="e.g. Asynchronous Microtask Fundamentals"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Summary Description</label>
              <input
                type="text"
                value={mdDesc}
                onChange={(e) => setMdDesc(e.target.value)}
                placeholder="Brief takeaway"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Reading Minutes</label>
              <input
                type="number"
                min="1"
                value={mdMinutes}
                onChange={(e) => setMdMinutes(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Markdown Body</label>
            <textarea
              rows={12}
              required
              value={mdContent}
              onChange={(e) => setMdContent(e.target.value)}
              placeholder="# Lesson Title&#10;&#10;Key Concepts:&#10;- Point 1&#10;- Point 2&#10;&#10;```javascript&#10;console.log('Code example');&#10;```"
              className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsMarkdownOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={savingMd} icon={FileText}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
