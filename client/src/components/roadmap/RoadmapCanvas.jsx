import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import { CustomRoadmapNode } from './CustomRoadmapNode.jsx';
import { NodeConfigPanel } from './NodeConfigPanel.jsx';
import { Button } from '../ui/Button.jsx';
import {
  Plus,
  Compass,
  BookOpen,
  Code2,
  FileQuestion,
  Milestone,
  Sparkles,
  Search,
  Focus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const nodeTypes = {
  customNode: CustomRoadmapNode
};

export function RoadmapCanvas({
  initialNodes = [],
  initialEdges = [],
  onChange,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false,
  availableResources = [],
  availableQuizzes = [],
  readOnly = false,
  onNodeClick = null
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map((n) => ({
      ...n,
      type: 'customNode',
      data: { ...n }
    }))
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.map((e) => ({
      ...e,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
    }))
  );

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const reactFlowInstance = useRef(null);

  // Sync to parent when nodes or edges change
  const notifyChange = useCallback(
    (newNodes, newEdges) => {
      if (onChange) {
        onChange(
          newNodes.map((n) => ({ ...n.data, id: n.id, position: n.position })),
          newEdges.map((e) => ({ id: e.id, source: e.source, target: e.target }))
        );
      }
    },
    [onChange]
  );

  // Edge connection handler
  const onConnect = useCallback(
    (params) => {
      if (readOnly) return;
      setEdges((eds) => {
        const nextEdges = addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
          },
          eds
        );
        notifyChange(nodes, nextEdges);
        return nextEdges;
      });
    },
    [readOnly, nodes, notifyChange, setEdges]
  );

  // Node selection handler
  const handleNodeClick = useCallback(
    (_, node) => {
      if (onNodeClick) {
        onNodeClick(node.data);
      } else if (!readOnly) {
        setSelectedNodeId(node.id);
      }
    },
    [readOnly, onNodeClick]
  );

  // Add node from palette
  const handleAddNode = (type = 'learning') => {
    if (readOnly) return;
    const id = `node_${Date.now()}`;
    const titles = {
      start: 'Prerequisites & Overview',
      learning: 'Core Learning Module',
      practice: 'Hands-on Exercise',
      quiz: 'Knowledge Check Gate',
      project: 'Milestone Implementation',
      completion: 'Final Certification'
    };

    const newNode = {
      id,
      type: 'customNode',
      position: {
        x: 250 + Math.random() * 100,
        y: 100 + nodes.length * 120
      },
      data: {
        id,
        title: titles[type] || 'New Node',
        description: 'Configure objectives and resources',
        type,
        estimatedDuration: '1 week',
        tasks: [{ id: `task_${Date.now()}`, text: 'Complete introductory study', isRequired: true }],
        completionConditions: { requireAllTasks: true, requireAllResources: false, requireQuizPass: type === 'quiz' }
      }
    };

    setNodes((nds) => {
      const updated = [...nds, newNode];
      notifyChange(updated, edges);
      return updated;
    });
    setSelectedNodeId(id);
  };

  // Update selected node data
  const handleUpdateNode = (nodeId, updatedData) => {
    setNodes((nds) => {
      const updated = nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...updatedData, id: nodeId } } : n
      );
      notifyChange(updated, edges);
      return updated;
    });
  };

  // Delete node
  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => {
      const updatedNodes = nds.filter((n) => n.id !== nodeId);
      setEdges((eds) => {
        const updatedEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
        notifyChange(updatedNodes, updatedEdges);
        return updatedEdges;
      });
      return updatedNodes;
    });
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Search and center node
  const handleSearchFocus = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !reactFlowInstance.current) return;
    const target = nodes.find(
      (n) => n.data?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (target) {
      reactFlowInstance.current.setCenter(target.position.x + 120, target.position.y + 60, {
        zoom: 1.2,
        duration: 800
      });
      setSelectedNodeId(target.id);
    }
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  return (
    <div className="relative w-full h-full flex overflow-hidden rounded-2xl border border-slate-800 bg-[#0b0f19]">
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            notifyChange(nodes, edges);
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes);
            notifyChange(nodes, edges);
          }}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={() => setSelectedNodeId(null)}
          nodeTypes={nodeTypes}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
          }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}
        >
          <Background color="#1e293b" gap={20} size={1.5} />
          <Controls position="bottom-left" showInteractive={!readOnly} />
          <MiniMap
            position="bottom-right"
            nodeColor="#334155"
            maskColor="rgba(15, 23, 42, 0.8)"
            className="!bg-slate-900 !border !border-slate-800 !rounded-xl overflow-hidden"
          />

          {/* Top Canvas Toolbar */}
          {!readOnly && (
            <Panel position="top-left" className="m-4 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
                <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase">Add:</span>
                <Button size="sm" variant="ghost" onClick={() => handleAddNode('start')} icon={Compass} title="Add Intro Node">
                  Start
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAddNode('learning')} icon={BookOpen} title="Add Learning Node">
                  Module
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAddNode('practice')} icon={Code2} title="Add Exercise Node">
                  Exercise
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAddNode('quiz')} icon={FileQuestion} title="Add Assessment Gate">
                  Quiz Gate
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAddNode('project')} icon={Milestone} title="Add Milestone Node">
                  Milestone
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAddNode('completion')} icon={Sparkles} title="Add Goal Node">
                  Goal
                </Button>
              </div>

              {/* Search Node form */}
              <form onSubmit={handleSearchFocus} className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1 backdrop-blur-md">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Find node..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-28"
                />
              </form>
            </Panel>
          )}


        </ReactFlow>
      </div>

      {/* Slide-over Node Configuration Panel */}
      {!readOnly && selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
          availableResources={availableResources}
          availableQuizzes={availableQuizzes}
        />
      )}
    </div>
  );
}
