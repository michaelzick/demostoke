/**
 * Utility functions for extracting and processing text content from various formats
 */

import { detectContentFormat } from './contentFormatDetection';

/**
 * Safely strips HTML tags from content using DOMParser (XSS-safe)
 */
export const stripHtmlTags = (html: string): string => {
  try {
    // Use DOMParser for safe HTML parsing (prevents XSS)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || doc.documentElement.textContent || '';
  } catch (error) {
    console.warn('Failed to parse HTML content, falling back to text:', error);
    return html;
  }
};

/**
 * Removes markdown formatting syntax from text
 */
export const stripMarkdownFormatting = (markdown: string): string => {
  return markdown
    // Remove headers
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

/**
 * Counts words in text using proper regex for whitespace
 */
export const countWords = (text: string): number => {
  if (!text || typeof text !== 'string') return 0;
  
  const cleanText = text.trim();
  if (cleanText === '') return 0;
  
  // Split by whitespace (spaces, tabs, newlines) and filter out empty strings
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  return words.length;
};

/**
 * Extracts plain text from content, handling HTML, markdown, or plain text formats
 */
export const extractTextFromContent = (content: string): string => {
  if (!content || typeof content !== 'string') return '';
  
  const format = detectContentFormat(content);
  
  if (format === 'html') {
    return stripHtmlTags(content);
  } else if (format === 'markdown') {
    return stripMarkdownFormatting(content);
  } else {
    return content;
  }
};

/**
 * Gets comprehensive text statistics for content
 */
export const getContentStats = (content: string) => {
  const extractedText = extractTextFromContent(content);
  const wordCount = countWords(extractedText);
  const charCount = extractedText.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
  
  return {
    wordCount,
    charCount,
    readingTime,
    extractedText
  };
};