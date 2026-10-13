import mongoose from 'mongoose';

const roadmapVersionSchema = new mongoose.Schema(
  {
    parentRoadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true
    },
    nodes: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, default: '' },
          type: {
            type: String,
            enum: ['start', 'learning', 'practice', 'quiz', 'project', 'completion'],
            default: 'learning'
          },
          position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 }
          },
          learningObjectives: { type: [String], default: [] },
          estimatedDuration: { type: String, default: '' },
          resourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
          tasks: [
            {
              id: { type: String, required: true },
              text: { type: String, required: true },
              isRequired: { type: Boolean, default: true }
            }
          ],
          quizConfig: {
            quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
            isRequired: { type: Boolean, default: false },
            passingPercentage: { type: Number, default: 80 },
            questionsPerAttempt: { type: Number, default: 20 },
            maxAttempts: { type: Number, default: 0 }
          },
          completionConditions: {
            requireAllResources: { type: Boolean, default: false },
            requireAllTasks: { type: Boolean, default: true },
            requireQuizPass: { type: Boolean, default: false }
          },
          completionMessage: { type: String, default: '' }
        }
      ],
      default: []
    },
    edges: {
      type: [
        {
          id: { type: String, required: true },
          source: { type: String, required: true },
          target: { type: String, required: true },
          type: { type: String, default: 'smoothstep' },
          animated: { type: Boolean, default: false }
        }
      ],
      default: []
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    publicationNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

roadmapVersionSchema.index({ parentRoadmap: 1, versionNumber: 1 }, { unique: true });

export const RoadmapVersion = mongoose.model('RoadmapVersion', roadmapVersionSchema);
