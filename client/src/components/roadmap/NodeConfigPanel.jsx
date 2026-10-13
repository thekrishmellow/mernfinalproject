import React, { useState } from 'react';
import { Button } from '../ui/Button.jsx';
import {
  X,
  Trash2,
  Plus,
  CheckSquare,
  FileQuestion,
  BookOpen,
  Sparkles,
  Clock,
  Layers
} from 'lucide-react';

export function NodeConfigPanel({ node, onClose, onUpdate, onDelete, availableResources = [], availableQuizzes = [] }) {
  if (!node) return null;

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'tasks', 'quiz', 'resources'

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

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-semibold text-white">Node Settings</h3>
          <p className="text-xs text-slate-400 font-mono">ID: {node.id}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="danger" size="sm" onClick={() => onDelete(node.id)} icon={Trash2} title="Delete node" />
          <Button variant="ghost" size="sm" onClick={onClose} icon={X} />
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
        {[
          { id: 'general', label: 'General', icon: Layers },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'quiz', label: 'Quiz', icon: FileQuestion },
          { id: 'resources', label: 'Content', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Node Type</label>
              <select
                value={data.type || 'learning'}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="start">Introduction / Start</option>
                <option value="learning">Learning Module</option>
                <option value="practice">Exercise / Practice</option>
                <option value="quiz">Assessment Gate</option>
                <option value="project">Project Milestone</option>
                <option value="completion">Goal Completion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={data.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="What will learners achieve in this node?"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={data.estimatedDuration || ''}
                onChange={(e) => handleFieldChange('estimatedDuration', e.target.value)}
                placeholder="e.g. 2 hours or 1 week"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Learning Objectives */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300">Learning Objectives</label>
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
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
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteObjective(idx)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Message */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Completion Message</label>
              <input
                type="text"
                value={data.completionMessage || ''}
                onChange={(e) => handleFieldChange('completionMessage', e.target.value)}
                placeholder="Feedback shown when node completes"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Action items required for progression</span>
              <Button size="sm" variant="secondary" onClick={handleAddTask} icon={Plus}>
                Add Task
              </Button>
            </div>

            <div className="space-y-2.5">
              {(data.tasks || []).map((task) => (
                <div key={task.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) => handleUpdateTask(task.id, e.target.value, task.isRequired)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.isRequired}
                      onChange={(e) => handleUpdateTask(task.id, task.text, e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    Required for node completion
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-200 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.completionConditions?.requireAllTasks ?? true}
                  onChange={(e) => handleNestedChange('completionConditions', 'requireAllTasks', e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                Enforce: Must complete all required tasks
              </label>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Attached Assessment Quiz</label>
              <select
                value={data.quizConfig?.quizId || ''}
                onChange={(e) => handleNestedChange('quizConfig', 'quizId', e.target.value || null)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
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
              <div className="space-y-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <label className="flex items-center gap-2 text-xs text-slate-200 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.quizConfig?.isRequired || false}
                    onChange={(e) => {
                      handleNestedChange('quizConfig', 'isRequired', e.target.checked);
                      handleNestedChange('completionConditions', 'requireQuizPass', e.target.checked);
                    }}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  Gating Requirement: Learner must pass quiz to unlock subsequent nodes
                </label>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Passing Threshold (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={data.quizConfig?.passingPercentage || 80}
                    onChange={(e) => handleNestedChange('quizConfig', 'passingPercentage', parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Standard default: 80% passing threshold</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Questions Per Attempt</label>
                  <input
                    type="number"
                    min="1"
                    value={data.quizConfig?.questionsPerAttempt || 20}
                    onChange={(e) => handleNestedChange('quizConfig', 'questionsPerAttempt', parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Attached Learning Materials</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableResources.map((res) => {
                const currentIds = (data.resourceIds || []).map((id) => id.toString());
                const isSelected = currentIds.includes(res._id.toString());

                return (
                  <label
                    key={res._id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
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
                      className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200">{res.title}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{res.type} &bull; {res.estimatedMinutes}m</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-200 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.completionConditions?.requireAllResources || false}
                  onChange={(e) => handleNestedChange('completionConditions', 'requireAllResources', e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                Require client to attest all resources completed
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
