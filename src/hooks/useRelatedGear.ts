import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { getEquipmentData } from "@/services/equipment/equipmentDataService";

// Fetch gear related to the provided tags. If a tag maps to an equipment
// category (e.g. "surfboards" or "mountain bikes"), gear from that category is
// prioritized. Otherwise, tags are matched against gear names.
export const useRelatedGear = (tags: Array<string>) => {
  return useQuery({
    queryKey: ["relatedGear", tags],
    queryFn: async (): Promise<Equipment[]> => {
      if (!tags || tags.length === 0) return [];

      console.log(
        `🔍 Searching for gear related to tags: "${tags.join(", ")}"`
      );

      try {
        const allEquipment = await getEquipmentData();

        const tagsLower = tags.map((t) => t.toLowerCase());
        const tagSlugs = tagsLower.map((t) => t.replace(/\s+/g, "-"));

        const categoryMatches: Equipment[] = [];
        const nameMatches: Equipment[] = [];

        for (const item of allEquipment) {
          const itemCategory = item.category.toLowerCase();
          const nameLower = item.name.toLowerCase();

          const isCategoryMatch = tagSlugs.some((tag) => tag === itemCategory);
          if (isCategoryMatch) {
            categoryMatches.push(item);
            continue;
          }

          const hasTagInName = tagsLower.some((tag) => nameLower.includes(tag));
          if (hasTagInName) {
            nameMatches.push(item);
          }
        }

        const related = [...categoryMatches, ...nameMatches].slice(0, 4);

        console.log(`✅ Found ${related.length} related gear items`);
        return related;
      } catch (error) {
        console.error('❌ Error searching for related gear:', error);
        return [];
      }
    },
    enabled: tags.length > 0,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
};
