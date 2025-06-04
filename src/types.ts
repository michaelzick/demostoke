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
  imageUrl: string;
  pricePerDay: number;
  pricingOptions: [PricingOption];
  rating: number;
  reviewCount: number;
  owner: GearOwner;
  location: {
    lat: number;
    lng: number;
    name: string;
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
