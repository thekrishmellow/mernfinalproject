/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Prepares a learner-safe question set for a quiz attempt.
 * Strips correctAnswers and explanations.
 */
export function prepareLearnerQuestions(quiz, requestedCount = 20) {
  let questions = [...(quiz.questions || [])];

  if (quiz.randomizeQuestions) {
    questions = shuffleArray(questions);
  }

  const selected = questions.slice(0, requestedCount);

  const learnerQuestions = selected.map((q) => {
    let options = [...(q.options || [])];
    if (quiz.randomizeOptions) {
      options = shuffleArray(options);
    }

    return {
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      options: options.map((opt) => ({
        id: opt.id,
        text: opt.text
      })),
      points: q.points || 1
    };
  });

  return learnerQuestions;
}

/**
 * Evaluates and grades submitted answers against the authoritative quiz question bank.
 */
export function gradeQuizAttempt(quiz, submittedAnswers = [], selectedQuestionIds = []) {
  const questionMap = new Map();
  for (const q of quiz.questions || []) {
    questionMap.set(q.id, q);
  }

  const answerMap = new Map();
  for (const a of submittedAnswers) {
    answerMap.set(a.questionId, a.selectedOptions || []);
  }

  let totalScore = 0;
  let maxScore = 0;
  const gradedDetails = [];

  for (const qId of selectedQuestionIds) {
    const question = questionMap.get(qId);
    if (!question) continue;

    const points = question.points || 1;
    maxScore += points;

    const userSelected = (answerMap.get(qId) || []).map((s) => s.trim().toLowerCase());
    const correctAnswers = (question.correctAnswers || []).map((s) => s.trim().toLowerCase());

    let isCorrect = false;

    if (question.type === 'multiple_choice') {
      // Must have selected all correct answers and no incorrect ones
      const userSet = new Set(userSelected);
      const correctSet = new Set(correctAnswers);
      if (userSet.size === correctSet.size && [...userSet].every((val) => correctSet.has(val))) {
        isCorrect = true;
      }
    } else {
      // Single choice or True/False
      if (userSelected.length > 0 && correctAnswers.includes(userSelected[0])) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      totalScore += points;
    }

    gradedDetails.push({
      questionId: question.id,
      prompt: question.prompt,
      isCorrect,
      userAnswers: answerMap.get(qId) || [],
      correctAnswers: quiz.showExplanationsAfterSubmission ? question.correctAnswers : [],
      explanation: quiz.showExplanationsAfterSubmission ? question.explanation : ''
    });
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percentage >= (quiz.passingPercentage || 80);

  return {
    score: totalScore,
    maxScore,
    percentage,
    passed,
    passingPercentage: quiz.passingPercentage || 80,
    gradedDetails
  };
}
