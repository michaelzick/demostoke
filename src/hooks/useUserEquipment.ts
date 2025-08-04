import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/helpers";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";
import { deduplicateImageUrls } from "@/utils/imageDeduplication";

interface UserEquipment {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string;
  price_per_day: number;
  price_per_hour?: number;
  price_per_week?: number;
  damage_deposit?: number;
  images: string[]; // Images array from equipment_images table
  rating: number;
  review_count: number;
  status: "available" | "booked" | "unavailable";
  created_at: string;
  updated_at: string;
  visible_on_map: boolean;
  location: {
    lat: number;
    lng: number;
    address: string; // Changed from zip to address
  };
  specifications: {
    size: string;
    weight: string;
    material: string;
    suitable: string;
  };
  availability: {
    available: boolean;
  };
}

export const useUserEquipment = (
  userId?: string,
  visibleOnly: boolean = false,
) => {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;

  return useQuery({
    queryKey: ["userEquipment", effectiveUserId, visibleOnly],
    queryFn: async (): Promise<UserEquipment[]> => {
      if (!effectiveUserId) {
        throw new Error("User ID is required");
      }

      let query = supabase
        .from("equipment")
        .select(
          `
          id,
          user_id,
          name,
          category,
          description,
          price_per_day,
          price_per_hour,
          price_per_week,
           damage_deposit,
           rating,
          review_count,
          status,
          created_at,
          updated_at,
          visible_on_map,
          location_lat,
          location_lng,
          location_address,
          size,
          weight,
          material,
          suitable_skill_level
        `,
        )
        .eq("user_id", effectiveUserId);

      // If visibleOnly is true, only return equipment that's visible on map
      if (visibleOnly) {
        query = query.eq("visible_on_map", true);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching user equipment:", error);
        throw error;
      }

      // Fetch additional images for each equipment item
      const equipmentWithImages = await Promise.all(
        (data || []).map(async (item) => {
          console.log(
            `=== FETCHING IMAGES FOR USER EQUIPMENT ${item.name} ===`,
          );
          console.log("Equipment ID:", item.id);

          // Fetch images from equipment_images table
          const additionalImages = await fetchEquipmentImages(item.id);
          console.log("Additional images fetched:", additionalImages);

          // Use images from equipment_images table or fallback to primary
          const allImages = deduplicateImageUrls(additionalImages);
          console.log("Images array:", allImages);
          console.log("=== END USER EQUIPMENT IMAGES FETCH ===");

          return {
            id: item.id,
            user_id: item.user_id,
            name: item.name,
            category: item.category,
            description: item.description || "",
            price_per_day: item.price_per_day,
            price_per_hour: item.price_per_hour,
            price_per_week: item.price_per_week,
            damage_deposit: item.damage_deposit,
            images: allImages, // Include all images
            rating: item.rating || 0,
            review_count: item.review_count || 0,
            status: item.status as "available" | "booked" | "unavailable",
            created_at: item.created_at,
            updated_at: item.updated_at,
            visible_on_map: item.visible_on_map,
            location: {
              lat: item.location_lat || 0,
              lng: item.location_lng || 0,
              address: item.location_address || "", // Changed from zip to address
            },
            specifications: {
              size: item.size || "",
              weight: item.weight || "",
              material: item.material || "",
              suitable: item.suitable_skill_level || "",
            },
            availability: {
              available: item.status === "available",
            },
            owner: {
              id: item.user_id,
              name: "User", // We don't have profile name in this query
            },
          };
        }),
      );

      return equipmentWithImages;
    },
    enabled: !!effectiveUserId,
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipmentId: string) => {
      const { data, error, count } = await supabase
        .from("equipment")
        .delete()
        .eq("id", equipmentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Equipment not found or you don't have permission to delete it");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userEquipment"] });
    },
  });
};

export const useUpdateEquipmentVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      equipmentId,
      visible,
    }: {
      equipmentId: string;
      visible: boolean;
    }) => {
      const { error } = await supabase
        .from("equipment")
        .update({ visible_on_map: visible })
        .eq("id", equipmentId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userEquipment"] });
    },
  });
};
