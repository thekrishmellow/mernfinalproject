import { z } from 'zod';

export const createRoadmapSchema = {
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(150),
    description: z.string().optional().default(''),
    category: z.string().optional().default('General'),
    estimatedDuration: z.string().optional().default('4 weeks'),
    visibility: z.enum(['private', 'shared']).default('private'),
    accentColor: z.string().optional().default('#3b82f6')
  })
};

export const updateRoadmapSchema = {
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    estimatedDuration: z.string().optional(),
    visibility: z.enum(['private', 'shared']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    accentColor: z.string().optional()
  })
};

export const saveDraftSchema = {
  body: z.object({
    nodes: z.array(z.any()).default([]),
    edges: z.array(z.any()).default([])
  })
};

export const publishRoadmapSchema = {
  body: z.object({
    publicationNotes: z.string().optional().default('')
  })
};
