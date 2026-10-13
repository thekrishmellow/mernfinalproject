import { z } from 'zod';

const questionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(3, 'Prompt must be at least 3 characters'),
  type: z.enum(['single_choice', 'true_false', 'multiple_choice']).default('single_choice'),
  options: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(1, 'Option text is required')
    })
  ).min(2, 'At least 2 options are required'),
  correctAnswers: z.array(z.string()).min(1, 'At least one correct answer is required'),
  explanation: z.string().optional().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  tags: z.array(z.string()).optional().default([]),
  points: z.number().min(1).default(1)
});

export const createQuizSchema = {
  body: z.object({
    title: z.string().min(2, 'Title is required').max(150),
    description: z.string().optional().default(''),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
    passingPercentage: z.number().min(1).max(100).default(80),
    defaultQuestionsPerAttempt: z.number().min(1).default(20),
    maxAttempts: z.number().min(0).default(0),
    randomizeQuestions: z.boolean().default(true),
    randomizeOptions: z.boolean().default(true),
    showExplanationsAfterSubmission: z.boolean().default(true),
    allowRetake: z.boolean().default(true)
  })
};

export const submitQuizAttemptSchema = {
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z.string(),
        selectedOptions: z.array(z.string())
      })
    )
  })
};
