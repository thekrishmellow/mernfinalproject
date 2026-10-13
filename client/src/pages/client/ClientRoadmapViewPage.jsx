import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RoadmapCanvas } from '../../components/roadmap/RoadmapCanvas.jsx';
import { ByjuStepperTrack, ByjuWindingTrail } from '../../components/learner/ByjuJourneyTrack.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import {
  ArrowLeft,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award,
  AlertTriangle,
  Play,
  Compass,
  MapPin,
  Sparkles,
  GitFork
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

export function ClientRoadmapViewPage() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('winding'); // 'winding' (Byju's trail) or 'graph' (ReactFlow)

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/client/assignments/${assignmentId}/roadmap`);
        if (res.success && res.data) {
          setAssignment(res.data.assignment);
          setRoadmap(res.data.roadmap);
          setVersion(res.data.version);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load assigned roadmap.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [assignmentId]);

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
  };

  const handleOpenWorkspace = (nodeId) => {
    navigate(`/client/assignments/${assignmentId}/nodes/${nodeId}`);
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center text-slate-400 bg-[#F8F9FE]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-600">Loading your learning trail...</span>
        </div>
      </div>
    );
  }

  const nodes = version?.nodes || [];
  const edges = version?.edges || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/client/dashboard">
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{roadmap?.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold border border-amber-200">
                {assignment?.progressPercentage || 0}% Mastered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow the curriculum path, complete checkpoints, and unlock assessments.
            </p>
          </div>
        </div>

        {/* View Mode Switcher: BYJU'S Winding Trail vs Knowledge Graph */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('winding')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'winding'
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>Learning Trail</span>
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'graph'
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-purple-600" />
            <span>Knowledge Graph</span>
          </button>
        </div>
      </div>

      {/* 1. Byju Stepper Track Strip */}
      <ByjuStepperTrack
        nodes={nodes}
        onSelectNode={handleNodeClick}
        onResume={handleOpenWorkspace}
      />

      {/* 2. Main View Mode: Either Byju's Winding Trail or Knowledge Graph Canvas */}
      {viewMode === 'winding' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm">
          <div className="text-center max-w-md mx-auto mb-6 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Visual Path</span>
            <h2 className="text-xl font-extrabold text-slate-800">Your Progression Journey</h2>
            <p className="text-xs text-slate-500">
              Each station represents a module. Follow the trail to reach the completion flag!
            </p>
          </div>

          <ByjuWindingTrail
            nodes={nodes}
            onSelectNode={handleNodeClick}
            onResume={handleOpenWorkspace}
          />
        </div>
      ) : (
        /* React Flow Canvas mode */
        <div className="h-[75vh] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative bg-[#0b0f19]">
          <RoadmapCanvas
            initialNodes={nodes}
            initialEdges={edges}
            readOnly={true}
            onNodeClick={handleNodeClick}
          />
        </div>
      )}

      {/* Node Details / Prerequisite Gate Modal */}
      {selectedNode && (
        <Modal
          isOpen={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          title={selectedNode.title}
          maxWidth="max-w-lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                  selectedNode.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : selectedNode.status === 'available' || selectedNode.status === 'in_progress'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                Status: {selectedNode.status}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {selectedNode.estimatedDuration || '1 week'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedNode.description || 'Explore learning resources, practice exercises, and assessments in this module.'}
            </p>

            {/* If Locked, Display Exact Reasons Why */}
            {selectedNode.status === 'locked' && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Prerequisites Required to Unlock:
                </div>
                <ul className="space-y-1 pl-4 list-disc text-amber-800/90">
                  {selectedNode.lockReasons && selectedNode.lockReasons.length > 0 ? (
                    selectedNode.lockReasons.map((reason, idx) => <li key={idx}>{reason}</li>)
                  ) : (
                    <li>Complete all preceding connected modules first.</li>
                  )}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              {selectedNode.status !== 'locked' ? (
                <button
                  type="button"
                  onClick={() => handleOpenWorkspace(selectedNode.id)}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Enter Learning Workspace
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-5 py-2.5 rounded-full bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Module Locked
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
