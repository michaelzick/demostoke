// Content sanitization utilities for display

// Sanitize text content for safe display
export const sanitizeForDisplay = (content: string): string => {
  if (!content) return '';
  
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>&"']/g, (match) => { // Escape dangerous characters
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return escapeMap[match] || match;
    })
    .trim();
};

// Sanitize arrays of strings
export const sanitizeArrayForDisplay = (items: string[]): string[] => {
  if (!Array.isArray(items)) return [];
  return items.map(item => sanitizeForDisplay(item));
};

// Sanitize quiz results object
export const sanitizeQuizResults = (results: any): any => {
  if (!results) return results;

  const sanitized = { ...results };

  // Sanitize recommendations
  if (sanitized.recommendations && Array.isArray(sanitized.recommendations)) {
    sanitized.recommendations = sanitized.recommendations.map((rec: any) => ({
      ...rec,
      title: sanitizeForDisplay(rec.title || ''),
      description: sanitizeForDisplay(rec.description || ''),
      suitableFor: sanitizeForDisplay(rec.suitableFor || ''),
      keyFeatures: sanitizeArrayForDisplay(rec.keyFeatures || [])
    }));
  }

  // Sanitize text fields
  if (sanitized.personalizedAdvice) {
    sanitized.personalizedAdvice = sanitizeForDisplay(sanitized.personalizedAdvice);
  }

  if (sanitized.skillDevelopment) {
    sanitized.skillDevelopment = sanitizeForDisplay(sanitized.skillDevelopment);
  }

  if (sanitized.locationConsiderations) {
    sanitized.locationConsiderations = sanitizeForDisplay(sanitized.locationConsiderations);
  }

  return sanitized;
};