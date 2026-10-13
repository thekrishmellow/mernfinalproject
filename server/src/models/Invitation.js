import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    targetEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true
    },
    publishedVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoadmapVersion',
      required: true
    },
    invitingAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    acceptedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Invitation = mongoose.model('Invitation', invitationSchema);
