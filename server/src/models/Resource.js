import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    type: {
      type: String,
      enum: ['markdown', 'pdf', 'text', 'link', 'video', 'book', 'exercise', 'file'],
      required: true,
      index: true
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // In-app text or Markdown content:
    content: {
      type: String,
      default: ''
    },
    // External URL for video/link/book:
    externalUrl: {
      type: String,
      default: ''
    },
    // Uploaded file storage details:
    storageKey: {
      type: String,
      default: ''
    },
    originalFilename: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      default: ''
    },
    sizeBytes: {
      type: Number,
      default: 0
    },
    isProtected: {
      type: Boolean,
      default: true
    },
    estimatedMinutes: {
      type: Number,
      default: 10
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ type: 1, uploader: 1 });

export const Resource = mongoose.model('Resource', resourceSchema);
