
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
