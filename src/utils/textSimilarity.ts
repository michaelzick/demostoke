// Fuzzy string matching utilities for better search results

// Calculate Levenshtein distance between two strings
export const calculateLevenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

// Calculate similarity percentage (0-100)
export const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  
  const distance = calculateLevenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return Math.max(0, ((maxLength - distance) / maxLength) * 100);
};

// Check if two strings are fuzzy matches (adjustable threshold)
export const isFuzzyMatch = (str1: string, str2: string, threshold: number = 70): boolean => {
  return calculateSimilarity(str1, str2) >= threshold;
};

// Find best fuzzy match from an array of strings
export const findBestFuzzyMatch = (
  target: string, 
  candidates: string[], 
  threshold: number = 70
): { match: string; similarity: number } | null => {
  let bestMatch = null;
  let bestSimilarity = 0;

  for (const candidate of candidates) {
    const similarity = calculateSimilarity(target, candidate);
    if (similarity >= threshold && similarity > bestSimilarity) {
      bestMatch = candidate;
      bestSimilarity = similarity;
    }
  }

  return bestMatch ? { match: bestMatch, similarity: bestSimilarity } : null;
};

// Enhanced fuzzy search that handles partial matches and word order
export const fuzzySearchScore = (searchTerm: string, targetText: string): number => {
  const search = searchTerm.toLowerCase().trim();
  const target = targetText.toLowerCase().trim();
  
  // Exact match gets highest score
  if (target.includes(search)) {
    return 100;
  }
  
  // Word-by-word fuzzy matching
  const searchWords = search.split(/\s+/);
  const targetWords = target.split(/\s+/);
  
  let totalScore = 0;
  let matchedWords = 0;
  
  for (const searchWord of searchWords) {
    let bestWordScore = 0;
    
    for (const targetWord of targetWords) {
      const similarity = calculateSimilarity(searchWord, targetWord);
      bestWordScore = Math.max(bestWordScore, similarity);
    }
    
    // Only count words that meet minimum similarity threshold
    if (bestWordScore >= 60) {
      totalScore += bestWordScore;
      matchedWords++;
    }
  }
  
  // Return average score of matched words, penalized by unmatchedwords
  if (matchedWords === 0) return 0;
  
  const averageScore = totalScore / matchedWords;
  const matchRatio = matchedWords / searchWords.length;
  
  return averageScore * matchRatio;
};