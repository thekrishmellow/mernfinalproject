import { Assignment } from '../models/Assignment.js';
import { Roadmap } from '../models/Roadmap.js';
import { RoadmapVersion } from '../models/RoadmapVersion.js';
import { User } from '../models/User.js';
import { Invitation } from '../models/Invitation.js';
import { generateCryptoToken } from '../utils/token.js';
import { EmailService } from '../services/email/emailService.js';
import { initializeAssignmentProgress } from '../services/progression/progressionService.js';
import { env } from '../config/env.js';

/**
 * Assigns roadmap to an existing client or sends an activation invitation to an email
 */
async function processSingleAssignment({ roadmapId, versionId, clientId, email, assignedBy }) {
  const roadmap = await Roadmap.findById(roadmapId);
  if (!roadmap) {
    throw new Error(`Roadmap ${roadmapId} not found`);
  }

  const targetVersionId = versionId || roadmap.currentPublishedVersion;
  if (!targetVersionId) {
    throw new Error('This roadmap has not been published yet. Please publish it before assigning.');
  }

  const publishedVersion = await RoadmapVersion.findById(targetVersionId);
  if (!publishedVersion) {
    throw new Error('Published roadmap version not found.');
  }

  let user = null;
  let targetEmail = email ? email.toLowerCase().trim() : null;

  if (clientId) {
    user = await User.findById(clientId);
    if (user) {
      targetEmail = user.email;
    }
  } else if (targetEmail) {
    user = await User.findOne({ email: targetEmail });
  }

  if (!targetEmail) {
    throw new Error('Valid client or email required for assignment');
  }

  // Check if an active assignment already exists for this client and roadmap
  const existingAssignment = await Assignment.findOne({
    targetEmail,
    roadmap: roadmap._id,
    status: { $in: ['active', 'completed'] }
  });

  if (existingAssignment) {
    return {
      status: 'already_assigned',
      assignment: existingAssignment,
      email: targetEmail
    };
  }

  // If user exists, create active assignment and initialize progress immediately
  if (user) {
    const assignment = await Assignment.create({
      client: user._id,
      targetEmail: user.email,
      roadmap: roadmap._id,
      publishedVersion: publishedVersion._id,
      assignedBy,
      status: 'active'
    });

    await initializeAssignmentProgress(assignment, publishedVersion);

    return {
      status: 'assigned',
      assignment,
      email: user.email
    };
  }

  // User does not exist yet: create invitation + pending assignment
  const { rawToken, hashedToken } = generateCryptoToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await Invitation.create({
    targetEmail,
    tokenHash: hashedToken,
    roadmap: roadmap._id,
    publishedVersion: publishedVersion._id,
    invitingAdmin: assignedBy,
    expiresAt,
    status: 'pending'
  });

  const assignment = await Assignment.create({
    client: null,
    targetEmail,
    roadmap: roadmap._id,
    publishedVersion: publishedVersion._id,
    assignedBy,
    status: 'active',
    invitation: invitation._id
  });

  const inviter = await User.findById(assignedBy);
  const invitationLink = `${env.CLIENT_URL}/accept-invitation?token=${rawToken}`;
  await EmailService.sendInvitationEmail({
    to: targetEmail,
    invitationLink,
    roadmapTitle: roadmap.title,
    senderName: inviter?.name || 'Your Instructor'
  });

  return {
    status: 'invited',
    assignment,
    invitation,
    email: targetEmail,
    invitationLink
  };
}

export async function assignRoadmap(req, res, next) {
  try {
    const { roadmapId, publishedVersionId, clientId, email } = req.body;

    const result = await processSingleAssignment({
      roadmapId,
      versionId: publishedVersionId,
      clientId,
      email,
      assignedBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: result.status === 'invited'
        ? `Invitation sent to ${result.email}.`
        : `Roadmap successfully assigned to ${result.email}.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function bulkAssignRoadmap(req, res, next) {
  try {
    const { roadmapId, publishedVersionId, clientIds = [], emails = [] } = req.body;

    const results = [];
    const errors = [];

    // Process all client IDs
    for (const clientId of clientIds) {
      try {
        const resObj = await processSingleAssignment({
          roadmapId,
          versionId: publishedVersionId,
          clientId,
          assignedBy: req.user._id
        });
        results.push(resObj);
      } catch (err) {
        errors.push({ clientId, error: err.message });
      }
    }

    // Process all raw emails
    for (const email of emails) {
      try {
        const resObj = await processSingleAssignment({
          roadmapId,
          versionId: publishedVersionId,
          email,
          assignedBy: req.user._id
        });
        results.push(resObj);
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return res.json({
      success: true,
      message: `Processed ${results.length} assignment(s) successfully.${errors.length > 0 ? ` ${errors.length} failed.` : ''}`,
      data: {
        successful: results,
        failed: errors
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignments(req, res, next) {
  try {
    const { roadmapId, status, search, page = 1, limit = 50 } = req.query;
    // Strict isolation: only show assignments initiated by this author/admin
    const query = {
      assignedBy: req.user._id
    };

    if (roadmapId) query.roadmap = roadmapId;
    if (status) query.status = status;
    if (search) {
      query.targetEmail = { $regex: search, $options: 'i' };
    }

    const total = await Assignment.countDocuments(query);
    const assignments = await Assignment.find(query)
      .populate('client', 'name email accountStatus')
      .populate('roadmap', 'title category estimatedDuration accentColor')
      .populate('publishedVersion', 'versionNumber')
      .populate('assignedBy', 'name email')
      .populate('invitation', 'status expiresAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    return res.json({
      success: true,
      data: {
        assignments,
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

export async function revokeAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.'
      });
    }

    if (!assignment.assignedBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not manage this assignment.'
      });
    }

    assignment.status = 'revoked';
    await assignment.save();

    return res.json({
      success: true,
      message: 'Assignment revoked successfully',
      data: { assignment }
    });
  } catch (error) {
    next(error);
  }
}

export async function resendInvitation(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId)
      .populate('invitation')
      .populate('roadmap');

    if (!assignment || !assignment.invitation) {
      return res.status(400).json({
        success: false,
        message: 'No pending invitation found for this assignment.'
      });
    }

    if (!assignment.assignedBy.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not manage this assignment.'
      });
    }

    const { rawToken, hashedToken } = generateCryptoToken();
    assignment.invitation.tokenHash = hashedToken;
    assignment.invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    assignment.invitation.status = 'pending';
    await assignment.invitation.save();

    const invitationLink = `${env.CLIENT_URL}/accept-invitation?token=${rawToken}`;
    await EmailService.sendInvitationEmail({
      to: assignment.targetEmail,
      invitationLink,
      roadmapTitle: assignment.roadmap?.title || 'Personalized Roadmap',
      senderName: req.user.name
    });

    return res.json({
      success: true,
      message: `Invitation resent to ${assignment.targetEmail}`,
      data: {
        invitationLink
      }
    });
  } catch (error) {
    next(error);
  }
}
