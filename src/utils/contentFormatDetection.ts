export type ContentFormat = 'html' | 'markdown' | 'plain';

export const detectContentFormat = (content: string): ContentFormat => {
  // Check for HTML tags first
  const htmlTagRegex = /<\s*(h[1-6]|p|div|strong|em|b|i|ul|ol|li|blockquote|a)\b[^>]*>/i;
  if (htmlTagRegex.test(content)) {
    return 'html';
  }

  // Check for markdown patterns
  const markdownPatterns = [
    /\*\*[^*]+\*\*/,  // **bold**
    /\*[^*]+\*/,      // *italic*
    /\[[^\]]+\]\([^)]+\)/, // [link](url)
    /#{1,6}\s+/,      // # headers
  ];

  if (markdownPatterns.some(pattern => pattern.test(content))) {
    return 'markdown';
  }

  return 'plain';
};