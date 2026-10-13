import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RoadmapCanvas } from '../../components/roadmap/RoadmapCanvas.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
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
  Play
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
      <div className="h-[80vh] flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading your personalized roadmap journey...</span>
      </div>
    );
  }

  const nodes = version?.nodes || [];
  const edges = version?.edges || [];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Link to="/client/dashboard">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Dashboard
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">{roadmap?.title}</h1>
              <Badge variant="primary">
                Overall: {assignment?.progressPercentage || 0}% Complete
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Select any unlocked node to access its learning materials and assessments.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-blue-400">
            <Unlock className="w-3.5 h-3.5" /> Available
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5" /> Locked
          </div>
        </div>
      </div>

      {/* Visual Canvas in Read-Only Learner Mode */}
      <div className="flex-1 w-full h-full min-h-0 relative">
        <RoadmapCanvas
          initialNodes={nodes}
          initialEdges={edges}
          readOnly={true}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Node Selected Quick Modal */}
      {selectedNode && (
        <Modal
          isOpen={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          title={selectedNode.title}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  selectedNode.status === 'completed'
                    ? 'success'
                    : selectedNode.status === 'in_progress'
                    ? 'warning'
                    : selectedNode.status === 'available'
                    ? 'primary'
                    : 'default'
                }
              >
                Status: {selectedNode.status?.toUpperCase()}
              </Badge>
              {selectedNode.estimatedDuration && (
                <span className="text-xs text-slate-400">{selectedNode.estimatedDuration}</span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.description || 'No description provided.'}
            </p>

            {/* If Locked, Display Exact Reasons Why */}
            {selectedNode.status === 'locked' && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Prerequisites Required to Unlock:
                </div>
                <ul className="space-y-1 pl-4 list-disc text-slate-300">
                  {selectedNode.lockReasons && selectedNode.lockReasons.length > 0 ? (
                    selectedNode.lockReasons.map((reason, idx) => <li key={idx}>{reason}</li>)
                  ) : (
                    <li>Complete all preceding connected modules first.</li>
                  )}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedNode(null)}>
                Close
              </Button>
              {selectedNode.status !== 'locked' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenWorkspace(selectedNode.id)}
                  icon={Play}
                >
                  Enter Learning Workspace
                </Button>
              ) : (
                <Button variant="secondary" size="sm" disabled icon={Lock}>
                  Node Locked
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
