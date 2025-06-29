
import { Equipment } from "@/types";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";

// Convert Supabase equipment to Equipment type
export const convertSupabaseToEquipment = async (item: any): Promise<Equipment> => {
  console.log('Converting equipment item:', item.name, 'category:', item.category);

  // Fetch additional images from equipment_images table
  const additionalImages = await fetchEquipmentImages(item.id);
  const allImages = additionalImages.length > 0 ? additionalImages : (item.image_url ? [item.image_url] : []);

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    description: item.description || '',
    image_url: item.image_url || '',
    images: allImages, // Include the fetched images
    price_per_day: Number(item.price_per_day),
    price_per_hour: item.price_per_hour ? Number(item.price_per_hour) : undefined,
    price_per_week: item.price_per_week ? Number(item.price_per_week) : undefined,
    rating: Number(item.rating || 0),
    review_count: item.review_count || 0,
    owner: {
      id: item.user_id,
      name: item.profile_name || 'Owner', // Use the joined profile name or fallback to 'Owner'
      imageUrl: item.profile_avatar_url || 'https://api.dicebear.com/6.x/avataaars/svg?seed=' + item.user_id,
      rating: 4.8,
      reviewCount: 15, // Add reviewCount
      responseRate: 95,
    },
    location: {
      lat: Number(item.location_lat || 0),
      lng: Number(item.location_lng || 0),
      zip: item.location_zip || '',
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
    // Remove pricing_options dependency - we'll use the price columns directly
    pricing_options: [],
    status: item.status || 'available',
    damage_deposit: item.damage_deposit ? Number(item.damage_deposit) : undefined,
  };
};
