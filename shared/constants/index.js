export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client'
};

export const ROADMAP_VISIBILITY = {
  PRIVATE: 'private',
  SHARED: 'shared'
};

export const ROADMAP_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

export const NODE_TYPES = {
  START: 'start',
  LEARNING: 'learning',
  PRACTICE: 'practice',
  QUIZ: 'quiz',
  PROJECT: 'project',
  COMPLETION: 'completion'
};

export const NODE_STATUS = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const ASSIGNMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  REVOKED: 'revoked'
};

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked'
};

export const RESOURCE_TYPES = {
  MARKDOWN: 'markdown',
  PDF: 'pdf',
  TEXT: 'text',
  LINK: 'link',
  VIDEO: 'video',
  BOOK: 'book',
  EXERCISE: 'exercise',
  FILE: 'file'
};

export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  TRUE_FALSE: 'true_false',
  MULTIPLE_CHOICE: 'multiple_choice'
};

export const DEFAULT_QUIZ_SETTINGS = {
  DEFAULT_QUESTION_COUNT: 20,
  DEFAULT_PASSING_PERCENTAGE: 80,
  DEFAULT_MAX_ATTEMPTS: 0 // 0 means unlimited
};
