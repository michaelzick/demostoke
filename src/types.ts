
export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  owner: {
    id: string;
    name: string;
    imageUrl: string;
    rating: number;
    responseRate: number;
  };
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

export interface User {
  id: string;
  name?: string;
  email?: string;
  imageUrl?: string;
}
