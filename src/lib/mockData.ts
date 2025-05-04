
import { Equipment } from "@/types";

// Helper function to generate random locations near a center point
function generateRandomLocation(centerLat: number, centerLng: number, radiusInKm = 5) {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert radius from kilometers to degrees
  const radiusInDeg = radiusInKm / R;

  // Random angle
  const angle = Math.random() * Math.PI * 2;

  // Random distance within the radius
  const distance = Math.random() * radiusInDeg;

  // Calculate offset
  const dx = distance * Math.cos(angle);
  const dy = distance * Math.sin(angle);

  // Convert to decimal degrees
  const newLat = centerLat + (dy * 180) / Math.PI;
  const newLng = centerLng + (dx * 180) / Math.PI / Math.cos((centerLat * Math.PI) / 180);

  return { lat: newLat, lng: newLng };
}

// Names of locations based on San Francisco neighborhoods
const sfLocations = [
  "Mission District", "North Beach", "Marina", "SoMa", "Haight-Ashbury",
  "Richmond District", "Sunset District", "Castro", "Nob Hill", "Russian Hill",
  "Pacific Heights", "Japantown", "Chinatown", "Dogpatch", "Hayes Valley"
];

// Mock equipment data generator
export function generateMockEquipment(count: number = 20): Equipment[] {
  const categories = ["snowboard", "skis", "surfboard", "sup", "skateboard"];
  const snowboardMaterials = ["Wood Core", "Carbon", "Fiberglass", "Cap Construction"];
  const skiMaterials = ["Wood Core", "Carbon", "Fiberglass", "Cap Construction"];
  const surfboardMaterials = ["Polyurethane", "Epoxy", "Soft-top", "Carbon Fiber"];
  const paddleMaterials = ["Epoxy", "Inflatable", "Carbon Fiber", "Plastic"];
  const skateboardMaterials = ["Wood", "Plastic", "Aluminum", "Carbon Fiber"];

  // San Francisco center coordinates
  const sfLat = 37.7749;
  const sfLng = -122.4194;

  return Array.from({ length: count }).map((_, i) => {
    const id = `equip-${i + 1}`;
    const category = categories[Math.floor(Math.random() * categories.length)];

    // Generate different details based on category
    let name, material, suitable, imageUrl;

    switch (category) {
      case "snowboard":
        name = `${['All-Mountain', 'Freestyle', 'Freeride', 'Powder'][Math.floor(Math.random() * 4)]} Snowboard`;
        material = snowboardMaterials[Math.floor(Math.random() * snowboardMaterials.length)];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'Park Rider'][Math.floor(Math.random() * 4)]}`;
        imageUrl = `https://images.unsplash.com/photo-${['1605540436563-5bca919ee183', '1551698618-1dfe5d97d256', '1579755209337-56a5c8d6f4bb'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&w=800&q=80`;
        break;
      case "skis":
        name = `${['All-Mountain', 'Freestyle', 'Freeride', 'Powder'][Math.floor(Math.random() * 4)]} Skis`;
        material = skiMaterials[Math.floor(Math.random() * snowboardMaterials.length)];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'Park Rider'][Math.floor(Math.random() * 4)]}`;
        imageUrl = `https://images.unsplash.com/photo-${['1605540436563-5bca919ee183', '1551698618-1dfe5d97d256', '1579755209337-56a5c8d6f4bb'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&w=800&q=80`;
        break;
      case "surfboard":
        name = `${['Shortboard', 'Longboard', 'Fish', 'Funboard', 'Gun'][Math.floor(Math.random() * 5)]} Surfboard`;
        material = surfboardMaterials[Math.floor(Math.random() * surfboardMaterials.length)];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'All Levels'][Math.floor(Math.random() * 4)]} Surfers`;
        imageUrl = `https://images.unsplash.com/photo-${['1531722569936-825d3dd91b15', '1478822650010-6526e73c6599', '1605856631848-5c95701a8170'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&w=800&q=80`;
        break;
      case "sup":
        name = `${['Touring', 'All-Around', 'Inflatable', 'Racing'][Math.floor(Math.random() * 4)]} Paddle Board`;
        material = paddleMaterials[Math.floor(Math.random() * paddleMaterials.length)];
        suitable = `${['Flat Water', 'Surf', 'Racing', 'Yoga'][Math.floor(Math.random() * 4)]}`;
        imageUrl = `https://images.unsplash.com/photo-${['1526426176273-2f516d2b4085', '1517156118434-bf097f975a7c', '1472978748395-da8458f44a3b'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&w=800&q=80`;
        break;
        case "skateboard":
        name = `${['Street', 'Cruiser', 'Longboard', 'Pool'][Math.floor(Math.random() * 4)]} Skateboard`;
        material = skateboardMaterials[Math.floor(Math.random() * skateboardMaterials.length)];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'All Levels'][Math.floor(Math.random() * 4)]} Skaters`;
        imageUrl = `https://images.unsplash.com/photo-${['1605540436563-5bca919ee183', '1551698618-1dfe5d97d256', '1579755209337-56a5c8d6f4bb'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&w=800&q=80`;
        break;
      default:
        name = "Equipment";
        material = "Various";
        suitable = "All Levels";
        imageUrl = "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=800&q=80";
    }

    // Generate random location near San Francisco
    const location = generateRandomLocation(sfLat, sfLng, 8);
    const locationName = sfLocations[Math.floor(Math.random() * sfLocations.length)];

    return {
      id,
      name,
      category,
      description: `Great ${category} for ${suitable.toLowerCase()}. Well maintained and ready for your next adventure!`,
      imageUrl,
      pricePerDay: Math.floor(Math.random() * 30) + 20, // $20-$50
      rating: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0-5.0 as a number
      reviewCount: Math.floor(Math.random() * 50) + 1,
      owner: {
        id: `owner-${Math.floor(Math.random() * 10) + 1}`,
        name: `${['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley'][Math.floor(Math.random() * 6)]} ${['S.', 'M.', 'T.', 'L.', 'K.'][Math.floor(Math.random() * 5)]}`,
        imageUrl: `https://api.dicebear.com/6.x/avataaars/svg?seed=${Math.random()}`,
        rating: Number((Math.random() * 1 + 4).toFixed(1)), // 4.0-5.0 as a number
        responseRate: Math.floor(Math.random() * 20) + 80, // 80%-100%
      },
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

// Export mock data
export const mockEquipment = generateMockEquipment(30);
