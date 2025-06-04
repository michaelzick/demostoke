export type PricingOption = {
  price: number;
  duration: string; // e.g., "day", "week", "month"
  id: string; // Unique identifier for the pricing option
};

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  price_per_day: number;
  pricing_options?: [PricingOption];
  rating: number;
  review_count: number;
  owner: GearOwner;
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
  status?: 'available' | 'booked' | 'unavailable';
  created_at?: string;
  updated_at?: string;
}

export interface GearOwner {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  responseRate: number;
  bio?: string;
  location?: string;
  memberSince?: string;
  personality?: string;
  shopId?: string;
  partyId?: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
}
