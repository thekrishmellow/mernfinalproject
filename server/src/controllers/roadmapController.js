import mongoose from 'mongoose';
import { Roadmap } from '../models/Roadmap.js';
import { RoadmapVersion } from '../models/RoadmapVersion.js';
import { Assignment } from '../models/Assignment.js';
import { validateRoadmapGraph, sortRoadmapNodes } from '../services/roadmap/graphValidationService.js';
import { syncAssignmentProgress } from '../services/progression/progressionService.js';

export async function createRoadmap(req, res, next) {
  try {
    const { title, description, category, estimatedDuration, visibility, accentColor } = req.body;

    const initialNodes = [
      {
        id: 'node_start',
        type: 'start',
        position: { x: 250, y: 50 },
        title: 'Getting Started',
        description: 'Introduction and roadmap prerequisites',
        learningObjectives: ['Understand the core concepts of this path'],
        estimatedDuration: '1 hour',
        tasks: [{ id: 'task_1', text: 'Review orientation notes', isRequired: true }],
        completionConditions: { requireAllTasks: true }
      }
    ];

    const roadmap = await Roadmap.create({
      title,
      description,
      category,
      estimatedDuration,
      visibility,
      accentColor,
      owner: req.user._id,
      draftNodes: initialNodes,
      draftEdges: []
    });

    return res.status(201).json({
      success: true,
      message: 'Roadmap created successfully',
      data: { roadmap }
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoadmaps(req, res, next) {
  try {
    const { status, visibility, search, category, page = 1, limit = 20 } = req.query;
    // Strict isolation: Admin authors only view their own roadmaps
    const query = {
      owner: req.user._id
    };

    if (status) query.status = status;
    if (visibility) query.visibility = visibility;
    if (category) query.category = category;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const total = await Roadmap.countDocuments(query);
    const roadmaps = await Roadmap.find(query)
      .populate('owner', 'name email')
      .populate('currentPublishedVersion', 'versionNumber publicationNotes createdAt')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    // Calculate active assignments count for each roadmap
    const roadmapIds = roadmaps.map((r) => r._id);
    const assignmentCounts = await Assignment.aggregate([
      { $match: { roadmap: { $in: roadmapIds }, status: 'active' } },
      { $group: { _id: '$roadmap', count: { $sum: 1 } } }
    ]);

    const countMap = new Map();
    for (const item of assignmentCounts) {
      countMap.set(item._id.toString(), item.count);
    }

    const roadmapsWithMeta = roadmaps.map((r) => ({
      ...r.toObject(),
      activeAssignmentsCount: countMap.get(r._id.toString()) || 0
    }));

    return res.json({
      success: true,
      data: {
        roadmaps: roadmapsWithMeta,
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

export async function getRoadmapById(req, res, next) {
  try {
    const { roadmapId } = req.params;

    const roadmap = await Roadmap.findById(roadmapId)
      .populate('owner', 'name email')
      .populate('currentPublishedVersion');

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.'
      });
    }

    // Ensure admin user only views their own roadmaps
    if (req.user.role === 'admin' && !roadmap.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this roadmap.'
      });
    }

    const versions = await RoadmapVersion.find({ parentRoadmap: roadmapId })
      .sort({ versionNumber: -1 })
      .select('versionNumber publicationNotes createdAt');

    return res.json({
      success: true,
      data: {
        roadmap,
        versions
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRoadmap(req, res, next) {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findById(roadmapId);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.'
      });
    }

    if (!roadmap.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this roadmap.'
      });
    }

    const allowedFields = ['title', 'description', 'category', 'estimatedDuration', 'visibility', 'status', 'accentColor'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        roadmap[field] = req.body[field];
      }
    }

    await roadmap.save();

    return res.json({
      success: true,
      message: 'Roadmap updated successfully',
      data: { roadmap }
    });
  } catch (error) {
    next(error);
  }
}

export async function saveDraft(req, res, next) {
  try {
    const { roadmapId } = req.params;
    const { nodes, edges } = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.'
      });
    }

    if (!roadmap.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this roadmap draft.'
      });
    }

    roadmap.draftNodes = nodes || [];
    roadmap.draftEdges = edges || [];
    await roadmap.save();

    return res.json({
      success: true,
      message: 'Draft saved successfully',
      data: {
        updatedAt: roadmap.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function publishRoadmap(req, res, next) {
  try {
    const { roadmapId } = req.params;
    const { publicationNotes } = req.body;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.'
      });
    }

    if (!roadmap.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to publish this roadmap.'
      });
    }

    const rawNodes = roadmap.draftNodes || [];
    const edges = roadmap.draftEdges || [];

    // Normalize nodes from ReactFlow draft format: resolve true type, resources, tasks, quiz
    const normalizedNodes = rawNodes.map((n) => {
      const data = n.data || {};
      const actualType = (n.type && n.type !== 'customNode' ? n.type : data.type) || 'learning';
      const rawResIds = n.resourceIds || data.resourceIds || [];
      const validResourceIds = (Array.isArray(rawResIds) ? rawResIds : [])
        .map((r) => (r && typeof r === 'object' && r._id ? r._id : r))
        .filter((id) => mongoose.Types.ObjectId.isValid(id));

      return {
        id: n.id || data.id,
        title: n.title || data.title || 'Untitled Module',
        description: n.description !== undefined ? n.description : (data.description || ''),
        type: actualType,
        position: n.position || { x: 0, y: 0 },
        learningObjectives: n.learningObjectives || data.learningObjectives || [],
        estimatedDuration: n.estimatedDuration || data.estimatedDuration || '',
        resourceIds: validResourceIds,
        tasks: n.tasks || data.tasks || [],
        quizConfig: n.quizConfig || data.quizConfig || {},
        completionConditions: n.completionConditions || data.completionConditions || {},
        completionMessage: n.completionMessage || data.completionMessage || ''
      };
    });

    // Graph validation & cycle check on normalized nodes
    const validation = validateRoadmapGraph(normalizedNodes, edges);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Roadmap cannot be published due to structural validation errors.',
        errors: validation.errors
      });
    }

    // Topologically and pedagogically sort nodes so curriculum starts from Start -> Core -> Quiz -> Milestone
    const sortedNodes = sortRoadmapNodes(normalizedNodes, edges);

    // Determine latest version number
    const latestVersion = await RoadmapVersion.findOne({ parentRoadmap: roadmapId }).sort({ versionNumber: -1 });
    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Create immutable snapshot with properly normalized & sorted nodes
    const newVersion = await RoadmapVersion.create({
      parentRoadmap: roadmap._id,
      versionNumber: nextVersionNumber,
      nodes: sortedNodes,
      edges,
      author: req.user._id,
      publicationNotes: publicationNotes || `Published version ${nextVersionNumber}`
    });

    roadmap.status = 'published';
    roadmap.currentPublishedVersion = newVersion._id;
    await roadmap.save();

    // Dynamically synchronize all active assignments so client changes reflect immediately
    const activeAssignments = await Assignment.find({
      roadmap: roadmap._id,
      status: { $in: ['active', 'completed', 'paused'] }
    });

    for (const asgn of activeAssignments) {
      asgn.publishedVersion = newVersion._id;
      await asgn.save();
      await syncAssignmentProgress(asgn, newVersion);
    }

    return res.json({
      success: true,
      message: `Roadmap published successfully as version ${nextVersionNumber}`,
      data: {
        roadmap,
        version: newVersion
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function duplicateRoadmap(req, res, next) {
  try {
    const { roadmapId } = req.params;
    const sourceRoadmap = await Roadmap.findById(roadmapId);

    if (!sourceRoadmap) {
      return res.status(404).json({
        success: false,
        message: 'Source roadmap not found.'
      });
    }

    const duplicatedRoadmap = await Roadmap.create({
      title: `${sourceRoadmap.title} (Copy)`,
      description: sourceRoadmap.description,
      category: sourceRoadmap.category,
      estimatedDuration: sourceRoadmap.estimatedDuration,
      visibility: 'private',
      accentColor: sourceRoadmap.accentColor,
      owner: req.user._id,
      status: 'draft',
      draftNodes: sourceRoadmap.draftNodes,
      draftEdges: sourceRoadmap.draftEdges
    });

    return res.status(201).json({
      success: true,
      message: 'Roadmap duplicated successfully',
      data: { roadmap: duplicatedRoadmap }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoadmap(req, res, next) {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findById(roadmapId);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found.'
      });
    }

    if (!roadmap.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this roadmap.'
      });
    }

    const activeAssignments = await Assignment.countDocuments({ roadmap: roadmapId, status: 'active' });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete roadmap with ${activeAssignments} active client assignment(s). Please archive or revoke assignments first.`
      });
    }

    await Roadmap.findByIdAndDelete(roadmapId);
    return res.json({
      success: true,
      message: 'Roadmap deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

