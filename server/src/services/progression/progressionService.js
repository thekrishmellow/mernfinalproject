import { NodeProgress } from '../../models/NodeProgress.js';
import { Assignment } from '../../models/Assignment.js';
import { RoadmapVersion } from '../../models/RoadmapVersion.js';

/**
 * Initializes progression records for a newly assigned published roadmap version.
 * Root nodes become available immediately. Downstream nodes start locked with prerequisite explanations.
 */
export async function initializeAssignmentProgress(assignment, publishedVersion) {
  const nodes = publishedVersion.nodes || [];
  const edges = publishedVersion.edges || [];

  // Map each node to its incoming prerequisite source nodes
  const prereqMap = new Map();
  const nodeTitleMap = new Map();

  for (const node of nodes) {
    prereqMap.set(node.id, []);
    nodeTitleMap.set(node.id, node.title);
  }

  for (const edge of edges) {
    if (prereqMap.has(edge.target)) {
      prereqMap.get(edge.target).push(edge.source);
    }
  }

  const progressRecords = [];

  for (const node of nodes) {
    const prereqs = prereqMap.get(node.id) || [];
    const isRoot = prereqs.length === 0;

    const lockReasons = isRoot
      ? []
      : prereqs.map((srcId) => `Complete prerequisite: "${nodeTitleMap.get(srcId) || srcId}"`);

    progressRecords.push({
      assignment: assignment._id,
      nodeId: node.id,
      status: isRoot ? 'available' : 'locked',
      completedResources: [],
      completedTasks: [],
      passedQuiz: false,
      lockReasons,
      lastActivityAt: new Date()
    });
  }

  // Insert or upsert node progress records
  await NodeProgress.bulkWrite(
    progressRecords.map((rec) => ({
      updateOne: {
        filter: { assignment: rec.assignment, nodeId: rec.nodeId },
        update: { $setOnInsert: rec },
        upsert: true
      }
    }))
  );

  await updateAssignmentOverallProgress(assignment._id);
}

/**
 * Synchronizes an existing assignment to a newly published roadmap version.
 * - Adds progress records for new nodes in the version (preserving root vs locked rules)
 * - Retains progress for existing nodes (status, tasks, resources, quiz passes)
 * - Updates lock reasons for downstream nodes based on new edge dependencies
 * - Cleans up node progress records for nodes that were deleted in the new version
 * - Recalculates downstream eligibility and overall progress percentage
 */
export async function syncAssignmentProgress(assignment, publishedVersion) {
  const nodes = publishedVersion.nodes || [];
  const edges = publishedVersion.edges || [];
  const activeNodeIds = new Set(nodes.map((n) => n.id));

  // 1. Remove orphaned NodeProgress records for deleted nodes
  await NodeProgress.deleteMany({
    assignment: assignment._id,
    nodeId: { $nin: Array.from(activeNodeIds) }
  });

  // 2. Map prerequisite dependencies
  const prereqMap = new Map();
  const nodeTitleMap = new Map();
  for (const node of nodes) {
    prereqMap.set(node.id, []);
    nodeTitleMap.set(node.id, node.title);
  }
  for (const edge of edges) {
    if (prereqMap.has(edge.target)) {
      prereqMap.get(edge.target).push(edge.source);
    }
  }

  // 3. Fetch existing progress
  const existingProgress = await NodeProgress.find({ assignment: assignment._id });
  const existingMap = new Map(existingProgress.map((p) => [p.nodeId, p]));

  const bulkOps = [];
  for (const node of nodes) {
    const existing = existingMap.get(node.id);
    const prereqs = prereqMap.get(node.id) || [];
    const isRoot = prereqs.length === 0;

    const lockReasons = isRoot
      ? []
      : prereqs.map((srcId) => `Complete prerequisite: "${nodeTitleMap.get(srcId) || srcId}"`);

    if (!existing) {
      // Brand new node added in the updated roadmap
      bulkOps.push({
        insertOne: {
          document: {
            assignment: assignment._id,
            nodeId: node.id,
            status: isRoot ? 'available' : 'locked',
            completedResources: [],
            completedTasks: [],
            passedQuiz: false,
            lockReasons,
            lastActivityAt: new Date()
          }
        }
      });
    } else {
      // Existing node: if locked, update lockReasons with new prerequisite titles
      if (existing.status === 'locked') {
        bulkOps.push({
          updateOne: {
            filter: { _id: existing._id },
            update: { $set: { lockReasons } }
          }
        });
      }
    }
  }

  if (bulkOps.length > 0) {
    await NodeProgress.bulkWrite(bulkOps);
  }

  // 4. Recalculate downstream eligibility & overall progress
  await recalculateDownstreamEligibility(assignment._id);
  await updateAssignmentOverallProgress(assignment._id);
}

/**
 * Validates whether a client is authorized to access a specific node.
 * Locked nodes are rejected with explicit reasons.
 */
export async function verifyNodeAccess(assignmentId, nodeId) {
  const progress = await NodeProgress.findOne({ assignment: assignmentId, nodeId });
  if (!progress) {
    throw new Error('Node progress record not found.');
  }

  if (progress.status === 'locked') {
    const error = new Error(`Node is locked. Prerequisites: ${progress.lockReasons.join(', ')}`);
    error.statusCode = 403;
    error.lockReasons = progress.lockReasons;
    throw error;
  }

  return progress;
}

/**
 * Recalculates eligibility for all downstream locked nodes in an assignment.
 * Uses strict AND rule: all predecessor nodes must have status === 'completed'.
 */
export async function recalculateDownstreamEligibility(assignmentId) {
  const assignment = await Assignment.findById(assignmentId).populate('publishedVersion');
  if (!assignment || !assignment.publishedVersion) return;

  const version = assignment.publishedVersion;
  const nodes = version.nodes || [];
  const edges = version.edges || [];

  // Build prerequisite map: targetNodeId -> [sourceNodeIds]
  const prereqMap = new Map();
  const nodeTitleMap = new Map();

  for (const node of nodes) {
    prereqMap.set(node.id, []);
    nodeTitleMap.set(node.id, node.title);
  }

  for (const edge of edges) {
    if (prereqMap.has(edge.target)) {
      prereqMap.get(edge.target).push(edge.source);
    }
  }

  const allProgress = await NodeProgress.find({ assignment: assignmentId });
  const progressMap = new Map();
  for (const p of allProgress) {
    progressMap.set(p.nodeId, p);
  }

  let stateChanged = false;

  for (const node of nodes) {
    const progress = progressMap.get(node.id);
    if (!progress) continue;

    // Only inspect nodes that are currently locked
    if (progress.status === 'locked') {
      const prereqs = prereqMap.get(node.id) || [];
      const pendingPrereqs = [];

      for (const srcId of prereqs) {
        const srcProgress = progressMap.get(srcId);
        if (!srcProgress || srcProgress.status !== 'completed') {
          pendingPrereqs.push(nodeTitleMap.get(srcId) || srcId);
        }
      }

      if (pendingPrereqs.length === 0) {
        // All predecessors completed! Unlock this node
        progress.status = 'available';
        progress.lockReasons = [];
        progress.lastActivityAt = new Date();
        await progress.save();
        stateChanged = true;
      } else {
        // Still locked, update reasons
        const reasons = pendingPrereqs.map((title) => `Complete prerequisite: "${title}"`);
        if (JSON.stringify(progress.lockReasons) !== JSON.stringify(reasons)) {
          progress.lockReasons = reasons;
          await progress.save();
        }
      }
    }
  }

  await updateAssignmentOverallProgress(assignmentId);
  return stateChanged;
}

/**
 * Evaluates whether a node has satisfied all mandatory completion requirements.
 * If yes, marks it completed and triggers downstream unlocking.
 */
export async function evaluateAndCompleteNode(assignmentId, nodeId) {
  const assignment = await Assignment.findById(assignmentId).populate('publishedVersion');
  if (!assignment || !assignment.publishedVersion) {
    throw new Error('Assignment or published roadmap version not found');
  }

  const nodeConfig = assignment.publishedVersion.nodes.find((n) => n.id === nodeId);
  if (!nodeConfig) {
    throw new Error(`Node ${nodeId} not found in assigned roadmap version`);
  }

  const progress = await NodeProgress.findOne({ assignment: assignmentId, nodeId });
  if (!progress) {
    throw new Error('Node progress not found');
  }

  if (progress.status === 'locked') {
    const error = new Error('Cannot complete a locked node.');
    error.statusCode = 403;
    throw error;
  }

  if (progress.status === 'completed') {
    return { completed: true, progress };
  }

  const conditions = nodeConfig.completionConditions || {};
  let canComplete = true;
  const missingConditions = [];

  // 1. Task checklist check
  if (conditions.requireAllTasks && nodeConfig.tasks && nodeConfig.tasks.length > 0) {
    const requiredTaskIds = nodeConfig.tasks.filter((t) => t.isRequired).map((t) => t.id);
    const completedSet = new Set(progress.completedTasks || []);
    const allTasksDone = requiredTaskIds.every((id) => completedSet.has(id));
    if (!allTasksDone) {
      canComplete = false;
      missingConditions.push('Pending required tasks in checklist');
    }
  }

  // 2. Resources check
  if (conditions.requireAllResources && nodeConfig.resourceIds && nodeConfig.resourceIds.length > 0) {
    const requiredResIds = nodeConfig.resourceIds.map((id) => id.toString());
    const completedResSet = new Set((progress.completedResources || []).map((id) => id.toString()));
    const allResDone = requiredResIds.every((id) => completedResSet.has(id));
    if (!allResDone) {
      canComplete = false;
      missingConditions.push('Uncompleted required resources');
    }
  }

  // 3. Quiz check
  if (conditions.requireQuizPass || (nodeConfig.quizConfig && nodeConfig.quizConfig.isRequired)) {
    if (!progress.passedQuiz) {
      canComplete = false;
      missingConditions.push(`Required quiz must be passed with >= ${nodeConfig.quizConfig?.passingPercentage || 80}%`);
    }
  }

  if (canComplete) {
    progress.status = 'completed';
    progress.completedAt = new Date();
    progress.lastActivityAt = new Date();
    await progress.save();

    // Recalculate downstream nodes
    await recalculateDownstreamEligibility(assignmentId);
    return { completed: true, progress, unlocked: true };
  } else {
    // If user made progress but not all conditions are met, set to in_progress
    if (progress.status === 'available') {
      progress.status = 'in_progress';
      progress.lastActivityAt = new Date();
      await progress.save();
    }
    return { completed: false, progress, missingConditions };
  }
}

/**
 * Calculates and updates overall roadmap completion percentage for an assignment.
 */
export async function updateAssignmentOverallProgress(assignmentId) {
  const assignment = await Assignment.findById(assignmentId).populate('publishedVersion');
  if (!assignment || !assignment.publishedVersion) return 0;

  const totalNodes = assignment.publishedVersion.nodes?.length || 0;
  if (totalNodes === 0) return 0;

  const completedCount = await NodeProgress.countDocuments({
    assignment: assignmentId,
    status: 'completed'
  });

  const progressPercentage = Math.round((completedCount / totalNodes) * 100);
  assignment.progressPercentage = progressPercentage;
  assignment.lastActivityAt = new Date();

  if (progressPercentage === 100 && assignment.status !== 'completed') {
    assignment.status = 'completed';
    assignment.completedAt = new Date();
  } else if (progressPercentage < 100 && assignment.status === 'completed') {
    assignment.status = 'active';
    assignment.completedAt = null;
  }

  await assignment.save();
  return progressPercentage;
}
