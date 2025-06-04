
export interface UserEquipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  price_per_day: number;
  rating: number;
  review_count: number;
  location_lat: number;
  location_lng: number;
  location_zip: string;
  size: string;
  weight: string;
  material: string;
  suitable_skill_level: string;
  status: 'available' | 'booked' | 'unavailable';
  created_at: string;
  updated_at: string;
}
