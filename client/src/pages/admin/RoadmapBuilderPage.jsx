import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RoadmapCanvas } from '../../components/roadmap/RoadmapCanvas.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  GitFork,
  Send,
  History
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function RoadmapBuilderPage() {
  const { roadmapId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [versions, setVersions] = useState([]);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publicationNotes, setPublicationNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const toast = useToast();

  const fetchRoadmapData = useCallback(async () => {
    try {
      setLoading(true);
      const [roadmapRes, resRes, quizRes] = await Promise.all([
        api.get(`/admin/roadmaps/${roadmapId}`),
        api.get('/resources?limit=100'),
        api.get('/quizzes?limit=100')
      ]);

      if (roadmapRes.success && roadmapRes.data?.roadmap) {
        const r = roadmapRes.data.roadmap;
        setRoadmap(r);
        setVersions(roadmapRes.data.versions || []);
        setNodes(r.draftNodes || []);
        setEdges(r.draftEdges || []);
      }
      if (resRes.success && resRes.data?.resources) {
        setResources(resRes.data.resources);
      }
      if (quizRes.success && quizRes.data?.quizzes) {
        setQuizzes(quizRes.data.quizzes);
      }
    } catch (err) {
      toast.error('Failed to load roadmap studio data.');
    } finally {
      setLoading(false);
    }
  }, [roadmapId, toast]);

  useEffect(() => {
    fetchRoadmapData();
  }, [fetchRoadmapData]);

  const handleCanvasChange = (updatedNodes, updatedEdges) => {
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      await api.put(`/admin/roadmaps/${roadmapId}/draft`, {
        nodes,
        edges
      });
      setHasUnsavedChanges(false);
      toast.success('Draft saved successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPublish = async () => {
    try {
      setIsPublishing(true);
      setValidationErrors([]);

      // First save current draft to ensure backend has latest nodes/edges
      await api.put(`/admin/roadmaps/${roadmapId}/draft`, { nodes, edges });

      const res = await api.post(`/admin/roadmaps/${roadmapId}/publish`, {
        publicationNotes
      });

      toast.success(res.message || 'Published successfully!');
      setIsPublishModalOpen(false);
      setHasUnsavedChanges(false);
      fetchRoadmapData();
    } catch (err) {
      if (err.errors) {
        setValidationErrors(err.errors);
      }
      toast.error(err.message || 'Publication validation failed');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Initializing Roadmap Canvas Studio...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-3">
      {/* Top Studio Control Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Link to="/admin/roadmaps">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">{roadmap?.title}</h1>
              <Badge variant={roadmap?.status === 'published' ? 'success' : 'warning'}>
                {roadmap?.status}
              </Badge>
              {hasUnsavedChanges && (
                <span className="text-[11px] text-amber-400 font-medium animate-pulse">
                  &bull; Unsaved changes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {nodes.length} nodes &bull; {edges.length} connections &bull; {versions.length} published snapshot(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            loading={isSaving}
            icon={Save}
          >
            Save Draft
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsPublishModalOpen(true)}
            icon={CheckCircle2}
          >
            Publish Version
          </Button>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="flex-1 w-full h-full min-h-0">
        <RoadmapCanvas
          initialNodes={nodes}
          initialEdges={edges}
          onChange={handleCanvasChange}
          onSave={handleSaveDraft}
          onPublish={() => setIsPublishModalOpen(true)}
          isSaving={isSaving}
          isPublishing={isPublishing}
          availableResources={resources}
          availableQuizzes={quizzes}
        />
      </div>

      {/* Publish Version Modal with Validation Gating */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Immutable Roadmap Version"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Publishing creates a permanent snapshot of this canvas structure. Active client assignments
            reference this immutable version. The backend progression engine will validate the dependency graph
            for cycles and valid prerequisites.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Release Notes / Version Description
            </label>
            <input
              type="text"
              value={publicationNotes}
              onChange={(e) => setPublicationNotes(e.target.value)}
              placeholder="e.g. Added Async/Await gate and updated quiz passing score"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Graph Structural Validation Errors:
              </div>
              {validationErrors.map((err, idx) => (
                <div key={idx}>&bull; {err}</div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleConfirmPublish}
              loading={isPublishing}
              icon={CheckCircle2}
            >
              Validate &amp; Publish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
