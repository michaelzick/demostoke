import { useQuery } from "@tanstack/react-query";
import { featuredGearService } from "@/services/featuredGearService";

export const useFeaturedEquipment = () => {
  return useQuery({
    queryKey: ['featuredEquipment'],
    queryFn: () => featuredGearService.getFeaturedEquipment(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};