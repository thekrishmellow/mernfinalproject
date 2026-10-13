import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true
    },
    nodeId: {
      type: String,
      required: true
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    attemptNumber: {
      type: Number,
      required: true
    },
    // The specific subset of questions assigned for this attempt (stored without answer keys)
    questionSnapshots: [
      {
        id: { type: String, required: true },
        prompt: { type: String, required: true },
        type: { type: String, default: 'single_choice' },
        options: [
          {
            id: { type: String, required: true },
            text: { type: String, required: true }
          }
        ],
        points: { type: Number, default: 1 }
      }
    ],
    submittedAnswers: [
      {
        questionId: { type: String, required: true },
        selectedOptions: { type: [String], default: [] }
      }
    ],
    score: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    passingPercentage: {
      type: Number,
      default: 80
    },
    // Detailed feedback stored only after submission & grading:
    gradedDetails: [
      {
        questionId: String,
        isCorrect: Boolean,
        userAnswers: [String],
        correctAnswers: [String],
        explanation: String
      }
    ],
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

quizAttemptSchema.index({ assignment: 1, nodeId: 1, attemptNumber: 1 });

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
