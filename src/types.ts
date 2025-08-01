
export interface Equipment {
  id: string;
  user_id?: string; // Add user_id property
  name: string;
  category: string;
  subcategory?: string; // Add optional subcategory field
  description: string;
  price_per_day: number;
  price_per_hour?: number; // Add price_per_hour
  price_per_week?: number; // Add price_per_week
  image_url: string;
  images?: string[]; // Add support for multiple images
  rating: number;
  review_count: number;
  damage_deposit?: number; // Add damage_deposit property
  owner: Owner;
  location: {
    lat: number;
    lng: number;
    address: string; // Changed from zip to address
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
    nextAvailableDate?: string; // Add optional nextAvailableDate
  };
  pricing_options: PricingOption[]; // Change from [PricingOption] to PricingOption[]
  status?: string; // Add optional status
  created_at?: string; // Add optional created_at
  updated_at?: string; // Add optional updated_at
  visible_on_map?: boolean; // Add optional visible_on_map
  is_featured?: boolean; // Add featured status
}

export interface Owner {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number; // Make sure reviewCount is included
  responseRate: number;
  location?: string;
  memberSince?: string;
  shopId?: string;
  partyId?: string;
  bio?: string;
  personality?: string;
  website?: string; // Add website field
}

export interface PricingOption {
  id: string;
  price: number;
  duration: string;
}

// Add User interface
export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
}

// Add UserProfile interface
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar_url: string | null;
  about?: string | null;
  phone?: string | null;
  address?: string | null;
  hero_image_url?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  created_at?: string;
  member_since?: string;
  website?: string | null; // Add website field
  displayRole?: string;
}

// Add GearOwner interface (alias for Owner for backward compatibility)
export interface GearOwner extends Owner {
  website?: string; // Explicitly include website property
}
