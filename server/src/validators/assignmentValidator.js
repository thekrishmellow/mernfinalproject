import { z } from 'zod';

export const assignSingleClientSchema = {
  body: z.object({
    clientId: z.string().optional(),
    email: z.string().email().optional(),
    roadmapId: z.string().min(1, 'Roadmap ID is required'),
    publishedVersionId: z.string().optional()
  }).refine((data) => data.clientId || data.email, {
    message: 'Either clientId or email must be provided'
  })
};

export const bulkAssignSchema = {
  body: z.object({
    roadmapId: z.string().min(1, 'Roadmap ID is required'),
    clientIds: z.array(z.string()).optional().default([]),
    emails: z.array(z.string().email()).optional().default([])
  }).refine((data) => data.clientIds.length > 0 || data.emails.length > 0, {
    message: 'At least one clientId or email must be provided'
  })
};
