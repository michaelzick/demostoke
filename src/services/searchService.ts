
import { Equipment } from "@/types";
import { mockEquipment } from "@/lib/mockData";

// Simulated AI-based search function
export const searchEquipmentWithNLP = async (query: string): Promise<Equipment[]> => {
  // In a real implementation, this would call an OpenAI API to process the natural language query
  // For now, we'll simulate the behavior by parsing the query ourselves
  
  console.log(`Processing natural language query: "${query}"`);
  
  // Convert query to lowercase for easier matching
  const lowerQuery = query.toLowerCase();
  
  // Extract potential category matches
  const categoryMatches: Record<string, number> = {
    snowboards: 0,
    skis: 0,
    surfboards: 0,
    sups: 0,
    skateboards: 0,
  };
  
  // Check for category keywords
  if (lowerQuery.includes("snow") || lowerQuery.includes("snowboard")) {
    categoryMatches.snowboards += 3;
  }
  if (lowerQuery.includes("ski") || lowerQuery.includes("skiing")) {
    categoryMatches.skis += 3;
  }
  if (lowerQuery.includes("surf") || lowerQuery.includes("surfboard") || lowerQuery.includes("waves")) {
    categoryMatches.surfboards += 3;
  }
  if (lowerQuery.includes("paddle") || lowerQuery.includes("sup") || lowerQuery.includes("stand up paddle")) {
    categoryMatches.sups += 3;
  }
  if (lowerQuery.includes("skate") || lowerQuery.includes("skateboard")) {
    categoryMatches.skateboards += 3;
  }
  
  // Look for location keywords
  const locations = [
    "Hollywood", "Downtown LA", "Santa Monica", "Venice",
    "Beverly Hills", "Westwood", "Silver Lake", "Echo Park", 
    "Koreatown", "Culver City", "Brentwood", "Bel Air",
    "Pasadena", "Glendale", "Burbank"
  ];
  
  const locationMatches = locations.filter(location => 
    lowerQuery.includes(location.toLowerCase())
  );
  
  // Look for skill level keywords
  const isBeginnerSearch = lowerQuery.includes("beginner") || lowerQuery.includes("new") || lowerQuery.includes("learning");
  const isIntermediateSearch = lowerQuery.includes("intermediate");
  const isAdvancedSearch = lowerQuery.includes("advanced") || lowerQuery.includes("expert") || lowerQuery.includes("pro");
  
  // Add a short delay to simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter equipment based on extracted info
  return mockEquipment.filter(item => {
    let score = 0;
    
    // Category matching
    if (categoryMatches[item.category] > 0) {
      score += categoryMatches[item.category];
    } else if (Object.values(categoryMatches).every(val => val === 0)) {
      // If no categories were specified, don't filter by category
      score += 1;
    }
    
    // Location matching
    if (locationMatches.length > 0) {
      if (locationMatches.some(loc => 
        item.location.name.toLowerCase().includes(loc.toLowerCase()))) {
        score += 2;
      }
    } else {
      // If no locations were specified, don't filter by location
      score += 1;
    }
    
    // Description and name matching
    if (item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)) {
      score += 2;
    }
    
    // Skill level matching
    if (isBeginnerSearch && item.specifications.suitable.toLowerCase().includes("beginner")) {
      score += 2;
    }
    if (isIntermediateSearch && item.specifications.suitable.toLowerCase().includes("intermediate")) {
      score += 2;
    }
    if (isAdvancedSearch && item.specifications.suitable.toLowerCase().includes("advanced")) {
      score += 2;
    }
    
    return score > 0;
  }).sort((a, b) => {
    // Sort by location match
    if (locationMatches.length > 0) {
      const aLocationMatch = locationMatches.some(loc => 
        a.location.name.toLowerCase().includes(loc.toLowerCase()));
      const bLocationMatch = locationMatches.some(loc => 
        b.location.name.toLowerCase().includes(loc.toLowerCase()));
      
      if (aLocationMatch && !bLocationMatch) return -1;
      if (!aLocationMatch && bLocationMatch) return 1;
    }
    
    // Then sort by category relevance
    const aCategoryScore = categoryMatches[a.category] || 0;
    const bCategoryScore = categoryMatches[b.category] || 0;
    if (aCategoryScore !== bCategoryScore) {
      return bCategoryScore - aCategoryScore;
    }
    
    // Finally sort by rating
    return b.rating - a.rating;
  });
};
