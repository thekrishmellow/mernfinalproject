import { Assignment } from '../models/Assignment.js';
import { NodeProgress } from '../models/NodeProgress.js';
import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Resource } from '../models/Resource.js';
import {
  verifyNodeAccess,
  evaluateAndCompleteNode,
  recalculateDownstreamEligibility,
  updateAssignmentOverallProgress
} from '../services/progression/progressionService.js';
import { prepareLearnerQuestions, gradeQuizAttempt } from '../services/quizzes/quizGradingService.js';

export async function getClientDashboard(req, res, next) {
  try {
    const assignments = await Assignment.find({
      client: req.user._id,
      status: { $in: ['active', 'completed'] }
    })
      .populate('roadmap', 'title description category estimatedDuration accentColor')
      .populate('publishedVersion', 'versionNumber')
      .sort({ updatedAt: -1 });

    const assignmentIds = assignments.map((a) => a._id);

    // Calculate node status breakdown across all assignments
    const progressStats = await NodeProgress.aggregate([
      { $match: { assignment: { $in: assignmentIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statsMap = {
      completed: 0,
      in_progress: 0,
      available: 0,
      locked: 0
    };
    for (const stat of progressStats) {
      if (statsMap[stat._id] !== undefined) {
        statsMap[stat._id] = stat.count;
      }
    }

    // Recent quiz attempts
    const recentAttempts = await QuizAttempt.find({
      clientId: req.user._id
    })
      .populate('quizId', 'title')
      .populate('assignment', 'roadmap')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        assignments,
        stats: statsMap,
        recentAttempts
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignedRoadmap(req, res, next) {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      client: req.user._id
    })
      .populate('roadmap')
      .populate('publishedVersion');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or unauthorized.'
      });
    }

    // Fetch all node progress records for this assignment
    const progressRecords = await NodeProgress.find({ assignment: assignment._id });
    const progressMap = new Map();
    for (const pr of progressRecords) {
      progressMap.set(pr.nodeId, pr);
    }

    // Attach current progress status and lock reasons to each node
    const versionNodes = assignment.publishedVersion?.nodes || [];
    const nodesWithProgress = versionNodes.map((node) => {
      const pr = progressMap.get(node.id);
      return {
        id: node.id,
        title: node.title,
        description: node.description,
        type: node.type,
        position: node.position,
        estimatedDuration: node.estimatedDuration,
        status: pr?.status || 'locked',
        lockReasons: pr?.lockReasons || [],
        passedQuiz: pr?.passedQuiz || false,
        completedAt: pr?.completedAt || null,
        quizConfig: {
          isRequired: node.quizConfig?.isRequired || false,
          passingPercentage: node.quizConfig?.passingPercentage || 80
        }
      };
    });

    return res.json({
      success: true,
      data: {
        assignment,
        roadmap: assignment.roadmap,
        version: {
          versionNumber: assignment.publishedVersion.versionNumber,
          nodes: nodesWithProgress,
          edges: assignment.publishedVersion.edges
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getNodeWorkspace(req, res, next) {
  try {
    const { assignmentId, nodeId } = req.params;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      client: req.user._id
    }).populate('publishedVersion');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or unauthorized.'
      });
    }

    // Verify node is not locked
    const progress = await verifyNodeAccess(assignment._id, nodeId);

    const nodeConfig = assignment.publishedVersion?.nodes.find((n) => n.id === nodeId);
    if (!nodeConfig) {
      return res.status(404).json({
        success: false,
        message: 'Node not found in assigned roadmap version.'
      });
    }

    // Fetch authorized resources
    const resources = await Resource.find({
      _id: { $in: nodeConfig.resourceIds || [] }
    }).select('-storageKey'); // Never leak internal storage path directly

    // Fetch quiz metadata if attached
    let quiz = null;
    if (nodeConfig.quizConfig?.quizId) {
      quiz = await Quiz.findById(nodeConfig.quizConfig.quizId).select(
        'title description passingPercentage defaultQuestionsPerAttempt maxAttempts allowRetake'
      );
    }

    // Fetch quiz attempt history for this node
    const quizAttempts = await QuizAttempt.find({
      assignment: assignment._id,
      nodeId
    }).sort({ attemptNumber: -1 });

    return res.json({
      success: true,
      data: {
        node: nodeConfig,
        progress,
        resources,
        quiz,
        quizAttempts
      }
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
        lockReasons: error.lockReasons
      });
    }
    next(error);
  }
}

export async function updateResourceCompletion(req, res, next) {
  try {
    const { assignmentId, nodeId, resourceId } = req.params;
    const { isCompleted } = req.body;

    const assignment = await Assignment.findOne({ _id: assignmentId, client: req.user._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await verifyNodeAccess(assignment._id, nodeId);

    const progress = await NodeProgress.findOne({ assignment: assignment._id, nodeId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress record not found.' });
    }

    const resIdStr = resourceId.toString();
    const existing = new Set((progress.completedResources || []).map((id) => id.toString()));

    if (isCompleted) {
      existing.add(resIdStr);
    } else {
      existing.delete(resIdStr);
    }

    progress.completedResources = [...existing];
    await progress.save();

    // Check if node can be completed
    const completionResult = await evaluateAndCompleteNode(assignment._id, nodeId);

    return res.json({
      success: true,
      data: {
        progress: completionResult.progress,
        completed: completionResult.completed,
        missingConditions: completionResult.missingConditions
      }
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function updateTaskCompletion(req, res, next) {
  try {
    const { assignmentId, nodeId, taskId } = req.params;
    const { isCompleted } = req.body;

    const assignment = await Assignment.findOne({ _id: assignmentId, client: req.user._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await verifyNodeAccess(assignment._id, nodeId);

    const progress = await NodeProgress.findOne({ assignment: assignment._id, nodeId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress record not found.' });
    }

    const taskSet = new Set(progress.completedTasks || []);
    if (isCompleted) {
      taskSet.add(taskId);
    } else {
      taskSet.delete(taskId);
    }

    progress.completedTasks = [...taskSet];
    await progress.save();

    const completionResult = await evaluateAndCompleteNode(assignment._id, nodeId);

    return res.json({
      success: true,
      data: {
        progress: completionResult.progress,
        completed: completionResult.completed,
        missingConditions: completionResult.missingConditions
      }
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function startQuizAttempt(req, res, next) {
  try {
    const { assignmentId, nodeId } = req.params;

    const assignment = await Assignment.findOne({ _id: assignmentId, client: req.user._id }).populate('publishedVersion');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await verifyNodeAccess(assignment._id, nodeId);

    const nodeConfig = assignment.publishedVersion?.nodes.find((n) => n.id === nodeId);
    const quizId = nodeConfig?.quizConfig?.quizId;
    if (!quizId) {
      return res.status(400).json({ success: false, message: 'No quiz attached to this node.' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    // Check attempt limits
    const existingAttempts = await QuizAttempt.countDocuments({
      assignment: assignment._id,
      nodeId
    });

    if (quiz.maxAttempts > 0 && existingAttempts >= quiz.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: `Maximum attempt limit (${quiz.maxAttempts}) reached for this assessment.`
      });
    }

    const questionCount = nodeConfig.quizConfig.questionsPerAttempt || quiz.defaultQuestionsPerAttempt || 20;
    const learnerQuestions = prepareLearnerQuestions(quiz, questionCount);

    const attempt = await QuizAttempt.create({
      assignment: assignment._id,
      nodeId,
      quizId: quiz._id,
      clientId: req.user._id,
      attemptNumber: existingAttempts + 1,
      questionSnapshots: learnerQuestions,
      passingPercentage: nodeConfig.quizConfig.passingPercentage || quiz.passingPercentage || 80
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz attempt started.',
      data: {
        attemptId: attempt._id,
        attemptNumber: attempt.attemptNumber,
        passingPercentage: attempt.passingPercentage,
        questions: learnerQuestions
      }
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function submitQuizAttempt(req, res, next) {
  try {
    const { assignmentId, nodeId, attemptId } = req.params;
    const { answers } = req.body;

    const assignment = await Assignment.findOne({ _id: assignmentId, client: req.user._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await verifyNodeAccess(assignment._id, nodeId);

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      assignment: assignment._id,
      nodeId,
      clientId: req.user._id
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found.' });
    }

    if (attempt.completedAt) {
      return res.status(400).json({ success: false, message: 'This attempt has already been submitted and graded.' });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz definition not found.' });
    }

    const selectedQuestionIds = attempt.questionSnapshots.map((q) => q.id);
    const grading = gradeQuizAttempt(quiz, answers, selectedQuestionIds);

    attempt.submittedAnswers = answers;
    attempt.score = grading.score;
    attempt.maxScore = grading.maxScore;
    attempt.percentage = grading.percentage;
    attempt.passed = grading.passed;
    attempt.gradedDetails = grading.gradedDetails;
    attempt.completedAt = new Date();
    await attempt.save();

    // Update node progress record
    const progress = await NodeProgress.findOne({ assignment: assignment._id, nodeId });
    if (progress) {
      progress.latestQuizAttempt = attempt._id;
      if (grading.passed) {
        progress.passedQuiz = true;
      }
      await progress.save();
    }

    // Trigger node completion evaluation
    const completionResult = await evaluateAndCompleteNode(assignment._id, nodeId);

    return res.json({
      success: true,
      message: grading.passed
        ? `Congratulations! You passed with ${grading.percentage}% (required: ${grading.passingPercentage}%).`
        : `You scored ${grading.percentage}% (required: ${grading.passingPercentage}%). Please review and try again.`,
      data: {
        score: grading.score,
        maxScore: grading.maxScore,
        percentage: grading.percentage,
        passed: grading.passed,
        passingPercentage: grading.passingPercentage,
        gradedDetails: grading.gradedDetails,
        nodeCompleted: completionResult.completed,
        missingConditions: completionResult.missingConditions
      }
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}
