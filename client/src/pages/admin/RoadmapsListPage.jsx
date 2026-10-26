import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  GitFork,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function RoadmapsListPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Full-Stack Development');
  const [newVisibility, setNewVisibility] = useState('shared');
  const [newDuration, setNewDuration] = useState('4 weeks');
  const [creating, setCreating] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/admin/roadmaps', { params });
      if (res.success && res.data?.roadmaps) {
        setRoadmaps(res.data.roadmaps);
      }
    } catch (err) {
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [search, statusFilter]);

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/admin/roadmaps', {
        title: newTitle,
        description: newDescription,
        category: newCategory,
        visibility: newVisibility,
        estimatedDuration: newDuration
      });

      toast.success('Roadmap created! Launching Studio...');
      setIsCreateOpen(false);
      navigate(`/admin/roadmaps/${res.data.roadmap._id}/builder`);
    } catch (err) {
      toast.error(err.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (roadmapId) => {
    try {
      const res = await api.post(`/admin/roadmaps/${roadmapId}/duplicate`);
      toast.success(res.message || 'Roadmap duplicated!');
      fetchRoadmaps();
    } catch (err) {
      toast.error(err.message || 'Duplication failed');
    }
  };

  const handleDelete = async (roadmapId) => {
    if (!window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) return;
    try {
      const res = await api.delete(`/admin/roadmaps/${roadmapId}`);
      toast.success(res.message || 'Roadmap deleted');
      fetchRoadmaps();
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
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Curriculum Catalog</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-850 tracking-tight">Roadmap Studio</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Architect, version, and publish interactive visual learning journeys.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
          className="font-bold shadow-lg shadow-purple-600/20 self-start sm:self-auto"
        >
          New Roadmap
        </Button>
      </div>

      {/* Filters in modern clean white card */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search pathways by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Grid of Roadmaps */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mr-3" />
          <span className="font-bold text-slate-600 text-sm">Loading learning pathways...</span>
        </div>
      ) : roadmaps.length === 0 ? (
        <Card className="p-12 text-center border-slate-100 bg-white">
          <div className="w-14 h-14 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <GitFork className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">No pathways found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Get started by creating your first personalized learning curriculum.
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)} className="font-bold">
            Create Roadmap
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((r) => (
            <Card
              key={r._id}
              hover
              className="flex flex-col justify-between border-slate-100 bg-white p-6 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <Badge variant={r.status === 'published' ? 'success' : 'warning'} className="font-bold">
                    {r.status}
                  </Badge>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                    {r.visibility === 'shared' ? 'Shared Mode' : 'Private Custom'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-850 leading-snug line-clamp-1">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                    {r.description || 'Interactive structured learning roadmap.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100 font-semibold">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {r.estimatedDuration}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                    <Users className="w-3.5 h-3.5 text-purple-500" /> {r.activeAssignmentsCount || 0} active
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(r._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Duplicate roadmap"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete roadmap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link to={`/admin/roadmaps/${r._id}/builder`}>
                  <Button variant="primary" size="sm" icon={ExternalLink} className="font-bold">
                    Open Studio
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Roadmap Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Learning Pathway">
        <form onSubmit={handleCreateRoadmap} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Roadmap Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Distributed Systems & Microservices"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Overview of the curriculum, prerequisites, and milestone expectations"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Distribution Mode</label>
            <select
              value={newVisibility}
              onChange={(e) => setNewVisibility(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="shared">Shared Mode (reusable path assigned to multiple clients)</option>
              <option value="private">Private Mode (restricted custom assignment)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={creating} className="font-bold">
              Create &amp; Launch Studio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
