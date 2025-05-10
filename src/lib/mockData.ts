
import { Equipment, GearOwner } from "@/types";

// Helper function to generate random locations near a center point
function generateRandomLocation(centerLat: number, centerLng: number, radiusInKm = 5) {
  const R = 6371; // Earth's radius in kilometers
  const radiusInDeg = radiusInKm / R; // Convert radius from kilometers to degrees
  const angle = Math.random() * Math.PI * 2; // Random angle
  const distance = Math.random() * radiusInDeg; // Random distance within the radius
  const dx = distance * Math.cos(angle);
  const dy = distance * Math.sin(angle);

  // Convert to decimal degrees
  const newLat = centerLat + (dy * 180) / Math.PI;
  const newLng = centerLng + (dx * 180) / Math.PI / Math.cos((centerLat * Math.PI) / 180);

  return { lat: newLat, lng: newLng };
}

// Names of locations based on Los Angeles neighborhoods
const losAngelesLocations = [
  "Hollywood", "Downtown LA", "Santa Monica", "Venice",
  "Beverly Hills", "Westwood", "Silver Lake", "Echo Park",
  "Koreatown", "Culver City", "Brentwood", "Bel Air",
  "Pasadena", "Glendale", "Burbank"
];

// Static IDs for equipment
const staticIds = Array.from({ length: 30 }, (_, i) => `equip-${i + 1}`);

// Define persona owners with their bios
export const ownerPersonas: GearOwner[] = [
  {
    id: "owner-1",
    name: "Rachel S.",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=300&q=80",
    rating: 4.8,
    responseRate: 98,
    bio: "Hey there! I'm Rachel, a marketing manager from San Diego who loves being active whenever I can escape the office. \
      As a weekend warrior (1-2x/month), I've built a small collection of quality gear that I'd love to share when I'm not using it. \
      I'm all about trying before buying, and I hope my collection helps you do the same without breaking the bank. Drop me a message \
      with any questions!",
    location: "Los Angeles, CA",
    memberSince: "2022",
    personality: "Weekend Warrior"
  },
  {
    id: "owner-2",
    name: "Chris T.",
    imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=300&q=80",
    rating: 4.9,
    responseRate: 95,
    bio: "What's up! I'm Chris. I work remotely as a project manager, which means I get to shred 3-4 times a week during the season. \
      I've collected a bunch of gear over the years and love exploring different setups for various conditions. I'm active in several \
      forums and always hunting for that perfect ride. My gear is meticulously maintained - I treat my gear better than my car!",
    location: "Los Angeles, CA",
    memberSince: "2021",
    personality: "Die-Hard"
  },
  {
    id: "owner-3",
    name: "Maya L.",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80",
    rating: 4.7,
    responseRate: 92,
    bio: "Hi, I'm Maya! I live the van life and work as a remote UX designer, chasing adventures wherever I can find them. \
      Being constantly on the move means I can't own tons of gear, but I do have some quality pieces that I can lend out when I'm \
      in your area. I know the struggle of finding good rentals in a new spot, so I make sure my gear descriptions are comprehensive \
      and the prices are fair. Let me know if you need advice about local spots too!",
    location: "Los Angeles, CA",
    memberSince: "2022",
    personality: "Nomadic Renter"
  },
  {
    id: "owner-4",
    name: "Tony M.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    rating: 4.9,
    responseRate: 99,
    bio: "I'm Tony, co-owner of Mountain Edge Board Shop. We specialize in high-performance gear for any outdoor adventure. \
      Our demo program lets you try before you buy, and if you decide to purchase after your demo, we'll apply the rental fee \
      to your purchase! We carry brands that are hard to find elsewhere, including some limited editions. Stop by our shop for \
      expert advice or rent through this platform for convenience.",
    location: "Los Angeles, CA",
    memberSince: "2020",
    personality: "Local Shop Owner"
  },
  {
    id: "owner-5",
    name: "Dustin R.",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    rating: 4.8,
    responseRate: 97,
    bio: "Dustin here. I'm a small creator of custom gear. I've been crafting for over a decade, focusing on performance and \
      shapes that excel in California conditions. My demo program lets you experience how a customized gear feels before committing. \
      Each listing includes detailed dimensions and design features. Please leave a review after your session. Your feedback helps me \
      refine my techniques and helps others discover my work!",
    location: "Los Angeles, CA",
    memberSince: "2021",
    personality: "Local Creator"
  },
  {
    id: "owner-6",
    name: "Jessie K.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    rating: 4.6,
    responseRate: 94,
    bio: "Aloha! I'm Jessie, a yoga instructor in Encinitas with a passion for anything outdoors. I've accumulated quite a collection \
      of gear for different conditions, and I'm happy to share them when I'm not using them. My quiver includes everything from \
      beginner-friendly daily drivers to high-performance equipment. I'm pretty flexible with pickup arrangements and can usually meet \
      near Downtown. The extra income helps fund my next gear purchase (don't tell my partner, haha!).",
    location: "Los Angeles, CA",
    memberSince: "2023",
    personality: "Quiver Lender"
  },
  {
    id: "owner-7",
    name: "Jamie M.",
    imageUrl: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=300&q=80",
    rating: 4.5,
    responseRate: 90,
    bio: "Hey there! I'm Jamie, an outdoor enthusiast who loves to share my gear with the community. I carefully maintain all my equipment and \
      am always happy to provide tips on getting the most out of your rental. Feel free to message me with any questions!",
    location: "Los Angeles, CA",
    memberSince: "2022",
    personality: "Casual Lender"
  },
  {
    id: "owner-8",
    name: "Taylor S.",
    imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80",
    rating: 4.9,
    responseRate: 96,
    bio: "What's up, I'm Taylor! As a former pro athlete, I've collected some serious gear over the years. Now I'm all about helping others \
      experience top-quality equipment without the hefty price tag. My gear is professionally maintained and always ready for your next adventure.",
    location: "Los Angeles, CA",
    memberSince: "2021",
    personality: "Pro Enthusiast"
  },
  {
    id: "owner-9",
    name: "Jordan T.",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
    rating: 4.7,
    responseRate: 93,
    bio: "Jordan here - outdoor gear collector and adventure seeker. I believe everyone should have access to quality equipment, which is why I \
      started lending my gear. I'm constantly updating my collection with the latest and greatest, so you'll always find something exciting to try!",
    location: "Los Angeles, CA",
    memberSince: "2022",
    personality: "Gear Aficionado"
  },
  {
    id: "owner-10",
    name: "Casey K.",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80",
    rating: 4.8,
    responseRate: 95,
    bio: "Hey, I'm Casey! When I'm not chasing waves, hitting the slopes, or riding pavement, I'm sharing my passion for outdoor sports through \
      my gear. I provide detailed guidance for beginners and can recommend the perfect equipment based on your skill level and goals. Let's get \
      you set up for an amazing experience!",
    location: "Los Angeles, CA",
    memberSince: "2021",
    personality: "Helpful Guide"
  }
];

// Map owner IDs to persona objects
const ownerIdToPersona = Object.fromEntries(
  ownerPersonas.map((persona) => [persona.id, persona])
);

// Mock equipment data generator
export function generateMockEquipment(count: number = 20): Equipment[] {
  const categories = ["snowboards", "skis", "surfboards", "sups", "skateboards"];
  const snowboardMaterials = ["Wood Core", "Carbon", "Fiberglass", "Cap Construction"];
  const skiMaterials = ["Wood Core", "Carbon", "Fiberglass", "Cap Construction"];
  const surfboardMaterials = ["Polyurethane", "Epoxy", "Soft-top", "Carbon Fiber"];
  const paddleMaterials = ["Epoxy", "Inflatable", "Carbon Fiber", "Plastic"];
  const skateboardMaterials = ["Wood", "Plastic", "Aluminum", "Carbon Fiber"];

  // Los Angeles center coordinates
  const losAngelesLat = 34.0522;
  const losAngelesLng = -118.2437;

  return Array.from({ length: count }).map((_, i) => {
    const id = staticIds[i]; // Use static ID
    const category = categories[i % categories.length]; // Cycle through categories

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
        imageUrl = `https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80`;
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

    // Use owner from personas
    const ownerId = `owner-${(i % 10) + 1}`;
    const ownerPersona = ownerIdToPersona[ownerId] || {
      id: ownerId,
      name: `Owner ${(i % 10) + 1}`,
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
      owner: ownerPersona,
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
