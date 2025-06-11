
export interface UserEquipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  price_per_day: number;
  rating: number;
  status: 'available' | 'booked' | 'unavailable';
  created_at: string;
  visible_on_map: boolean;
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
