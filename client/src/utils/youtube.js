/**
 * YouTube Utility functions for parsing, validating, and generating embed links
 * and thumbnails for video learning resources.
 */

export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex for various YouTube URL forms:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/embed/ID
  // - youtube.com/shorts/ID
  // - youtube.com/live/ID
  // - youtube.com/v/ID
  // - youtube-nocookie.com/embed/ID
  const regExp =
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback for query param ?v= or embed src
  try {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    const candidate = srcMatch ? srcMatch[1] : trimmed;
    const urlObj = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
    const v = urlObj.searchParams.get('v');
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
      return v;
    }
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && /^[a-zA-Z0-9_-]{11}$/.test(lastPart)) {
      return lastPart;
    }
  } catch (e) {
    // not a valid URL
  }

  return null;
}

export function getYouTubeThumbnail(videoId, quality = 'hq') {
  if (!videoId) return '';
  // quality: 'maxres' (1280x720) or 'hq' (480x360)
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId, options = {}) {
  if (!videoId) return '';
  const { autoplay = 0, start = 0 } = options;
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : ''
  });
  if (start > 0) {
    params.set('start', start.toString());
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function isYouTubeUrl(url) {
  return Boolean(extractYouTubeId(url));
}
