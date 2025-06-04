
import { Equipment } from "@/types";
import { mockEquipment, ownerPersonas } from "@/lib/mockData";
import { mockUserEquipment } from "@/lib/userEquipment";

export interface Booking {
  id: string;
  equipmentId: string;
  equipment: Equipment;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  bookedBy: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

// Sample bookings for gear I've booked from others
export const myBookings: Booking[] = [
  {
    id: "booking-1",
    equipmentId: "equip-5",
    equipment: mockEquipment[4],
    startDate: "2025-05-22",
    endDate: "2025-05-24",
    status: "confirmed",
    bookedBy: {
      id: "current-user",
      name: "You",
      imageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=current-user"
    }
  },
  {
    id: "booking-2",
    equipmentId: "equip-8",
    equipment: mockEquipment[7],
    startDate: "2025-05-28",
    endDate: "2025-05-30",
    status: "pending",
    bookedBy: {
      id: "current-user",
      name: "You",
      imageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=current-user"
    }
  },
  {
    id: "booking-3",
    equipmentId: "equip-12",
    equipment: mockEquipment[11],
    startDate: "2025-06-05",
    endDate: "2025-06-07",
    status: "confirmed",
    bookedBy: {
      id: "current-user",
      name: "You",
      imageUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=current-user"
    }
  }
];

// Convert UserEquipment to Equipment format for bookings
const convertUserEquipmentToEquipment = (userEquip: typeof mockUserEquipment[0], owner: typeof ownerPersonas[0]): Equipment => ({
  id: userEquip.id,
  name: userEquip.name,
  category: userEquip.category,
  description: userEquip.description,
  image_url: userEquip.image_url,
  price_per_day: userEquip.price_per_day,
  rating: userEquip.rating,
  review_count: userEquip.review_count,
  owner: owner,
  location: userEquip.location,
  distance: 0, // Default distance for owned equipment
  specifications: userEquip.specifications,
  availability: userEquip.availability,
  status: userEquip.status,
  created_at: userEquip.created_at,
  updated_at: userEquip.updated_at
});

// Sample bookings others have made for my equipment
export const bookingsForMyGear: Booking[] = [
  {
    id: "booking-4",
    equipmentId: mockUserEquipment[0].id,
    equipment: convertUserEquipmentToEquipment(mockUserEquipment[0], ownerPersonas[0]),
    startDate: "2025-05-25",
    endDate: "2025-05-26",
    status: "confirmed",
    bookedBy: {
      id: ownerPersonas[0].id,
      name: ownerPersonas[0].name,
      imageUrl: ownerPersonas[0].imageUrl
    }
  },
  {
    id: "booking-5",
    equipmentId: mockUserEquipment[1].id,
    equipment: convertUserEquipmentToEquipment(mockUserEquipment[1], ownerPersonas[1]),
    startDate: "2025-05-20",
    endDate: "2025-05-21",
    status: "completed",
    bookedBy: {
      id: ownerPersonas[1].id,
      name: ownerPersonas[1].name,
      imageUrl: ownerPersonas[1].imageUrl
    }
  },
  {
    id: "booking-6",
    equipmentId: mockUserEquipment[0].id,
    equipment: convertUserEquipmentToEquipment(mockUserEquipment[0], ownerPersonas[2]),
    startDate: "2025-06-10",
    endDate: "2025-06-12",
    status: "pending",
    bookedBy: {
      id: ownerPersonas[2].id,
      name: ownerPersonas[2].name,
      imageUrl: ownerPersonas[2].imageUrl
    }
  }
];
