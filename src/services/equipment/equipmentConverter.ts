
import type { Equipment } from "@/types";

export const convertDbEquipmentToFrontend = (dbEquipment: any): Equipment => {
  return {
    id: dbEquipment.id,
    name: dbEquipment.name,
    category: dbEquipment.category,
    subcategory: dbEquipment.subcategory,
    description: dbEquipment.description || '',
    image_url: dbEquipment.image_url || '',
    images: dbEquipment.images || [],
    price_per_day: Number(dbEquipment.price_per_day),
    price_per_hour: dbEquipment.price_per_hour ? Number(dbEquipment.price_per_hour) : undefined,
    price_per_week: dbEquipment.price_per_week ? Number(dbEquipment.price_per_week) : undefined,
    rating: Number(dbEquipment.rating || 0),
    review_count: dbEquipment.review_count || 0,
    damage_deposit: dbEquipment.damage_deposit ? Number(dbEquipment.damage_deposit) : undefined,
    owner: {
      id: dbEquipment.user_id,
      name: dbEquipment.profiles?.name || 'Owner',
      imageUrl: dbEquipment.profiles?.avatar_url || 'https://api.dicebear.com/6.x/avataaars/svg?seed=' + dbEquipment.user_id,
      rating: 4.8,
      reviewCount: 15,
      responseRate: 95,
    },
    location: {
      lat: Number(dbEquipment.location_lat || 0),
      lng: Number(dbEquipment.location_lng || 0),
      address: dbEquipment.location_address || '', // Changed from zip to address
    },
    distance: 2.5,
    specifications: {
      size: dbEquipment.size || '',
      weight: dbEquipment.weight || '',
      material: dbEquipment.material || '',
      suitable: dbEquipment.suitable_skill_level || '',
    },
    availability: {
      available: dbEquipment.status === 'available',
    },
    pricing_options: [],
    status: dbEquipment.status || 'available',
    created_at: dbEquipment.created_at,
    updated_at: dbEquipment.updated_at,
    visible_on_map: dbEquipment.visible_on_map !== undefined ? dbEquipment.visible_on_map : true,
  };
};
