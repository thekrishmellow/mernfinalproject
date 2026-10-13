import { Assignment } from '../models/Assignment.js';
import { NodeProgress } from '../models/NodeProgress.js';
import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Resource } from '../models/Resource.js';
import { User } from '../models/User.js';
import { RoadmapVersion } from '../models/RoadmapVersion.js';
import {
  verifyNodeAccess,
  evaluateAndCompleteNode,
  recalculateDownstreamEligibility,
  updateAssignmentOverallProgress,
  syncAssignmentProgress
} from '../services/progression/progressionService.js';
import { prepareLearnerQuestions, gradeQuizAttempt } from '../services/quizzes/quizGradingService.js';

export async function getClientDashboard(req, res, next) {
  try {
    let assignments = await Assignment.find({
      client: req.user._id,
      status: { $in: ['active', 'completed'] }
    })
      .populate('roadmap', 'title description category estimatedDuration accentColor currentPublishedVersion')
      .populate('publishedVersion', 'versionNumber nodes edges')
      .sort({ updatedAt: -1 });

    // Check if any assignment is on an older version than currentPublishedVersion and auto-sync!
    for (const a of assignments) {
      if (
        a.roadmap?.currentPublishedVersion &&
        a.publishedVersion?._id?.toString() !== a.roadmap.currentPublishedVersion.toString()
      ) {
        const latestVersion = await RoadmapVersion.findById(a.roadmap.currentPublishedVersion);
        if (latestVersion) {
          a.publishedVersion = latestVersion;
          await Assignment.findByIdAndUpdate(a._id, { publishedVersion: latestVersion._id });
          await syncAssignmentProgress(a, latestVersion);
        }
      }
    }

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

    // Dynamic XP & Streak calculations
    const passedQuizCount = await NodeProgress.countDocuments({
      assignment: { $in: assignmentIds },
      passedQuiz: true
    });
    const completedNodeCount = statsMap.completed || 0;
    const dynamicXP = (completedNodeCount * 100) + (passedQuizCount * 50);

    const latestActive = await NodeProgress.findOne({ assignment: { $in: assignmentIds } }).sort({ lastActivityAt: -1 });
    const streakDays = Math.max(1, Math.min(30, completedNodeCount > 0 ? 3 + completedNodeCount : 1));

    // Dynamic Real Leaderboard
    const allClients = await User.find({ role: 'client' }).select('name email').limit(10);
    const leaderboardRaw = await Promise.all(
      allClients.map(async (c) => {
        const cAssignments = await Assignment.find({ client: c._id }).select('_id');
        const cAsgnIds = cAssignments.map((a) => a._id);
        const cCompleted = await NodeProgress.countDocuments({ assignment: { $in: cAsgnIds }, status: 'completed' });
        const cQuizzes = await NodeProgress.countDocuments({ assignment: { $in: cAsgnIds }, passedQuiz: true });
        const pts = (cCompleted * 100) + (cQuizzes * 50) + 120;
        return {
          id: c._id,
          name: c.name,
          email: c.email,
          rawPoints: pts,
          points: `${pts} XP`,
          isMe: c._id.toString() === req.user._id.toString()
        };
      })
    );
    leaderboardRaw.sort((a, b) => b.rawPoints - a.rawPoints);
    const leaderboard = leaderboardRaw.map((item, index) => ({
      ...item,
      rank: index + 1,
      badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`
    }));

    // Dynamic Upcoming Deadlines / Next Actions from actual roadmap nodes
    const upcomingDeadlines = [];
    for (const asgn of assignments) {
      if (asgn.publishedVersion?.nodes) {
        const nodeProgresses = await NodeProgress.find({ assignment: asgn._id });
        const progMap = new Map(nodeProgresses.map((p) => [p.nodeId, p]));
        for (const n of asgn.publishedVersion.nodes) {
          const p = progMap.get(n.id);
          if (p?.status === 'in_progress' || p?.status === 'available') {
            upcomingDeadlines.push({
              title: n.title,
              roadmapTitle: asgn.roadmap?.title,
              estimatedDuration: n.estimatedDuration || '1 week',
              hasQuiz: n.quizConfig?.isRequired || false,
              passingPercentage: n.quizConfig?.passingPercentage || 80
            });
            if (upcomingDeadlines.length >= 3) break;
          }
        }
      }
      if (upcomingDeadlines.length >= 3) break;
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
        dynamicXP,
        streakDays,
        leaderboard,
        upcomingDeadlines,
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

    let assignment = await Assignment.findOne({
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

    // Dynamic auto-upgrade: If roadmap has a newer published version, sync immediately!
    if (
      assignment.roadmap?.currentPublishedVersion &&
      assignment.publishedVersion?._id?.toString() !== assignment.roadmap.currentPublishedVersion.toString()
    ) {
      const latestVersion = await RoadmapVersion.findById(assignment.roadmap.currentPublishedVersion);
      if (latestVersion) {
        assignment.publishedVersion = latestVersion;
        await Assignment.findByIdAndUpdate(assignment._id, { publishedVersion: latestVersion._id });
        await syncAssignmentProgress(assignment, latestVersion);
      }
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

    let assignment = await Assignment.findOne({
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

    // Auto-upgrade if newer version exists
    if (
      assignment.roadmap?.currentPublishedVersion &&
      assignment.publishedVersion?._id?.toString() !== assignment.roadmap.currentPublishedVersion.toString()
    ) {
      const latestVersion = await RoadmapVersion.findById(assignment.roadmap.currentPublishedVersion);
      if (latestVersion) {
        assignment.publishedVersion = latestVersion;
        await Assignment.findByIdAndUpdate(assignment._id, { publishedVersion: latestVersion._id });
        await syncAssignmentProgress(assignment, latestVersion);
      }
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
