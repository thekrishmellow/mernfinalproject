import { Resource } from '../models/Resource.js';
import { Assignment } from '../models/Assignment.js';
import { NodeProgress } from '../models/NodeProgress.js';
import { StorageService } from '../services/storage/storageService.js';

export async function createResource(req, res, next) {
  try {
    const { title, description, type, content, externalUrl, estimatedMinutes, tags, isProtected } = req.body;

    let storageKey = '';
    let originalFilename = '';
    let mimeType = '';
    let sizeBytes = 0;

    if (req.file) {
      const saved = await StorageService.saveFile(req.file);
      storageKey = saved.storageKey;
      originalFilename = saved.originalFilename;
      mimeType = saved.mimeType;
      sizeBytes = saved.sizeBytes;
    }

    const resource = await Resource.create({
      title,
      description,
      type: type || (req.file ? (req.file.mimetype === 'application/pdf' ? 'pdf' : 'file') : 'markdown'),
      content: content || '',
      externalUrl: externalUrl || '',
      storageKey,
      originalFilename,
      mimeType,
      sizeBytes,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : 10,
      tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : (tags || []),
      isProtected: isProtected !== undefined ? isProtected === 'true' || isProtected === true : true,
      uploader: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
}

export async function getResources(req, res, next) {
  try {
    const { type, search, page = 1, limit = 50 } = req.query;
    // Strict isolation: only show resources uploaded by this admin
    const query = {
      uploader: req.user._id
    };

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate('uploader', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    return res.json({
      success: true,
      data: {
        resources,
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

export async function getResourceById(req, res, next) {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId).populate('uploader', 'name email');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.'
      });
    }

    if (req.user.role === 'admin' && !resource.uploader.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this resource.'
      });
    }

    return res.json({
      success: true,
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateResource(req, res, next) {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.'
      });
    }

    if (!resource.uploader.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this resource.'
      });
    }

    const { title, description, content, externalUrl, estimatedMinutes, tags, isProtected } = req.body;

    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (content !== undefined) resource.content = content;
    if (externalUrl !== undefined) resource.externalUrl = externalUrl;
    if (estimatedMinutes !== undefined) resource.estimatedMinutes = estimatedMinutes;
    if (isProtected !== undefined) resource.isProtected = isProtected;
    if (tags !== undefined) {
      resource.tags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags;
    }

    await resource.save();

    return res.json({
      success: true,
      message: 'Resource updated successfully',
      data: { resource }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteResource(req, res, next) {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.'
      });
    }

    if (!resource.uploader.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this resource.'
      });
    }

    if (resource.storageKey) {
      await StorageService.deleteFile(resource.storageKey);
    }

    await Resource.findByIdAndDelete(resourceId);

    return res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}


/**
 * Streams protected resource file with authorization verification
 */
export async function downloadProtectedResource(req, res, next) {
  try {
    const { resourceId } = req.params;
    const resource = await Resource.findById(resourceId);

    if (!resource || !resource.storageKey) {
      return res.status(404).json({
        success: false,
        message: 'Resource file not found.'
      });
    }

    // Role & assignment authorization check
    if (req.user.role !== 'admin') {
      // Learner must have an active assignment referencing this resource on an unlocked node
      const assignments = await Assignment.find({
        client: req.user._id,
        status: { $in: ['active', 'completed'] }
      }).populate('publishedVersion');

      let isAuthorized = false;

      for (const assignment of assignments) {
        if (!assignment.publishedVersion) continue;

        // Check if any node in this version contains this resource
        const containingNodes = assignment.publishedVersion.nodes.filter(
          (n) => n.resourceIds && n.resourceIds.map((id) => id.toString()).includes(resourceId)
        );

        if (containingNodes.length > 0) {
          // Check if any of these nodes are unlocked for the learner
          const progressRecords = await NodeProgress.find({
            assignment: assignment._id,
            nodeId: { $in: containingNodes.map((n) => n.id) },
            status: { $in: ['available', 'in_progress', 'completed'] }
          });

          if (progressRecords.length > 0) {
            isAuthorized = true;
            break;
          }
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have an active assignment with an unlocked node granting access to this resource.'
        });
      }
    }

    const { fullPath, createReadStream } = await StorageService.getFile(resource.storageKey);

    const isPdf = resource.mimeType === 'application/pdf';
    res.setHeader('Content-Type', resource.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `${isPdf ? 'inline' : 'attachment'}; filename="${encodeURIComponent(resource.originalFilename || 'resource')}"`
    );

    const stream = createReadStream();
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
}
