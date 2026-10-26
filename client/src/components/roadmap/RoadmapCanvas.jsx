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
  Maximize2,
  Layers,
  ChevronRight,
  GripVertical
} from 'lucide-react';

const nodeTypes = {
  customNode: CustomRoadmapNode
};

const PALETTE_TEMPLATES = [
  {
    type: 'start',
    label: 'Overview',
    description: 'Introduction & prerequisites',
    icon: Compass,
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50/70',
    text: 'text-blue-700'
  },
  {
    type: 'learning',
    label: 'Learning Module',
    description: 'Core concepts & theory',
    icon: BookOpen,
    color: 'from-purple-600 to-indigo-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50/70',
    text: 'text-purple-700'
  },
  {
    type: 'practice',
    label: 'Exercise',
    description: 'Hands-on practice & labs',
    icon: Code2,
    color: 'from-teal-500 to-emerald-600',
    border: 'border-teal-200',
    bg: 'bg-teal-50/70',
    text: 'text-teal-700'
  },
  {
    type: 'quiz',
    label: 'Quiz Gate',
    description: 'Gated assessment check',
    icon: FileQuestion,
    color: 'from-amber-500 to-orange-500',
    border: 'border-amber-200',
    bg: 'bg-amber-50/70',
    text: 'text-amber-800'
  },
  {
    type: 'project',
    label: 'Milestone',
    description: 'Capstone or project build',
    icon: Milestone,
    color: 'from-rose-500 to-pink-600',
    border: 'border-rose-200',
    bg: 'bg-rose-50/70',
    text: 'text-rose-700'
  },
  {
    type: 'completion',
    label: 'Final Goal',
    description: 'Curriculum completion flag',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-700'
  }
];

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
  onNodeClick = null,
  onResourceCreated = null
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
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#7c3aed', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' }
    }))
  );

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const reactFlowInstance = useRef(null);
  const reactFlowWrapper = useRef(null);

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
            style: { stroke: '#7c3aed', strokeWidth: 2.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' }
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

  // Create node helper
  const createNewNodeData = (type, position) => {
    const id = `node_${Date.now()}`;
    const titles = {
      start: 'Prerequisites & Overview',
      learning: 'Core Learning Module',
      practice: 'Hands-on Exercise',
      quiz: 'Knowledge Check Gate',
      project: 'Milestone Implementation',
      completion: 'Final Certification'
    };

    return {
      id,
      type: 'customNode',
      position: position || {
        x: 250 + Math.random() * 80,
        y: 100 + nodes.length * 140
      },
      data: {
        id,
        title: titles[type] || 'New Learning Node',
        description: 'Configure syllabus objectives and resources',
        type,
        estimatedDuration: '1 week',
        tasks: [{ id: `task_${Date.now()}`, text: 'Read introductory reference guides', isRequired: true }],
        completionConditions: {
          requireAllTasks: true,
          requireAllResources: false,
          requireQuizPass: type === 'quiz'
        }
      }
    };
  };

  // Add node from palette (click)
  const handleAddNode = (type = 'learning') => {
    if (readOnly) return;
    let spawnPosition;

    if (reactFlowInstance.current) {
      // Calculate viewport center
      const zoom = reactFlowInstance.current.getZoom ? reactFlowInstance.current.getZoom() : 1;
      const { x = 0, y = 0 } = reactFlowInstance.current.getViewport ? reactFlowInstance.current.getViewport() : {};
      spawnPosition = {
        x: (-x + 350) / zoom + (Math.random() * 50 - 25),
        y: (-y + 200) / zoom + (Math.random() * 50 - 25)
      };
    }

    const newNode = createNewNodeData(type, spawnPosition);

    setNodes((nds) => {
      const updated = [...nds, newNode];
      notifyChange(updated, edges);
      return updated;
    });
    setSelectedNodeId(newNode.id);
  };

  // Drag-and-drop support from Palette
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (readOnly || !reactFlowInstance.current) return;

      const type = event.dataTransfer.getData('application/reactflow-type');
      if (!type) return;

      let position;
      if (reactFlowInstance.current.screenToFlowPosition) {
        position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
      } else if (reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        position = reactFlowInstance.current.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top
        });
      }

      const newNode = createNewNodeData(type, position);
      setNodes((nds) => {
        const updated = [...nds, newNode];
        notifyChange(updated, edges);
        return updated;
      });
      setSelectedNodeId(newNode.id);
    },
    [readOnly, nodes, edges, notifyChange, setNodes]
  );

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
      reactFlowInstance.current.setCenter(target.position.x + 130, target.position.y + 70, {
        zoom: 1.2,
        duration: 800
      });
      setSelectedNodeId(target.id);
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance.current?.fitView) {
      reactFlowInstance.current.fitView({ padding: 0.25, duration: 600 });
    }
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="relative w-full h-full flex overflow-hidden rounded-3xl border border-slate-200/80 bg-[#F5F7FB] shadow-xs"
    >
      <div className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
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
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={2}
          deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}
        >
          {/* Subtle light dot grid */}
          <Background color="#cbd5e1" gap={24} size={1.2} />

          {/* Clean Controls and MiniMap */}
          <Controls
            position="bottom-left"
            showInteractive={!readOnly}
            className="!bg-white !border !border-slate-200 !rounded-2xl !shadow-lg !overflow-hidden !m-4"
          />

          <MiniMap
            position="bottom-right"
            nodeColor="#818cf8"
            maskColor="rgba(241, 245, 249, 0.75)"
            className="!bg-white !border !border-slate-200 !rounded-2xl !shadow-lg !overflow-hidden !m-4"
          />

          {/* Interactive Node Palette Panel (Top-Left Dock) */}
          {!readOnly && (
            <Panel position="top-left" className="m-4">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xl shadow-purple-900/5 p-3.5 space-y-3 max-w-xs transition-all">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
                      <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                      Component Library
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 px-2 py-0.5 rounded-full hover:bg-purple-50 transition-colors"
                  >
                    {isPaletteOpen ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {isPaletteOpen && (
                  <>
                    <p className="text-[11px] text-slate-400 px-1 font-medium">
                      Drag onto canvas or click to add a curriculum station:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {PALETTE_TEMPLATES.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.type}
                            draggable
                            onDragStart={(e) => onDragStart(e, item.type)}
                            onClick={() => handleAddNode(item.type)}
                            className={`group p-2.5 rounded-2xl border transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-1.5 ${item.border} ${item.bg}`}
                            title={`Drag or click to add ${item.label}`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                              >
                                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                              <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                            </div>
                            <div>
                              <div className={`text-[11px] font-extrabold ${item.text} leading-tight`}>
                                {item.label}
                              </div>
                              <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Search & Fit View Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <form onSubmit={handleSearchFocus} className="flex-1 flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5">
                        <Search className="w-3 h-3 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Find module..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent border-none text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none w-full font-medium"
                        />
                      </form>
                      <button
                        type="button"
                        onClick={handleFitView}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-colors shrink-0"
                        title="Fit all nodes to view"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Slide-over Node Configuration Panel (Right Inspector) */}
      {!readOnly && selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
          availableResources={availableResources}
          availableQuizzes={availableQuizzes}
          onResourceCreated={onResourceCreated}
        />
      )}
    </div>
  );
}
