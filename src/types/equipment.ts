
export interface UserEquipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  images?: string[]; // Add support for multiple images
  price_per_day: number;
  price_per_hour?: number; // Add price_per_hour
  price_per_week?: number; // Add price_per_week
  rating: number;
  review_count: number;
  status: 'available' | 'booked' | 'unavailable';
  created_at: string;
  updated_at: string;
  visible_on_map: boolean;
  damage_deposit?: number; // Add damage_deposit property
  location: {
    lat: number;
    lng: number;
    zip: string;
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
