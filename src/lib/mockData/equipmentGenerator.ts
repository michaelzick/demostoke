
import { Equipment, GearOwner } from "@/types";
import { generateRandomLocation, losAngelesLocations, losAngelesLat, losAngelesLng } from "./locations";
import { shopOwners } from "./shopOwners";
import { ownerPersonas } from "./ownerPersonas";

// Static IDs for equipment
const staticIds = Array.from({ length: 30 }, (_, i) => `equip-${i + 1}`);

// Combine shop owners and persona owners
const allOwners = [...shopOwners, ...ownerPersonas];

// Map owner IDs to owner objects
const ownerIdToOwner = Object.fromEntries(
  allOwners.map((owner) => [owner.id, owner])
);

// Mock equipment data generator
export function generateMockEquipment(count: number = 20): Equipment[] {
  const categories = ["snowboards", "skis", "surfboards", "sups", "skateboards"];
  const snowboardMaterials = ["Wood Core", "Carbon", "Fiberglass", "Cap Construction"];
  const skiMaterials = ["Wood Core", "Carbon", "Fiberglass", "Cap Construction"];
  const surfboardMaterials = ["Polyurethane", "Epoxy", "Soft-top", "Carbon Fiber"];
  const paddleMaterials = ["Epoxy", "Inflatable", "Carbon Fiber", "Plastic"];
  const skateboardMaterials = ["Wood", "Plastic", "Aluminum", "Carbon Fiber"];

  // Individual owners for skateboards (cycling through personas)
  const skateboardOwnerIds = ["owner-1", "owner-2", "owner-3", "owner-4", "owner-5", "owner-6", "owner-7", "owner-8", "owner-9", "owner-10"];

  return Array.from({ length: count }).map((_, i) => {
    const id = staticIds[i]; // Use static ID
    const category = categories[i % categories.length]; // Cycle through categories

    // Assign owner based on category
    let ownerId: string;
    switch (category) {
      case "surfboards":
        ownerId = "shop-the-boarder";
        break;
      case "sups":
        ownerId = "shop-rei";
        break;
      case "snowboards":
      case "skis":
        ownerId = "shop-the-pow-house";
        break;
      case "skateboards":
        // Use individual owners for skateboards, cycling through them
        ownerId = skateboardOwnerIds[i % skateboardOwnerIds.length];
        break;
      default:
        ownerId = `owner-${(i % 10) + 1}`;
    }

    // Generate different details based on category
    let name, material, suitable, imageUrl;

    switch (category) {
      case "snowboards":
        name = `${['All-Mountain', 'Freestyle', 'Freeride', 'Powder'][i % 4]} Snowboard`;
        material = snowboardMaterials[i % snowboardMaterials.length];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'Park Rider'][i % 4]}`;
        imageUrl = `https://images.unsplash.com/photo-1518608774889-b04d2abe7702?auto=format&fit=crop&w=800&q=80`;
        break;
      case "skis":
        name = `${['All-Mountain', 'Freestyle', 'Freeride', 'Powder'][i % 4]} Skis`;
        material = skiMaterials[i % skiMaterials.length];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'Park Rider'][i % 4]}`;
        imageUrl = `https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80`;
        break;
      case "surfboards":
        name = `${['Shortboard', 'Longboard', 'Fish', 'Funboard'][i % 4]} Surfboard`;
        material = surfboardMaterials[i % surfboardMaterials.length];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'All Levels'][i % 4]} Surfers`;
        imageUrl = `https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=800&q=80`;
        break;
      case "sups":
        name = `${['Touring', 'All-Around', 'Inflatable', 'Racing'][i % 4]} Paddle Board`;
        material = paddleMaterials[i % paddleMaterials.length];
        suitable = `${['Flat Water', 'Surf', 'Racing', 'Yoga'][i % 4]}`;
        imageUrl = `https://images.unsplash.com/photo-1597175971918-76e969f42f74?auto=format&fit=crop&w=800&q=80`;
        break;
      case "skateboards":
        name = `${['Street', 'Cruiser', 'Longboard', 'Pool'][i % 4]} Skateboard`;
        material = skateboardMaterials[i % skateboardMaterials.length];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'All Levels'][i % 4]} Skaters`;
        imageUrl = `https://images.unsplash.com/photo-1520045892732-304bc3ac45f1e?auto=format&fit=crop&w=800&q=80`;
        break;
      default:
        name = "Equipment";
        material = "Various";
        suitable = "All Levels";
        imageUrl = "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=800&q=80";
    }

    // Generate random location near LA
    const location = generateRandomLocation(losAngelesLat, losAngelesLng, 8);
    const locationName = losAngelesLocations[i % losAngelesLocations.length];

    // Use owner from combined list
    const ownerData = ownerIdToOwner[ownerId] || {
      id: ownerId,
      name: `Owner ${ownerId}`,
      imageUrl: `https://api.dicebear.com/6.x/avataaars/svg?seed=${i}`,
      rating: Number((Math.random() * 1 + 4).toFixed(1)),
      responseRate: Math.floor(Math.random() * 20) + 80,
    };

    return {
      id,
      name,
      category,
      description: `Great ${category} for ${suitable.toLowerCase()}. Well maintained and ready for your next adventure!`,
      imageUrl,
      pricePerDay: Math.floor(Math.random() * 30) + 20, // $20-$50
      rating: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0-5.0 as a number
      reviewCount: Math.floor(Math.random() * 50) + 1,
      owner: ownerData,
      location: {
        lat: location.lat,
        lng: location.lng,
        name: locationName,
      },
      distance: +(Math.random() * 8).toFixed(1), // 0-8 miles
      specifications: {
        size: `${Math.floor(Math.random() * 20) + 152}cm`,
        weight: `${Math.floor(Math.random() * 5) + 3}kg`,
        material,
        suitable,
      },
      availability: {
        available: Math.random() > 0.2, // 80% are available
        nextAvailableDate: Math.random() > 0.2 ? undefined : new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    };
  });
}
