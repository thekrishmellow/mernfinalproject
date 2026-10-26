import { describe, it, expect } from 'vitest';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '../../src/utils/youtube.js';
import { createQuizSchema } from '../../src/validators/quizValidator.js';

describe('YouTube Utility & Quiz Timer Validation', () => {
  it('extracts video ID correctly from standard and short YouTube URLs', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://invalid.com')).toBeNull();
    expect(extractYouTubeId('')).toBeNull();
  });

  it('generates privacy-enhanced embed URL and thumbnail', () => {
    const embedUrl = getYouTubeEmbedUrl('dQw4w9WgXcQ');
    expect(embedUrl).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(embedUrl).toContain('modestbranding=1');

    const thumb = getYouTubeThumbnail('dQw4w9WgXcQ');
    expect(thumb).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('validates quiz creation schema with timeLimitMinutes', () => {
    const validPayload = {
      title: 'Timed Assessment',
      questions: [
        {
          id: 'q1',
          prompt: 'What is 2+2?',
          type: 'single_choice',
          options: [{ id: 'A', text: '4' }, { id: 'B', text: '5' }],
          correctAnswers: ['A'],
          points: 1
        }
      ],
      passingPercentage: 75,
      defaultQuestionsPerAttempt: 10,
      timeLimitMinutes: 25
    };

    const parsed = createQuizSchema.body.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    expect(parsed.data.timeLimitMinutes).toBe(25);
  });
});
