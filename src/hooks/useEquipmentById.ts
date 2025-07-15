import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";
import { deduplicateImageUrls } from "@/utils/imageDeduplication";

export const useEquipmentById = (id: string) => {
  return useQuery({
    queryKey: ["equipment", id],
    queryFn: async (): Promise<Equipment | null> => {
      if (!id) {
        throw new Error("Equipment ID is required");
      }

      console.log("=== FETCHING EQUIPMENT BY ID ===");
      console.log("Equipment ID:", id);

      const { data, error } = await supabase
        .from("equipment")
        .select(
          `
          *,
          profiles!equipment_user_id_fkey (
            name,
            avatar_url
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching equipment:", error);
        throw error;
      }

      if (!data) {
        return null;
      }

      // Log the raw data to see what we're getting from the database
      console.log("Raw equipment data from database:", data);
      console.log("Profile data:", data.profiles);
      console.log("Damage deposit from database:", data.damage_deposit);
      console.log("Primary image URL:", data.image_url);
      console.log("Price per day:", data.price_per_day);
      console.log("Price per hour:", data.price_per_hour);
      console.log("Price per week:", data.price_per_week);

      // Fetch images from equipment_images table
      console.log("Fetching images for equipment ID:", data.id);
      const images = await fetchEquipmentImages(data.id);
      console.log("Images fetched:", images);

      const allImages = deduplicateImageUrls(images);
      console.log("Images array:", allImages);

      // Convert to Equipment type with proper location mapping
      const equipment = {
        id: data.id,
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        description: data.description || "",
        image_url: allImages.length > 0 ? allImages[0] : "",
        images: allImages,
        price_per_day: Number(data.price_per_day),
        price_per_hour:
          data.price_per_hour !== null && data.price_per_hour !== undefined
            ? Number(data.price_per_hour)
            : undefined,
        price_per_week:
          data.price_per_week !== null && data.price_per_week !== undefined
            ? Number(data.price_per_week)
            : undefined,
        rating: Number(data.rating || 0),
        review_count: data.review_count || 0,
        damage_deposit: data.damage_deposit
          ? Number(data.damage_deposit)
          : undefined,
        owner: {
          id: data.user_id,
          name: data.profiles?.name || "Owner",
          imageUrl:
            data.profiles?.avatar_url ||
            "https://api.dicebear.com/6.x/avataaars/svg?seed=" + data.user_id,
          rating: 4.8,
          reviewCount: 15,
          responseRate: 95,
        },
        location: {
          lat: Number(data.location_lat || 0),
          lng: Number(data.location_lng || 0),
          address: data.location_address || "", // Changed from zip to address
        },
        distance: 2.5,
        specifications: {
          size: data.size || "",
          weight: data.weight || "",
          material: data.material || "",
          suitable: data.suitable_skill_level || "",
        },
        availability: {
          available: data.status === "available",
        },
        // Remove pricing_options dependency
        pricing_options: [],
        status: data.status || "available",
        created_at: data.created_at,
        updated_at: data.updated_at,
        visible_on_map:
          data.visible_on_map !== undefined ? data.visible_on_map : true,
        user_id: data.user_id, // Include user_id for ownership validation
      };

      console.log("Mapped equipment object:", equipment);
      console.log("=== END EQUIPMENT FETCH ===");

      return equipment;
    },
    enabled: !!id,
  });
};
