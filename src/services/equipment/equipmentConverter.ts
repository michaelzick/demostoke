import type { Equipment } from "@/types";

export const convertDbEquipmentToFrontend = (
  dbEquipment: Record<string, unknown>,
): Equipment => {
  // Handle images array - only use equipment_images data (all_images)
  // No fallback to image_url field anymore
  let imagesArray: string[] = [];

  if (dbEquipment.all_images && Array.isArray(dbEquipment.all_images)) {
    imagesArray = dbEquipment.all_images as string[];
  } else if (dbEquipment.images && Array.isArray(dbEquipment.images)) {
    imagesArray = dbEquipment.images as string[];
  }

  // Primary image URL is the first image in the array, or empty string
  const primaryImageUrl = imagesArray.length > 0 ? imagesArray[0] : "";

  return {
    id: dbEquipment.id as string,
    name: dbEquipment.name as string,
    category: dbEquipment.category as string,
    subcategory: dbEquipment.subcategory as string,
    description: (dbEquipment.description as string) || "",
    image_url: primaryImageUrl,
    images: imagesArray, // This will now include all images for carousel functionality
    price_per_day: Number(dbEquipment.price_per_day as number),
    price_per_hour: dbEquipment.price_per_hour
      ? Number(dbEquipment.price_per_hour as number)
      : undefined,
    price_per_week: dbEquipment.price_per_week
      ? Number(dbEquipment.price_per_week as number)
      : undefined,
    rating: Number((dbEquipment.rating as number) || 0),
    review_count: (dbEquipment.review_count as number) || 0,
    damage_deposit: dbEquipment.damage_deposit
      ? Number(dbEquipment.damage_deposit)
      : undefined,
    owner: {
      id: dbEquipment.user_id as string,
      name: (dbEquipment.profiles as any)?.name || "Owner",
      imageUrl:
        (dbEquipment.profiles as any)?.avatar_url ||
        "https://api.dicebear.com/6.x/avataaars/svg?seed=" +
          dbEquipment.user_id,
      rating: 4.8,
      reviewCount: 15,
      responseRate: 95,
    },
    location: {
      lat: Number((dbEquipment.location_lat as number) || 0),
      lng: Number((dbEquipment.location_lng as number) || 0),
      address: (dbEquipment.location_address as string) || "", // Changed from zip to address
    },
    distance: 2.5,
    specifications: {
      size: (dbEquipment.size as string) || "",
      weight: (dbEquipment.weight as string) || "",
      material: (dbEquipment.material as string) || "",
      suitable: (dbEquipment.suitable_skill_level as string) || "",
    },
    availability: {
      available: (dbEquipment.status as string) === "available",
    },
    pricing_options: [],
    status: (dbEquipment.status as string) || "available",
    created_at: dbEquipment.created_at as string,
    updated_at: dbEquipment.updated_at as string,
    visible_on_map:
      (dbEquipment.visible_on_map as boolean) !== undefined
        ? (dbEquipment.visible_on_map as boolean)
        : true,
  };
};

// Export the function with the expected name for backward compatibility
export const convertSupabaseToEquipment = async (
  dbEquipment: Record<string, unknown>,
): Promise<Equipment> => {
  return convertDbEquipmentToFrontend(dbEquipment);
};
