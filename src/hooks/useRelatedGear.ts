
import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { searchEquipmentWithNLP } from "@/services/searchService";

export const useRelatedGear = (blogTitle: string) => {
  return useQuery({
    queryKey: ['relatedGear', blogTitle],
    queryFn: async (): Promise<Equipment[]> => {
      if (!blogTitle) return [];

      console.log(`🔍 Searching for gear related to blog post: "${blogTitle}"`);

      // Extract key terms from the blog title for better search
      const searchQuery = extractSearchTerms(blogTitle);
      console.log(`🔍 Extracted search terms: "${searchQuery}"`);

      try {
        // Use the existing AI-enhanced search
        const results = await searchEquipmentWithNLP(searchQuery);

        // Convert AISearchResult[] to Equipment[] and limit to 2 items
        const equipment = results.map(result => ({
          id: result.id,
          name: result.name,
          category: result.category,
          description: result.description,
          price_per_day: result.price_per_day,
          rating: result.rating,
          review_count: result.review_count || 0,
          image_url: result.image_url,
          images: result.images,
          owner: result.owner,
          location: result.location,
          distance: 0, // Default distance for related gear
          specifications: result.specifications,
          availability: {
            available: true, // Default to available for related gear display
            nextAvailableDate: undefined
          },
          pricing_options: [] // Default empty array for pricing options
        })).slice(0, 4);

        console.log(`✅ Found ${equipment.length} related gear items`);
        return equipment;
      } catch (error) {
        console.error('❌ Error searching for related gear:', error);
        return [];
      }
    },
    enabled: !!blogTitle,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
};

// Extract meaningful search terms from blog title
const extractSearchTerms = (title: string): string => {
  // Convert to lowercase and remove common words
  const commonWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'review', 'guide', 'tips', 'how', 'best', 'top', 'ultimate', 'complete', 'beginner',
    'advanced', 'pro', 'vs', 'versus', '2024', '2023', 'new', 'latest'
  ];

  // Split title into words and filter out common words
  const words = title.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));

  // Join the meaningful words back together
  return words.slice(0, 5).join(' '); // Limit to first 5 meaningful words
};
