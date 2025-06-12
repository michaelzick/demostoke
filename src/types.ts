export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  price_per_day: number;
  image_url: string;
  images?: string[]; // Add support for multiple images
  rating: number;
  review_count: number;
  owner: Owner;
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
  };
  pricing_options: [PricingOption];
}
export interface Owner {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  responseRate: number;
  location?: string;
  memberSince?: string;
  shopId?: string;
  partyId?: string;
  bio?: string;
  personality?: string;
}

export interface PricingOption {
  id: string;
  price: number;
  duration: string;
}
