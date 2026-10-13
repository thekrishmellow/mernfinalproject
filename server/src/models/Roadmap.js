import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    visibility: {
      type: String,
      enum: ['private', 'shared'],
      default: 'private',
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      index: true
    },
    estimatedDuration: {
      type: String,
      default: '4 weeks',
      trim: true
    },
    accentColor: {
      type: String,
      default: '#3b82f6'
    },
    currentPublishedVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoadmapVersion',
      default: null
    },
    // Working draft canvas state:
    draftNodes: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    draftEdges: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  {
    timestamps: true
  }
);

roadmapSchema.index({ owner: 1, status: 1 });
roadmapSchema.index({ visibility: 1, status: 1 });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
