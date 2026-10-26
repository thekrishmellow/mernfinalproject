import { Quiz } from '../models/Quiz.js';
import { DocumentExtractionService } from '../services/extraction/documentExtractionService.js';

export async function createQuiz(req, res, next) {
  try {
    const {
      title,
      description,
      questions,
      passingPercentage,
      defaultQuestionsPerAttempt,
      maxAttempts,
      randomizeQuestions,
      randomizeOptions,
      showExplanationsAfterSubmission,
      allowRetake,
      timeLimitMinutes
    } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      owner: req.user._id,
      questions: questions || [],
      passingPercentage: passingPercentage || 80,
      defaultQuestionsPerAttempt: defaultQuestionsPerAttempt || 20,
      maxAttempts: maxAttempts || 0,
      timeLimitMinutes: timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : 0,
      randomizeQuestions: randomizeQuestions !== undefined ? randomizeQuestions : true,
      randomizeOptions: randomizeOptions !== undefined ? randomizeOptions : true,
      showExplanationsAfterSubmission: showExplanationsAfterSubmission !== undefined ? showExplanationsAfterSubmission : true,
      allowRetake: allowRetake !== undefined ? allowRetake : true
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuizzes(req, res, next) {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    // Strict isolation: only show quizzes created by this admin
    const query = {
      owner: req.user._id
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    return res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuizById(req, res, next) {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate('owner', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (req.user.role === 'admin' && !quiz.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this quiz.'
      });
    }

    return res.json({
      success: true,
      data: { quiz }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuiz(req, res, next) {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (!quiz.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this quiz.'
      });
    }

    const fields = [
      'title',
      'description',
      'questions',
      'passingPercentage',
      'defaultQuestionsPerAttempt',
      'maxAttempts',
      'randomizeQuestions',
      'randomizeOptions',
      'showExplanationsAfterSubmission',
      'allowRetake',
      'timeLimitMinutes',
      'status'
    ];

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        quiz[f] = req.body[f];
      }
    }

    await quiz.save();

    return res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuiz(req, res, next) {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (!quiz.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this quiz.'
      });
    }

    await Quiz.findByIdAndDelete(quizId);

    return res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}


/**
 * Validates and imports structured question bank from JSON or CSV rows
 */
export async function importQuestions(req, res, next) {
  try {
    const { questions, quizId } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Import payload must include an array of questions.'
      });
    }

    const validated = [];
    const validationErrors = [];

    questions.forEach((q, index) => {
      const rowNum = index + 1;
      if (!q.prompt || !q.prompt.trim()) {
        validationErrors.push(`Row ${rowNum}: Missing question prompt.`);
        return;
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        validationErrors.push(`Row ${rowNum}: At least 2 options required.`);
        return;
      }

      if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
        validationErrors.push(`Row ${rowNum}: Correct answer is required.`);
        return;
      }

      const optIds = new Set(q.options.map((o) => o.id));
      const hasInvalidAnswer = q.correctAnswers.some((ans) => !optIds.has(ans));
      if (hasInvalidAnswer) {
        validationErrors.push(`Row ${rowNum}: Correct answer ID must match one of the option IDs (${[...optIds].join(', ')}).`);
        return;
      }

      validated.push({
        id: q.id || `q_${Date.now()}_${index}`,
        prompt: q.prompt.trim(),
        type: q.type || 'single_choice',
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        tags: q.tags || [],
        points: q.points || 1
      });
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Validation failed for ${validationErrors.length} question(s).`,
        errors: validationErrors,
        validCount: validated.length
      });
    }

    if (quizId) {
      const quiz = await Quiz.findById(quizId);
      if (quiz) {
        quiz.questions.push(...validated);
        await quiz.save();
        return res.json({
          success: true,
          message: `Successfully imported ${validated.length} questions into quiz "${quiz.title}".`,
          data: { quiz }
        });
      }
    }

    return res.json({
      success: true,
      message: `Successfully validated ${validated.length} questions.`,
      data: { questions: validated }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Parses uploaded document (PDF, TXT, MD) and returns reviewable draft questions
 */
export async function extractFromDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'A file is required for extraction.'
      });
    }

    let rawText;
    try {
      rawText = await DocumentExtractionService.extractTextFromBuffer(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
    } catch (extractionErr) {
      return res.status(422).json({
        success: false,
        message: `Could not extract text from "${req.file.originalname}": ${extractionErr.message}. Try uploading a text-based PDF, Markdown (.md), or plain text (.txt) file instead.`
      });
    }

    const extractedQuestions = DocumentExtractionService.parseQuestionsFromText(rawText);

    return res.json({
      success: true,
      message: `Extracted ${extractedQuestions.length} candidate questions from ${req.file.originalname}. Please review before publishing.`,
      data: {
        extractedQuestions,
        rawTextLength: rawText.length,
        filename: req.file.originalname
      }
    });
  } catch (error) {
    next(error);
  }
}
