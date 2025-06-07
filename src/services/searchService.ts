import { Equipment } from "@/types";
import { mockEquipment } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

// Convert Supabase equipment to Equipment type
const convertSupabaseToEquipment = (item: any): Equipment => {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description || '',
    image_url: item.image_url || '',
    price_per_day: Number(item.price_per_day),
    rating: Number(item.rating || 0),
    review_count: item.review_count || 0,
    owner: {
      id: item.user_id,
      name: 'Owner', // We'd need to join with profiles to get real name
      imageUrl: 'https://api.dicebear.com/6.x/avataaars/svg?seed=' + item.user_id,
      rating: 4.8,
      responseRate: 95,
    },
    location: {
      lat: Number(item.location_lat || 34.0522),
      lng: Number(item.location_lng || -118.2437),
      zip: item.location_zip || 'Los Angeles, CA',
    },
    distance: 2.5, // Default distance
    specifications: {
      size: item.size || '',
      weight: item.weight || '',
      material: item.material || '',
      suitable: item.suitable_skill_level || '',
    },
    availability: {
      available: item.status === 'available',
    },
    pricing_options: [
      { id: '1', price: Number(item.price_per_day), duration: 'day' }
    ],
    status: item.status || 'available',
  };
};

// Get equipment data based on mock data preference
const getEquipmentData = async (useMockData: boolean): Promise<Equipment[]> => {
  if (useMockData) {
    return mockEquipment;
  }

  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('status', 'available');

    if (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }

    return (data || []).map(convertSupabaseToEquipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
};

// Simulated AI-based search function
export const searchEquipmentWithNLP = async (query: string, useMockData: boolean = true): Promise<Equipment[]> => {
  console.log(`Processing natural language query: "${query}" with ${useMockData ? 'mock' : 'real'} data`);

  // Get the appropriate dataset
  const equipmentData = await getEquipmentData(useMockData);

  if (equipmentData.length === 0) {
    return [];
  }

  // Convert query to lowercase for easier matching
  const lowerQuery = query.toLowerCase();

  // Extract potential category matches
  const categoryMatches: Record<string, number> = {
    snowboards: 0,
    skis: 0,
    surfboards: 0,
    sups: 0,
    "mountain-bikes": 0,
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
  if (lowerQuery.includes("bike") || lowerQuery.includes("mountain bike") || lowerQuery.includes("mtb") || lowerQuery.includes("cycling")) {
    categoryMatches["mountain-bikes"] += 3;
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

  // Check if any specific categories were mentioned
  const categoriesRequested = Object.entries(categoryMatches)
    .filter(([_, score]) => score > 0)
    .map(([category]) => category);

  // Filter equipment based on extracted info
  return equipmentData.filter(item => {
    // If specific categories were mentioned, only show those categories
    if (categoriesRequested.length > 0 && !categoriesRequested.includes(item.category)) {
      return false;
    }

    let score = 0;

    // Category matching (only relevant if categories were specified)
    if (categoryMatches[item.category] > 0) {
      score += categoryMatches[item.category];
    } else if (categoriesRequested.length === 0) {
      // If no categories were specified, don't filter by category
      score += 1;
    }

    // Location matching
    if (locationMatches.length > 0) {
      if (locationMatches.some(loc =>
        item.location.zip.toLowerCase().includes(loc.toLowerCase()))) {
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
        a.location.zip.toLowerCase().includes(loc.toLowerCase()));
      const bLocationMatch = locationMatches.some(loc =>
        b.location.zip.toLowerCase().includes(loc.toLowerCase()));

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

// Export the equipment data fetcher for use in other components
export { getEquipmentData };
