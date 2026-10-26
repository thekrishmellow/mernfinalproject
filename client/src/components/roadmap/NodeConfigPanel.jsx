import React, { useState, useRef, useMemo } from 'react';
import { Button } from '../ui/Button.jsx';
import { AddYouTubeVideoModal } from '../resources/AddYouTubeVideoModal.jsx';
import { extractYouTubeId } from '../../utils/youtube.js';
import {
  X,
  Trash2,
  Plus,
  CheckSquare,
  FileQuestion,
  BookOpen,
  Sparkles,
  Clock,
  Layers,
  Upload,
  FileText,
  Loader2,
  Search,
  CheckCircle2,
  Paperclip,
  Video
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../ui/Toast.jsx';

export function NodeConfigPanel({
  node,
  onClose,
  onUpdate,
  onDelete,
  availableResources = [],
  availableQuizzes = [],
  onResourceCreated = null
}) {
  if (!node) return null;

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'tasks', 'quiz', 'resources'
  const [resourceSearch, setResourceSearch] = useState('');
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const data = node.data || {};

  const handleFieldChange = (field, value) => {
    onUpdate(node.id, {
      ...data,
      [field]: value
    });
  };

  const handleNestedChange = (parent, field, value) => {
    onUpdate(node.id, {
      ...data,
      [parent]: {
        ...(data[parent] || {}),
        [field]: value
      }
    });
  };

  // Tasks management
  const handleAddTask = () => {
    const currentTasks = data.tasks || [];
    const newTask = {
      id: `task_${Date.now()}`,
      text: 'New checklist item',
      isRequired: true
    };
    handleFieldChange('tasks', [...currentTasks, newTask]);
  };

  const handleUpdateTask = (taskId, text, isRequired) => {
    const updated = (data.tasks || []).map((t) =>
      t.id === taskId ? { ...t, text, isRequired } : t
    );
    handleFieldChange('tasks', updated);
  };

  const handleDeleteTask = (taskId) => {
    const updated = (data.tasks || []).filter((t) => t.id !== taskId);
    handleFieldChange('tasks', updated);
  };

  // Learning objectives
  const handleAddObjective = () => {
    const current = data.learningObjectives || [];
    handleFieldChange('learningObjectives', [...current, 'New objective']);
  };

  const handleUpdateObjective = (index, value) => {
    const current = [...(data.learningObjectives || [])];
    current[index] = value;
    handleFieldChange('learningObjectives', current);
  };

  const handleDeleteObjective = (index) => {
    const current = (data.learningObjectives || []).filter((_, i) => i !== index);
    handleFieldChange('learningObjectives', current);
  };

  // Instant Resource Upload handlers
  const handleUploadFile = async (file) => {
    if (!file) return;
    try {
      setIsUploadingResource(true);
      const formData = new FormData();
      formData.append('file', file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      formData.append('title', cleanTitle || file.name);
      formData.append('description', `Uploaded directly in node inspector (${file.name})`);
      formData.append('isProtected', 'true');

      const res = await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success && res.data?.resource) {
        const newResource = res.data.resource;
        toast.success(`Uploaded "${newResource.title}" and attached to node!`);

        if (onResourceCreated) {
          onResourceCreated(newResource);
        }

        const currentIds = (data.resourceIds || []).map((id) => id.toString());
        if (!currentIds.includes(newResource._id.toString())) {
          handleFieldChange('resourceIds', [...currentIds, newResource._id]);
        }
      }
    } catch (err) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setIsUploadingResource(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleYouTubeSuccess = (newResource) => {
    if (onResourceCreated) {
      onResourceCreated(newResource);
    }
    const currentIds = (data.resourceIds || []).map((id) => id.toString());
    if (!currentIds.includes(newResource._id.toString())) {
      handleFieldChange('resourceIds', [...currentIds, newResource._id]);
    }
    toast.success(`Video lesson "${newResource.title}" attached to this node!`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const filteredResources = useMemo(() => {
    if (!resourceSearch.trim()) return availableResources;
    const q = resourceSearch.toLowerCase();
    return availableResources.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q) ||
        r.originalFilename?.toLowerCase().includes(q)
    );
  }, [availableResources, resourceSearch]);

  return (
    <div className="w-96 bg-white border-l border-slate-200/90 flex flex-col h-full shadow-2xl z-20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Module Inspector</h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[10px] border border-purple-100 uppercase">
              {data.type || 'module'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{node.id}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(node.id)}
            icon={Trash2}
            title="Delete node"
            className="!px-2 !py-1 !rounded-xl"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation tabs in modern segmented pill style */}
      <div className="p-2 border-b border-slate-100 bg-slate-50/70">
        <div className="flex bg-slate-200/60 p-1 rounded-2xl text-xs font-bold">
          {[
            { id: 'general', label: 'General', icon: Layers },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'quiz', label: 'Quiz', icon: FileQuestion },
            { id: 'resources', label: 'Content', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab contents */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Module Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Station Type</label>
              <select
                value={data.type || 'learning'}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              >
                <option value="start">Introduction / Overview</option>
                <option value="learning">Learning Module</option>
                <option value="practice">Exercise / Hands-on</option>
                <option value="quiz">Assessment Gate</option>
                <option value="project">Project Milestone</option>
                <option value="completion">Goal Completion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={data.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="What will learners achieve in this node?"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={data.estimatedDuration || ''}
                onChange={(e) => handleFieldChange('estimatedDuration', e.target.value)}
                placeholder="e.g. 2 hours or 1 week"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            {/* Learning Objectives */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Learning Objectives</label>
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {(data.learningObjectives || []).map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteObjective(idx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Completion Congratulation Message</label>
              <input
                type="text"
                value={data.completionMessage || ''}
                onChange={(e) => handleFieldChange('completionMessage', e.target.value)}
                placeholder="Feedback shown when node completes"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Action items required for progression</span>
              <Button size="sm" variant="secondary" onClick={handleAddTask} icon={Plus} className="!text-xs !py-1 !px-2.5">
                Add Task
              </Button>
            </div>

            <div className="space-y-2.5">
              {(data.tasks || []).map((task) => (
                <div key={task.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) => handleUpdateTask(task.id, e.target.value, task.isRequired)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.isRequired}
                      onChange={(e) => handleUpdateTask(task.id, task.text, e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    Required for node completion
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.completionConditions?.requireAllTasks ?? true}
                  onChange={(e) => handleNestedChange('completionConditions', 'requireAllTasks', e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                Enforce: Must complete all required tasks
              </label>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attached Assessment Quiz</label>
              <select
                value={data.quizConfig?.quizId || ''}
                onChange={(e) => handleNestedChange('quizConfig', 'quizId', e.target.value || null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
              >
                <option value="">-- No Quiz Attached --</option>
                {availableQuizzes.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.title} ({q.questions?.length || 0} questions)
                  </option>
                ))}
              </select>
            </div>

            {data.quizConfig?.quizId && (
              <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-900 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.quizConfig?.isRequired || false}
                    onChange={(e) => {
                      handleNestedChange('quizConfig', 'isRequired', e.target.checked);
                      handleNestedChange('completionConditions', 'requireQuizPass', e.target.checked);
                    }}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  Gating Requirement: Learner must pass quiz to unlock subsequent nodes
                </label>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Passing Threshold (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={data.quizConfig?.passingPercentage || 80}
                    onChange={(e) => handleNestedChange('quizConfig', 'passingPercentage', parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Default standard passing score: 80%</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Questions Per Attempt</label>
                  <input
                    type="number"
                    min="1"
                    value={data.quizConfig?.questionsPerAttempt || 20}
                    onChange={(e) => handleNestedChange('quizConfig', 'questionsPerAttempt', parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Milestone Quiz Timer */}
                <div className="pt-2 border-t border-amber-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Milestone Countdown Timer
                    </label>
                    <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {(data.quizConfig?.timeLimitMinutes || 0) > 0
                        ? `${data.quizConfig.timeLimitMinutes} mins`
                        : 'Inherit / Untimed'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    {[
                      { label: 'Inherit/0', value: 0 },
                      { label: '5m', value: 5 },
                      { label: '10m', value: 10 },
                      { label: '15m', value: 15 },
                      { label: '20m', value: 20 },
                      { label: '30m', value: 30 },
                      { label: '45m', value: 45 },
                      { label: '60m', value: 60 }
                    ].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handleNestedChange('quizConfig', 'timeLimitMinutes', p.value)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          (data.quizConfig?.timeLimitMinutes || 0) === p.value
                            ? 'bg-amber-500 text-white shadow-xs scale-105'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={data.quizConfig?.timeLimitMinutes ?? 0}
                      onChange={(e) =>
                        handleNestedChange(
                          'quizConfig',
                          'timeLimitMinutes',
                          Math.max(0, parseInt(e.target.value, 10) || 0)
                        )
                      }
                      className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                    <span className="text-[11px] text-slate-500">minutes (0 = untimed or inherit)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4">
            {/* Quick Upload Dropzone & Add YouTube Video Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Add Study Materials</span>
                <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Instant Auto-Attach
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Upload File Box */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !isUploadingResource && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                    dragActive
                      ? 'border-purple-500 bg-purple-50 scale-[0.99]'
                      : 'border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50/70'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadFile(e.target.files[0]);
                      }
                    }}
                  />

                  {isUploadingResource ? (
                    <div className="flex flex-col items-center justify-center py-1 space-y-1">
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                      <span className="text-[11px] font-bold text-purple-700">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-1.5 shadow-xs">
                        <Upload className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Upload File</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PDF or Markdown</p>
                    </div>
                  )}
                </div>

                {/* Add YouTube Video Box */}
                <div
                  onClick={() => setIsYouTubeModalOpen(true)}
                  className="border-2 border-dashed border-red-200 hover:border-red-400 bg-red-50/40 hover:bg-red-50/70 rounded-2xl p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                    <Video className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">YouTube Video</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">BYJU'S In-App Lesson</p>
                </div>
              </div>
            </div>

            {/* Library Search & Filter */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Attached Study Materials</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {(data.resourceIds || []).length} / {availableResources.length}
                  </span>
                </label>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Filter resources by title or filename..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Available Resources List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
              {filteredResources.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400">
                  <FileText className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                  <p className="text-xs font-medium">No resources found</p>
                  <p className="text-[10px] mt-0.5">Upload a file or add a YouTube video above.</p>
                </div>
              ) : (
                filteredResources.map((res) => {
                  const currentIds = (data.resourceIds || []).map((id) => id.toString());
                  const isSelected = currentIds.includes(res._id.toString());
                  const isVideo = res.type === 'video' || Boolean(extractYouTubeId(res.externalUrl));

                  return (
                    <label
                      key={res._id}
                      className={`flex items-start gap-2.5 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-300 text-purple-900 shadow-xs'
                          : 'bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newIds = e.target.checked
                            ? [...currentIds, res._id]
                            : currentIds.filter((id) => id !== res._id.toString());
                          handleFieldChange('resourceIds', newIds);
                        }}
                        className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 truncate flex items-center justify-between gap-1">
                          <span className="truncate flex items-center gap-1.5">
                            {isVideo && <Video className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                            {res.title}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full shrink-0">
                              Attached
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5 flex items-center gap-1.5">
                          {isVideo ? (
                            <span className="text-red-500 font-bold">Video Lesson</span>
                          ) : (
                            <span>{res.type || 'file'}</span>
                          )}
                          <span>&bull;</span>
                          <span>{res.estimatedMinutes || 10}m</span>
                          {res.originalFilename && (
                            <>
                              <span>&bull;</span>
                              <span className="truncate max-w-[110px]">{res.originalFilename}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.completionConditions?.requireAllResources || false}
                  onChange={(e) => handleNestedChange('completionConditions', 'requireAllResources', e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                Require client to attest all resources completed
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Add YouTube Video Modal */}
      <AddYouTubeVideoModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
        onSuccess={handleYouTubeSuccess}
      />
    </div>
  );
}
