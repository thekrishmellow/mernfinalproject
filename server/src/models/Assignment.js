import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    targetEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
      index: true
    },
    publishedVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoadmapVersion',
      required: true,
      index: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived', 'revoked'],
      default: 'active',
      index: true
    },
    invitation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      default: null
    },
    progressPercentage: {
      type: Number,
      default: 0
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

assignmentSchema.index({ client: 1, roadmap: 1 });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
