
export interface UserEquipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  images?: string[]; // Add support for multiple images
  price_per_day: number;
  rating: number;
  review_count: number;
  status: 'available' | 'booked' | 'unavailable';
  created_at: string;
  updated_at: string;
  visible_on_map: boolean;
  damage_deposit?: number; // Add damage_deposit property
  suitable_skill_level?: string; // Add suitable_skill_level property
  size?: string; // Add size property
  pricing_options?: Array<{ // Add pricing_options property
    id?: string;
    price: number;
    duration: string;
  }>;
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
