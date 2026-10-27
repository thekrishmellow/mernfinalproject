import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.js';
import { NodeProgress } from '../models/NodeProgress.js';
import { Quiz } from '../models/Quiz.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Resource } from '../models/Resource.js';
import { User } from '../models/User.js';
import { Roadmap } from '../models/Roadmap.js';
import { RoadmapVersion } from '../models/RoadmapVersion.js';
import {
  verifyNodeAccess,
  evaluateAndCompleteNode,
  recalculateDownstreamEligibility,
  updateAssignmentOverallProgress,
  syncAssignmentProgress
} from '../services/progression/progressionService.js';
import { prepareLearnerQuestions, gradeQuizAttempt } from '../services/quizzes/quizGradingService.js';
import { sortRoadmapNodes } from '../services/roadmap/graphValidationService.js';

export async function getClientDashboard(req, res, next) {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    // 1. Auto-claim any assignments or invitations targeting this user's email
    const unclaimed = await Assignment.find({
      targetEmail: userEmail,
      $or: [
        { client: null },
        { client: { $exists: false } },
        { client: { $ne: req.user._id } }
      ]
    });

    for (const asgn of unclaimed) {
      asgn.client = req.user._id;
      await asgn.save();
    }

    // 2. Fetch all assignments strictly assigned to this client or their email
    let assignments = await Assignment.find({
      $or: [
        { client: req.user._id },
        { targetEmail: userEmail }
      ],
      status: { $in: ['active', 'completed', 'pending_acceptance'] }
    })
      .populate('roadmap', 'title description category estimatedDuration accentColor currentPublishedVersion owner')
      .populate('publishedVersion', 'versionNumber nodes edges')
      .populate('assignedBy', 'name email')
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
    // Activity timestamps for calendar contribution mapping (isolated strictly to req.user)
    const quizDates = await QuizAttempt.find({ clientId: req.user._id })
      .select('createdAt completedAt')
      .lean();

    const progressDates = await NodeProgress.find({ assignment: { $in: assignmentIds } })
      .select('lastActivityAt completedAt createdAt')
      .lean();

    const activityTimestamps = [];
    quizDates.forEach((q) => {
      if (q.completedAt) activityTimestamps.push(q.completedAt);
      else if (q.createdAt) activityTimestamps.push(q.createdAt);
    });
    progressDates.forEach((p) => {
      if (p.completedAt) activityTimestamps.push(p.completedAt);
      if (p.lastActivityAt) activityTimestamps.push(p.lastActivityAt);
    });

    const activityDates = Array.from(
      new Set(activityTimestamps.map((d) => new Date(d).toISOString().slice(0, 10)))
    );

    // Recent quiz attempts for personal log
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
        activityDates,
        recentAttempts
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Helper to retrieve an assignment if the user is authorized (either as an admin previewing,
 * or as the assigned client matching client ID or target email).
 */
async function findAuthorizedAssignment(assignmentId, user) {
  const filter =
    user.role === 'admin'
      ? { _id: assignmentId }
      : {
          _id: assignmentId,
          $or: [
            { client: user._id },
            { targetEmail: user.email ? user.email.toLowerCase().trim() : '' }
          ]
        };

  let assignment = await Assignment.findOne(filter)
    .populate('roadmap')
    .populate('publishedVersion');

  if (assignment && !assignment.client && user.role !== 'admin') {
    assignment.client = user._id;
    await assignment.save();
  }

  return assignment;
}

export async function getAssignedRoadmap(req, res, next) {
  try {
    const { assignmentId } = req.params;

    let assignment = await findAuthorizedAssignment(assignmentId, req.user);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or unauthorized.'
      });
    }

    // Dynamic auto-upgrade / fallback: If publishedVersion is missing or roadmap has newer published version, sync!
    if (
      assignment.roadmap?.currentPublishedVersion &&
      (!assignment.publishedVersion || assignment.publishedVersion._id?.toString() !== assignment.roadmap.currentPublishedVersion.toString())
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
    const versionEdges = assignment.publishedVersion?.edges || [];
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
          passingPercentage: node.quizConfig?.passingPercentage || 80,
          timeLimitMinutes: node.quizConfig?.timeLimitMinutes !== undefined ? node.quizConfig.timeLimitMinutes : 0
        }
      };
    });

    // Topologically and pedagogically order nodes from Start/Prerequisites -> Milestones
    const sortedNodes = sortRoadmapNodes(nodesWithProgress, versionEdges);

    return res.json({
      success: true,
      data: {
        assignment,
        roadmap: assignment.roadmap,
        version: {
          versionNumber: assignment.publishedVersion?.versionNumber || 1,
          nodes: sortedNodes,
          edges: versionEdges
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

    let assignment = await findAuthorizedAssignment(assignmentId, req.user);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or unauthorized.'
      });
    }

    // Auto-upgrade if newer version exists or if publishedVersion is missing
    if (
      assignment.roadmap?.currentPublishedVersion &&
      (!assignment.publishedVersion || assignment.publishedVersion._id?.toString() !== assignment.roadmap.currentPublishedVersion.toString())
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

    // Safely normalize resource IDs (ObjectIds, strings, or populated objects) from nodeConfig or data
    let rawResourceIds = (nodeConfig.resourceIds || nodeConfig.data?.resourceIds || [])
      .map((r) => (r && typeof r === 'object' && r._id ? r._id : r))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    // Fallback: If this snapshot had empty resourceIds, check parent roadmap draftNodes
    if (rawResourceIds.length === 0 && assignment.roadmap) {
      const fullRoadmap = await Roadmap.findById(assignment.roadmap._id || assignment.roadmap);
      const draftNode = fullRoadmap?.draftNodes?.find((dn) => dn.id === nodeId);
      if (draftNode) {
        const draftResIds = draftNode.resourceIds || draftNode.data?.resourceIds || [];
        rawResourceIds = (Array.isArray(draftResIds) ? draftResIds : [])
          .map((r) => (r && typeof r === 'object' && r._id ? r._id : r))
          .filter((id) => mongoose.Types.ObjectId.isValid(id));
      }
    }

    // Fetch authorized resources
    const resources = await Resource.find({
      _id: { $in: rawResourceIds }
    }).select('-storageKey'); // Never leak internal storage path directly

    // Fetch quiz metadata if attached
    let quiz = null;
    if (nodeConfig.quizConfig?.quizId) {
      quiz = await Quiz.findById(nodeConfig.quizConfig.quizId).select(
        'title description passingPercentage defaultQuestionsPerAttempt maxAttempts allowRetake timeLimitMinutes'
      );
    }

    // Fetch quiz attempt history for this node
    const quizAttempts = await QuizAttempt.find({
      assignment: assignment._id,
      nodeId
    }).sort({ attemptNumber: -1 });

    // Calculate topological sequence to supply prevNode and nextNode
    const allVersionNodes = assignment.publishedVersion?.nodes || [];
    const allVersionEdges = assignment.publishedVersion?.edges || [];
    const sortedAllNodes = sortRoadmapNodes(allVersionNodes, allVersionEdges);
    const currentIndex = sortedAllNodes.findIndex((n) => n.id === nodeId);

    let nextNode = null;
    let prevNode = null;

    if (currentIndex >= 0) {
      if (currentIndex > 0) {
        const prevCandidate = sortedAllNodes[currentIndex - 1];
        prevNode = {
          id: prevCandidate.id,
          title: prevCandidate.title,
          type: prevCandidate.type
        };
      }

      if (currentIndex < sortedAllNodes.length - 1) {
        const nextCandidate = sortedAllNodes[currentIndex + 1];
        const nextProgress = await NodeProgress.findOne({
          assignment: assignment._id,
          nodeId: nextCandidate.id
        });
        nextNode = {
          id: nextCandidate.id,
          title: nextCandidate.title,
          type: nextCandidate.type,
          status: nextProgress?.status || 'locked'
        };
      }
    }

    return res.json({
      success: true,
      data: {
        node: nodeConfig,
        progress,
        resources,
        quiz,
        quizAttempts,
        nextNode,
        prevNode
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

    const assignment = await findAuthorizedAssignment(assignmentId, req.user);
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

    const assignment = await findAuthorizedAssignment(assignmentId, req.user);
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

    const assignment = await findAuthorizedAssignment(assignmentId, req.user);
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

    const timeLimitMinutes =
      nodeConfig.quizConfig?.timeLimitMinutes !== undefined &&
      nodeConfig.quizConfig?.timeLimitMinutes !== null &&
      Number(nodeConfig.quizConfig.timeLimitMinutes) > 0
        ? Number(nodeConfig.quizConfig.timeLimitMinutes)
        : (quiz.timeLimitMinutes || 0);

    const attempt = await QuizAttempt.create({
      assignment: assignment._id,
      nodeId,
      quizId: quiz._id,
      clientId: assignment.client || req.user._id,
      attemptNumber: existingAttempts + 1,
      questionSnapshots: learnerQuestions,
      passingPercentage: nodeConfig.quizConfig.passingPercentage || quiz.passingPercentage || 80,
      timeLimitMinutes,
      startedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz attempt started.',
      data: {
        attemptId: attempt._id,
        attemptNumber: attempt.attemptNumber,
        passingPercentage: attempt.passingPercentage,
        timeLimitMinutes: attempt.timeLimitMinutes || 0,
        startedAt: attempt.startedAt || attempt.createdAt,
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

    const assignment = await findAuthorizedAssignment(assignmentId, req.user);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await verifyNodeAccess(assignment._id, nodeId);

    const attemptFilter = {
      _id: attemptId,
      assignment: assignment._id,
      nodeId,
      ...(req.user.role === 'admin' ? {} : { clientId: req.user._id })
    };

    const attempt = await QuizAttempt.findOne(attemptFilter);

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
    const startTime = attempt.startedAt ? new Date(attempt.startedAt).getTime() : new Date(attempt.createdAt).getTime();
    attempt.timeSpentSeconds = Math.max(0, Math.round((Date.now() - startTime) / 1000));
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

/**
 * Accepts an assigned roadmap, activates it, and creates learning progression nodes
 */
export async function acceptAssignedRoadmap(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const userEmail = req.user.email.toLowerCase().trim();

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      $or: [
        { client: req.user._id },
        { targetEmail: userEmail }
      ]
    }).populate('roadmap').populate('publishedVersion');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found for your account.'
      });
    }

    assignment.client = req.user._id;
    assignment.status = 'active';
    await assignment.save();

    if (assignment.publishedVersion) {
      const { initializeAssignmentProgress } = await import('../services/progression/progressionService.js');
      await initializeAssignmentProgress(assignment, assignment.publishedVersion);
    }

    return res.json({
      success: true,
      message: `Enrolled successfully! Welcome to "${assignment.roadmap?.title}".`,
      data: { assignment }
    });
  } catch (error) {
    next(error);
  }
}

