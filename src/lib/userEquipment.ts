
import { Equipment } from "@/types";

export interface UserEquipment extends Equipment {
  status: 'available' | 'booked' | 'unavailable';
  addedDate: string;
}

// Mock data for the current user's equipment
export const mockUserEquipment: UserEquipment[] = [
  {
    id: "user-equip-1",
    name: "Burton Custom X Snowboard",
    category: "snowboards",
    description: "High-performance snowboard perfect for intermediate to advanced riders. Features a responsive flex pattern and camber profile for precision and control.",
    imageUrl: "https://images.unsplash.com/photo-1518608774889-b04d2abe7702?auto=format&fit=crop&w=800&q=80",
    pricePerDay: 45,
    rating: 4.8,
    reviewCount: 12,
    owner: {
      id: "current-user",
      name: "You",
      imageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=current-user",
      rating: 4.9,
      responseRate: 98,
    },
    location: {
      lat: 34.0522,
      lng: -118.2437,
      name: "Downtown LA",
    },
    distance: 0,
    specifications: {
      size: "158cm",
      weight: "3.5kg",
      material: "Carbon Fiber",
      suitable: "Advanced",
    },
    availability: {
      available: true,
    },
    status: 'available',
    addedDate: '2024-12-01'
  },
  {
    id: "user-equip-2",
    name: "Pyzel Phantom Surfboard",
    category: "surfboards",
    description: "Versatile step-up board that performs well in a wide range of conditions. Great for intermediate surfers looking to improve their skills.",
    imageUrl: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=800&q=80",
    pricePerDay: 35,
    rating: 4.7,
    reviewCount: 8,
    owner: {
      id: "current-user",
      name: "You",
      imageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=current-user",
      rating: 4.9,
      responseRate: 98,
    },
    location: {
      lat: 34.0522,
      lng: -118.2437,
      name: "Santa Monica",
    },
    distance: 0,
    specifications: {
      size: "6'2\"",
      weight: "2.8kg",
      material: "Epoxy",
      suitable: "Intermediate",
    },
    availability: {
      available: true,
    },
    status: 'available',
    addedDate: '2025-01-15'
  },
  {
    id: "user-equip-3",
    name: "Element Section Skateboard",
    category: "skateboards",
    description: "Well-balanced skateboard suitable for street and park skating. Perfect for tricks and casual riding.",
    imageUrl: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    pricePerDay: 25,
    rating: 4.5,
    reviewCount: 6,
    owner: {
      id: "current-user",
      name: "You",
      imageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=current-user",
      rating: 4.9,
      responseRate: 98,
    },
    location: {
      lat: 34.0522,
      lng: -118.2437,
      name: "Echo Park",
    },
    distance: 0,
    specifications: {
      size: "32\" x 8\"",
      weight: "2.2kg",
      material: "Wood",
      suitable: "All Levels",
    },
    availability: {
      available: true,
    },
    status: 'available',
    addedDate: '2025-02-20'
  },
];
