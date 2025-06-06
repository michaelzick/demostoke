
import { GearOwner } from "@/types";

export interface UserEquipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  price_per_day: number;
  rating: number;
  review_count: number;
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
    nextAvailableDate?: string;
  };
  status: 'available' | 'booked' | 'unavailable';
  created_at: string;
  updated_at: string;
  owner?: GearOwner;
}
