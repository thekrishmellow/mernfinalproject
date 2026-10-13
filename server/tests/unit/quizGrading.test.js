import { describe, it, expect } from 'vitest';
import { gradeQuizAttempt, prepareLearnerQuestions } from '../../src/services/quizzes/quizGradingService.js';

describe('Quiz Grading Service', () => {
  const sampleQuiz = {
    passingPercentage: 80,
    randomizeQuestions: false,
    randomizeOptions: false,
    showExplanationsAfterSubmission: true,
    questions: [
      {
        id: 'q1',
        prompt: 'Question 1',
        type: 'single_choice',
        options: [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }],
        correctAnswers: ['A'],
        explanation: 'Exp 1',
        points: 1
      },
      {
        id: 'q2',
        prompt: 'Question 2',
        type: 'true_false',
        options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }],
        correctAnswers: ['true'],
        explanation: 'Exp 2',
        points: 1
      },
      {
        id: 'q3',
        prompt: 'Question 3',
        type: 'single_choice',
        options: [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }],
        correctAnswers: ['B'],
        explanation: 'Exp 3',
        points: 1
      },
      {
        id: 'q4',
        prompt: 'Question 4',
        type: 'single_choice',
        options: [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }],
        correctAnswers: ['A'],
        explanation: 'Exp 4',
        points: 1
      },
      {
        id: 'q5',
        prompt: 'Question 5',
        type: 'single_choice',
        options: [{ id: 'A', text: 'Opt A' }, { id: 'B', text: 'Opt B' }],
        correctAnswers: ['B'],
        explanation: 'Exp 5',
        points: 1
      }
    ]
  };

  it('scrubs answer keys and explanations in learner questions', () => {
    const learnerQs = prepareLearnerQuestions(sampleQuiz, 5);
    expect(learnerQs).toHaveLength(5);
    for (const q of learnerQs) {
      expect(q).not.toHaveProperty('correctAnswers');
      expect(q).not.toHaveProperty('explanation');
      expect(q).toHaveProperty('prompt');
      expect(q).toHaveProperty('options');
    }
  });

  it('grades passing attempt accurately (4/5 = 80% passes threshold 80%)', () => {
    const submittedAnswers = [
      { questionId: 'q1', selectedOptions: ['A'] }, // Correct
      { questionId: 'q2', selectedOptions: ['true'] }, // Correct
      { questionId: 'q3', selectedOptions: ['B'] }, // Correct
      { questionId: 'q4', selectedOptions: ['A'] }, // Correct
      { questionId: 'q5', selectedOptions: ['A'] } // Incorrect
    ];

    const result = gradeQuizAttempt(sampleQuiz, submittedAnswers, ['q1', 'q2', 'q3', 'q4', 'q5']);
    expect(result.score).toBe(4);
    expect(result.maxScore).toBe(5);
    expect(result.percentage).toBe(80);
    expect(result.passed).toBe(true);
  });

  it('fails attempt below threshold (3/5 = 60% < 80%)', () => {
    const submittedAnswers = [
      { questionId: 'q1', selectedOptions: ['A'] }, // Correct
      { questionId: 'q2', selectedOptions: ['false'] }, // Incorrect
      { questionId: 'q3', selectedOptions: ['B'] }, // Correct
      { questionId: 'q4', selectedOptions: ['A'] }, // Correct
      { questionId: 'q5', selectedOptions: ['A'] } // Incorrect
    ];

    const result = gradeQuizAttempt(sampleQuiz, submittedAnswers, ['q1', 'q2', 'q3', 'q4', 'q5']);
    expect(result.score).toBe(3);
    expect(result.percentage).toBe(60);
    expect(result.passed).toBe(false);
  });
});
