import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { getEquipmentData } from "@/services/equipment/equipmentDataService";

export const useRelatedGear = (tags: Array<string>, category?: string) => {
  return useQuery({
    queryKey: ['relatedGear', tags, category],
    queryFn: async (): Promise<Equipment[]> => {
      if (!tags || tags.length === 0) return [];

      console.log(
        `🔍 Searching for gear related to tags: "${tags.join(', ')}" in category: ${category}`
      );

      try {
        const allEquipment = await getEquipmentData();

        const tagsLower = tags.map((t) => t.toLowerCase());
        const catNormalized = category
          ? category.toLowerCase().replace(/\s+/g, '-')
          : undefined;

        const related = allEquipment
          .filter((item) => {
            const nameLower = item.name.toLowerCase();
            const tagMatch = tagsLower.some((tag) => nameLower.includes(tag));
            const categoryMatch = catNormalized
              ? item.category.replace(/\s+/g, '-') === catNormalized
              : true;
            return tagMatch && categoryMatch;
          })
          .slice(0, 4);

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
