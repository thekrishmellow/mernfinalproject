import { Roadmap } from '../models/Roadmap.js';
import { User } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Invitation } from '../models/Invitation.js';
import { NodeProgress } from '../models/NodeProgress.js';

export async function getAdminAnalytics(req, res, next) {
  try {
    const adminId = req.user._id;

    // Roadmaps created by this specific author
    const myRoadmaps = await Roadmap.find({ owner: adminId }).select('_id');
    const myRoadmapIds = myRoadmaps.map((r) => r._id);

    const [
      publishedRoadmaps,
      draftRoadmaps,
      activeAssignments,
      completedAssignments,
      outstandingInvitations,
      myAssignments
    ] = await Promise.all([
      Roadmap.countDocuments({ owner: adminId, status: 'published' }),
      Roadmap.countDocuments({ owner: adminId, status: 'draft' }),
      Assignment.countDocuments({ assignedBy: adminId, status: 'active' }),
      Assignment.countDocuments({ assignedBy: adminId, status: 'completed' }),
      Invitation.countDocuments({ invitingAdmin: adminId, status: 'pending', expiresAt: { $gt: new Date() } }),
      Assignment.find({ assignedBy: adminId }).select('_id client targetEmail')
    ]);

    const totalRoadmaps = myRoadmaps.length;
    const myAssignmentIds = myAssignments.map((a) => a._id);

    // Calculate unique clients managed by this admin
    const uniqueClientEmails = new Set(myAssignments.map((a) => a.targetEmail).filter(Boolean));
    const totalClients = uniqueClientEmails.size;

    // Average quiz score for this admin's assignments
    const quizStats = await QuizAttempt.aggregate([
      { $match: { assignment: { $in: myAssignmentIds }, completedAt: { $ne: null } } },
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 },
          passedCount: {
            $sum: { $cond: ['$passed', 1, 0] }
          }
        }
      }
    ]);

    const avgQuizPercentage = quizStats.length > 0 ? Math.round(quizStats[0].avgPercentage) : 0;
    const totalQuizAttempts = quizStats.length > 0 ? quizStats[0].totalAttempts : 0;
    const totalPassedAttempts = quizStats.length > 0 ? quizStats[0].passedCount : 0;

    // Recently updated roadmaps of this admin
    const recentRoadmaps = await Roadmap.find({ owner: adminId })
      .select('title category status updatedAt estimatedDuration accentColor')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Recent client learning activities on this admin's assignments
    const recentActivities = await NodeProgress.find({
      assignment: { $in: myAssignmentIds },
      status: { $in: ['in_progress', 'completed'] }
    })
      .populate({
        path: 'assignment',
        select: 'client roadmap targetEmail',
        populate: [
          { path: 'client', select: 'name email' },
          { path: 'roadmap', select: 'title' }
        ]
      })
      .sort({ lastActivityAt: -1 })
      .limit(8);

    return res.json({
      success: true,
      data: {
        metrics: {
          totalRoadmaps,
          publishedRoadmaps,
          draftRoadmaps,
          totalClients,
          activeAssignments,
          completedAssignments,
          outstandingInvitations,
          avgQuizPercentage,
          totalQuizAttempts,
          totalPassedAttempts
        },
        recentRoadmaps,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoadmapAnalytics(req, res, next) {
  try {
    const { roadmapId } = req.params;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    if (!roadmap.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this roadmap.'
      });
    }

    const assignments = await Assignment.find({ roadmap: roadmapId }).populate('client', 'name email');
    const assignmentIds = assignments.map((a) => a._id);

    // Node status distribution
    const nodeStatusCounts = await NodeProgress.aggregate([
      { $match: { assignment: { $in: assignmentIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const attempts = await QuizAttempt.find({ assignment: { $in: assignmentIds } });

    return res.json({
      success: true,
      data: {
        roadmap: {
          title: roadmap.title,
          category: roadmap.category,
          status: roadmap.status
        },
        totalAssignments: assignments.length,
        assignments,
        nodeStatusCounts,
        quizAttemptsCount: attempts.length
      }
    });
  } catch (error) {
    next(error);
  }
}
