/** Lightweight DB row sent to the edge function */
export interface GearCandidate {
  id: string;
  name: string;
  description: string | null;
  suitable_skill_level: string | null;
  price_per_day: number;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
}

/** Shape of the edge function response */
export interface QuizAnalysisResult {
  matchedIds: string[];
  recommendations: QuizRecommendation[];
  personalizedAdvice?: string;
  skillDevelopment?: string;
  locationConsiderations?: string;
}

export interface QuizRecommendation {
  category: string;
  title: string;
  description: string;
  keyFeatures: string[];
  suitableFor: string;
}
