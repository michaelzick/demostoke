
import { UserEquipment } from "@/types/equipment";

// Mock data for the current user's equipment
export const mockUserEquipment: UserEquipment[] = [
  {
    id: "user-equip-1",
    name: "Burton Custom X Snowboard",
    category: "snowboards",
    description: "High-performance snowboard perfect for intermediate to advanced riders. Features a responsive flex pattern and camber profile for precision and control.",
    image_url: "https://images.unsplash.com/photo-1518608774889-b04d2abe7702?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1518608774889-b04d2abe7702?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551524164-6cf2ac26976e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551524164-9a1dcbc0c40b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80"
    ],
    price_per_day: 45,
    rating: 4.8,
    review_count: 12,
    location: {
      lat: 34.0522,
      lng: -118.2437,
      address: "123 Main St, Los Angeles, CA 90001" // Changed from zip to address
    },
    specifications: {
      size: "158cm",
      weight: "3.5kg",
      material: "Carbon Fiber",
      suitable: "Advanced"
    },
    availability: {
      available: true
    },
    status: 'available',
    created_at: '2024-12-01',
    updated_at: '2024-12-01',
    visible_on_map: true,
    owner: {
      id: "user1",
      name: "Mock User"
    }
  },
  {
    id: "user-equip-2",
    name: "Pyzel Phantom Surfboard",
    category: "surfboards",
    description: "Versatile step-up board that performs well in a wide range of conditions. Great for intermediate surfers looking to improve their skills.",
    image_url: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502003148287-cea895d068da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"
    ],
    price_per_day: 35,
    rating: 4.7,
    review_count: 8,
    location: {
      lat: 34.0195,
      lng: -118.4912,
      address: "456 Beach Blvd, Santa Monica, CA 90401" // Changed from zip to address
    },
    specifications: {
      size: "6'4\"",
      weight: "2.8kg",
      material: "Polyurethane",
      suitable: "Intermediate"
    },
    availability: {
      available: true
    },
    status: 'available',
    created_at: '2024-12-02',
    updated_at: '2024-12-02',
    visible_on_map: true,
    owner: {
      id: "user1",
      name: "Mock User"
    }
  }
];
