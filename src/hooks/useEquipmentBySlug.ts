import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { getEquipmentData } from "@/services/equipment/equipmentDataService";
import { slugify } from "@/utils/slugify";

export const useEquipmentBySlug = (category: string, slug: string) => {
  return useQuery({
    queryKey: ["equipment", category, slug],
    queryFn: async (): Promise<Equipment | null> => {
      if (!category || !slug) {
        throw new Error("Category and slug are required");
      }
      const data = await getEquipmentData();
      const item = data.find(
        (e) => e.category === category && slugify(e.name) === slug,
      );
      return item || null;
    },
  });
};
