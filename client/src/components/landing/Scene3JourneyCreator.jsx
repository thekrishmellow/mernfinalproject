import React, { useState } from 'react';
import {
  Compass,
  BookOpen,
  Code2,
  FileQuestion,
  Milestone,
  Plus,
  Layers,
  Sparkles,
  Paperclip,
  CheckSquare,
  Lock,
  FileText,
  Video,
  ExternalLink,
  Sliders,
  X
} from 'lucide-react';

export function Scene3JourneyCreator() {
  const [activeCanvasNode, setActiveCanvasNode] = useState('node_2');

  const paletteTools = [
    { type: 'start', label: 'Overview', icon: Compass, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { type: 'learning', label: 'Learning Module', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { type: 'practice', label: 'Exercise Lab', icon: Code2, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { type: 'quiz', label: 'Quiz Gate', icon: FileQuestion, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { type: 'project', label: 'Capstone', icon: Milestone, color: 'text-rose-400', bg: 'bg-rose-500/10' }
  ];

  const canvasNodes = [
    {
      id: 'node_1',
      title: '01. Architecture Overview',
      type: 'Overview',
      desc: 'System boundaries & core design philosophies',
      duration: '45 mins',
      color: 'border-blue-500/60 bg-blue-500/5',
      badgeColor: 'bg-blue-500/20 text-blue-300',
      icon: Compass,
      x: '10%',
      y: '30%',
      resources: ['System_Architecture_Primer.pdf', 'Setup_Guide.md'],
      tasks: ['Configure local development harness', 'Verify Docker services'],
      gating: 'No assessment gating required'
    },
    {
      id: 'node_2',
      title: '02. Async Event Streams',
      type: 'Learning Module',
      desc: 'Worker queues, decoupled pipelines & error handling',
      duration: '2 hours',
      color: 'border-purple-500/80 bg-purple-500/10 shadow-lg shadow-purple-500/10',
      badgeColor: 'bg-purple-500/20 text-purple-300',
      icon: BookOpen,
      x: '40%',
      y: '20%',
      resources: ['Event_Driven_Patterns.pdf', 'Worker_Pool_Architecture.pdf', 'Video: Resilient Queues'],
      tasks: ['Implement exponential backoff retry', 'Write dead-letter channel handler'],
      gating: 'Requires Node 01 completion'
    },
    {
      id: 'node_3',
      title: '03. Knowledge Assessment Gate',
      type: 'Quiz Gate',
      desc: 'Rigorous diagnostic on concurrency & streaming',
      duration: '25 mins',
      color: 'border-amber-500/60 bg-amber-500/5',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      icon: FileQuestion,
      x: '68%',
      y: '45%',
      resources: ['Gated Diagnostic Quiz: 12 Questions'],
      tasks: ['Attest code self-review checklist', 'Score >= 80% passing grade'],
      gating: 'Strict progression gate: blocks capstone unlock until passed'
    },
    {
      id: 'node_4',
      title: '04. Production Capstone',
      type: 'Capstone',
      desc: 'Deploy resilient high-throughput event worker',
      duration: '1 week',
      color: 'border-rose-500/60 bg-rose-500/5',
      badgeColor: 'bg-rose-500/20 text-rose-300',
      icon: Milestone,
      x: '92%',
      y: '30%',
      resources: ['Capstone_Specification.pdf', 'Starter_Repository_Link'],
      tasks: ['Deploy to staging environment', 'Submit load test benchmark report'],
      gating: 'Requires Node 03 passed assessment'
    }
  ];

  const selectedNodeData = canvasNodes.find((n) => n.id === activeCanvasNode) || canvasNodes[1];

  return (
    <section id="scene-creator" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden border-t border-slate-900 bg-slate-950">
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide uppercase">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Meet the Journey Creator: Instructor Studio</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Designed by your guide.{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
            Experienced by you.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          Teachers, instructors, and mentors turn their expertise into structured learning journeys. They decide the milestones, organize the resources, set expectations, and define what it means to be ready for the next stage.
        </p>
      </div>

      {/* Interactive Studio Preview Canvas */}
      <div className="max-w-6xl mx-auto mt-16 w-full relative z-10">
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Studio Top Toolbar */}
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 pl-2 border-l border-slate-800">
                Pathfinder Visual Canvas Studio &bull; Immutable Version Engine
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                ● Live Graph Connected
              </span>
              <span className="text-slate-400 hidden sm:inline">Click any node to inspect</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Left Palette */}
            <div className="lg:col-span-3 p-4 bg-slate-950/80 border-r border-slate-800 space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-2">
                Station Components
              </span>
              <div className="space-y-1.5">
                {paletteTools.map((tool, idx) => {
                  const ToolIcon = tool.icon;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300 hover:border-slate-700 transition-colors cursor-grab"
                    >
                      <div className={`p-1.5 rounded-lg ${tool.bg} ${tool.color}`}>
                        <ToolIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold">{tool.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
                  Canvas Statistics
                </span>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Active Milestones:</span>
                    <strong className="text-white">4 Stations</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Enforced Gates:</span>
                    <strong className="text-amber-400">1 Strict Quiz</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Curated Resources:</span>
                    <strong className="text-indigo-400">7 Protected Files</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Visual Graph Canvas */}
            <div className="lg:col-span-6 p-6 bg-[#0a0f1d] relative overflow-hidden flex flex-col justify-center">
              {/* Dot grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="text-center mb-4">
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    Interactive Roadmap Graph &mdash; Select a Station Below
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {canvasNodes.map((node) => {
                    const NodeIcon = node.icon;
                    const isSelected = activeCanvasNode === node.id;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setActiveCanvasNode(node.id)}
                        className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${node.color} ${
                          isSelected
                            ? 'ring-2 ring-indigo-400 scale-[1.03] bg-slate-800/90 shadow-xl'
                            : 'hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <NodeIcon className="w-4 h-4 text-slate-300" />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${node.badgeColor}`}>
                              {node.type}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{node.duration}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">{node.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{node.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Node Inspector Drawer */}
            <div className="lg:col-span-3 p-5 bg-slate-950/90 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-extrabold text-white">Module Inspector</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{selectedNodeData.id}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
                    {selectedNodeData.type}
                  </span>
                  <h4 className="text-sm font-bold text-white">{selectedNodeData.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedNodeData.desc}</p>
                </div>

                {/* Attached Resources */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    <span>Curated Resources ({selectedNodeData.resources.length})</span>
                  </label>
                  <div className="space-y-1">
                    {selectedNodeData.resources.map((res, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 truncate"
                      >
                        <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{res}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Tasks */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckSquare className="w-3 h-3 text-slate-400" />
                    <span>Requirements</span>
                  </label>
                  <div className="space-y-1">
                    {selectedNodeData.tasks.map((task, i) => (
                      <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gating Rule */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{selectedNodeData.gating}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
                Instructors define expectations. Learners experience a clear, guided journey.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
