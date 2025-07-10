export interface Equipment {
  id: string;
  user_id?: string; // Add user_id for admin editing functionality
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  image_url: string;
  images?: string[];
  price_per_day: number;
  price_per_hour?: number; // Add price_per_hour
  price_per_week?: number; // Add price_per_week
  rating: number;
  review_count: number;
  owner: {
    id: string;
    name: string;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    responseRate: number;
  };
  location: {
    lat: number;
    lng: number;
    zip: string;
  };
  distance: number;
  specifications: {
    size: string;
    weight: string;
    material: string;
    suitable: string;
  };
  availability: {
    available: boolean;
    nextAvailableDate?: string;
  };
  pricing_options?: PricingOption[]; // Keep for backward compatibility but will be deprecated
  status?: string;
  created_at?: string;
  updated_at?: string;
  visible_on_map?: boolean;
  damage_deposit?: number;
}

export interface PricingOption {
  id: string;
  price: number;
  duration: string;
}

export interface AppSettings {
  id: string;
  created_at: string;
  updated_at: string;
  map_display_mode: 'all_equipment' | 'user_locations';
}
