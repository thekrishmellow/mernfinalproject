import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['single_choice', 'true_false', 'multiple_choice'],
      default: 'single_choice'
    },
    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true }
      }
    ],
    // Correct answers must NEVER be returned to client in student quiz fetch!
    correctAnswers: {
      type: [String],
      required: true
    },
    explanation: {
      type: String,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    tags: {
      type: [String],
      default: []
    },
    points: {
      type: Number,
      default: 1
    }
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
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
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    questions: {
      type: [questionSchema],
      default: []
    },
    passingPercentage: {
      type: Number,
      default: 80,
      min: 1,
      max: 100
    },
    defaultQuestionsPerAttempt: {
      type: Number,
      default: 20,
      min: 1
    },
    maxAttempts: {
      type: Number,
      default: 0 // 0 = unlimited
    },
    randomizeQuestions: {
      type: Boolean,
      default: true
    },
    randomizeOptions: {
      type: Boolean,
      default: true
    },
    showExplanationsAfterSubmission: {
      type: Boolean,
      default: true
    },
    allowRetake: {
      type: Boolean,
      default: true
    },
    timeLimitMinutes: {
      type: Number,
      default: 0, // 0 = untimed
      min: 0
    }
  },
  {
    timestamps: true
  }
);

quizSchema.virtual('questionCount').get(function () {
  return this.questions ? this.questions.length : 0;
});

export const Quiz = mongoose.model('Quiz', quizSchema);
