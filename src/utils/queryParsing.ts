export interface ParsedQuery {
  baseQuery: string;
  location?: string;
  nearMe: boolean;
}

export const parseQueryForLocation = (query: string): ParsedQuery => {
  const lower = query.toLowerCase();
  const nearMe = lower.includes('near me');

  // Extract part after " in " if present
  const inMatch = query.match(/\bin\s+([^]+)/i);
  let location: string | undefined;
  let baseQuery = query;
  if (inMatch) {
    location = inMatch[1].trim();
    baseQuery = query.slice(0, inMatch.index).trim();
  }

  if (nearMe) {
    baseQuery = baseQuery.replace(/near me/ig, '').trim();
  }

  return {
    baseQuery: baseQuery.trim(),
    location,
    nearMe,
  };
};
