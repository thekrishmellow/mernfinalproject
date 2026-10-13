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
  Sparkles
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

      toast.success('Roadmap created! Opening builder...');
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Roadmap Studio</h1>
          <p className="text-sm text-slate-400">
            Create, version, and publish interactive visual learning journeys.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
          New Roadmap
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search roadmaps by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
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
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading roadmaps...</span>
        </div>
      ) : roadmaps.length === 0 ? (
        <Card className="p-12 text-center border-slate-800 bg-slate-900/40">
          <GitFork className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No roadmaps found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Get started by creating your first personalized learning pathway.
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Create Roadmap
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((r) => (
            <Card key={r._id} hover className="flex flex-col justify-between border-slate-800 bg-slate-900/90 p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={r.status === 'published' ? 'success' : 'warning'}>
                    {r.status}
                  </Badge>
                  <Badge variant="default" className="text-[10px]">
                    {r.visibility === 'shared' ? 'Shared Mode' : 'Private Mode'}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug line-clamp-1">{r.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description || 'No description provided.'}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {r.estimatedDuration}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> {r.activeAssignmentsCount || 0} assigned
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(r._id)}
                    icon={Copy}
                    title="Duplicate roadmap"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(r._id)}
                    icon={Trash2}
                    title="Delete roadmap"
                  />
                </div>
                <Link to={`/admin/roadmaps/${r._id}/builder`}>
                  <Button variant="primary" size="sm" icon={ExternalLink}>
                    Open Canvas
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Roadmap Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Roadmap">
        <form onSubmit={handleCreateRoadmap} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Roadmap Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Distributed Systems & Microservices"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Overview of the curriculum, prerequisites, and milestones"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Distribution Mode</label>
            <select
              value={newVisibility}
              onChange={(e) => setNewVisibility(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="shared">Shared Mode (reusable path assigned to multiple clients)</option>
              <option value="private">Private Mode (restricted custom assignment)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={creating}>
              Create &amp; Launch Studio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
