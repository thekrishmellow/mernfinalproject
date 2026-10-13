import mongoose from 'mongoose';

const nodeProgressSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true
    },
    nodeId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['locked', 'available', 'in_progress', 'completed', 'failed'],
      default: 'locked',
      index: true
    },
    completedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
      }
    ],
    completedTasks: {
      type: [String],
      default: []
    },
    latestQuizAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizAttempt',
      default: null
    },
    passedQuiz: {
      type: Boolean,
      default: false
    },
    lockReasons: {
      type: [String],
      default: []
    },
    completedAt: {
      type: Date,
      default: null
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// One authoritative progress record per roadmap node per assignment
nodeProgressSchema.index({ assignment: 1, nodeId: 1 }, { unique: true });

export const NodeProgress = mongoose.model('NodeProgress', nodeProgressSchema);
