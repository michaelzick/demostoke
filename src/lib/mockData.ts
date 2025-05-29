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

// Define shop owners with enhanced descriptions
const shopOwners: GearOwner[] = [
  {
    id: "shop-the-boarder",
    name: "The Boarder",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80",
    rating: 4.8,
    responseRate: 99,
    bio: "Founded in 2003, The Boarder has been Los Angeles' premier surfboard destination for over two decades. Located in the heart of Venice Beach, we're more than just a shop—we're a community of surfers passionate about the craft of board making and the art of riding waves.\n\nOur team consists of seasoned shapers, professional surfers, and wave enthusiasts who understand that every surfer is unique. Whether you're taking your first steps into the lineup or you're a seasoned pro looking for that perfect custom board, we have the expertise and inventory to match you with your ideal ride.\n\nWe specialize in high-performance shortboards, classic longboards, and everything in between. Our custom shaping service allows you to work directly with master craftsmen to create a board tailored specifically to your style, local breaks, and performance goals. We also carry boards from renowned shapers and brands that have proven themselves in California's diverse surf conditions.\n\nBeyond boards, we're deeply connected to the local surf community. We sponsor local surfers, host beach cleanups, and provide surf lessons for beginners. Our rental program features meticulously maintained boards that let you try before you buy, and our staff can recommend the perfect board based on current conditions and your skill level.\n\nVisit us at our Venice location where the sound of waves is just steps away, and experience the difference that two decades of passion and expertise can make in your surfing journey.",
    location: "Venice, CA",
    memberSince: "2003",
    personality: "Surf Shop",
    shopId: "the-boarder"
  },
  {
    id: "shop-rei",
    name: "REI",
    imageUrl: "https://logos-world.net/wp-content/uploads/2021/03/REI-Logo.png",
    rating: 4.7,
    responseRate: 98,
    bio: "REI has been inspiring outdoor adventures since 1938, and our Los Angeles location continues that tradition by connecting people with the transformative power of the outdoors. As a co-op, we're owned by our members and driven by a shared passion for outdoor exploration and environmental stewardship.\n\nOur stand-up paddleboard selection represents the best in outdoor water sports equipment. We carry top brands known for their innovation, durability, and performance across various water conditions. From inflatable SUPs perfect for travel and storage to rigid boards designed for performance and touring, our curated selection ensures you'll find the right board for your adventures.\n\nWhat sets REI apart is our commitment to education and community. Our knowledgeable staff aren't just salespeople—they're outdoor enthusiasts who regularly use the gear we sell. They can provide expert advice on board selection, safety equipment, and local paddling spots. We offer SUP classes for beginners and host group paddle sessions to build community among water sports enthusiasts.\n\nOur rental program allows you to test equipment before making a purchase, and our generous return policy means you can shop with confidence. As a co-op member, you'll receive annual dividends on your purchases, access to exclusive sales, and the satisfaction of supporting a company that gives back to outdoor communities and conservation efforts.\n\nBeyond SUPs, we're your complete outdoor outfitter with everything from hiking and camping gear to cycling and climbing equipment. Our goal is to help you get outside, stay safe, and create lasting memories in nature.",
    location: "Los Angeles, CA",
    memberSince: "1994",
    personality: "Outdoor Retailer",
    shopId: "rei"
  },
  {
    id: "shop-the-pow-house",
    name: "The Pow House",
    imageUrl: "https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=300&q=80",
    rating: 4.9,
    responseRate: 99,
    bio: "The Pow House opened in 2010 with a simple mission: to be Southern California's ultimate destination for mountain sports enthusiasts. Located in Pasadena, we serve as the gateway between LA's urban energy and the epic mountain terrain just hours away.\n\nOur snowboard and ski selection is carefully curated to handle everything from the groomers at Mountain High to the backcountry powder of the Eastern Sierra. We carry boards and skis from industry leaders like Burton, Lib Tech, K2, Salomon, and Atomic, as well as boutique brands that push the boundaries of design and performance.\n\nWhat makes The Pow House special is our deep understanding of the unique challenges SoCal riders face. We know you might be surfing in the morning and snowboarding in the afternoon, so we stock versatile, high-performance gear that travels well and performs in varying conditions. Our team includes certified boot fitters, experienced mechanics, and riders who regularly explore the mountains from Mammoth to Utah.\n\nOur services go beyond retail. We offer professional tune-ups, waxing, and repair services to keep your gear performing at its peak. Our boot fitting service ensures comfort and performance on the mountain, while our binding mounting is precise and reliable. We also provide rental packages for those epic powder days when you need gear quickly.\n\nThe Pow House is more than a shop—we're a community hub for mountain culture in LA. We host film premieres, gear swaps, and group trips to local mountains. Our demo program lets you try the latest boards and skis before you buy, and our staff can recommend the perfect setup based on your riding style and favorite mountains.\n\nWhether you're a weekend warrior hitting the local mountains or a dedicated rider planning backcountry adventures, The Pow House has the gear, knowledge, and passion to elevate your mountain experience.",
    location: "Pasadena, CA",
    memberSince: "2010",
    personality: "Mountain Sports Shop",
    shopId: "the-pow-house"
  },
  {
    id: "party-skate-collective",
    name: "LA Skate Collective",
    imageUrl: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=300&q=80",
    rating: 4.6,
    responseRate: 94,
    bio: "The LA Skate Collective formed in 2020 when a group of passionate skateboarders decided to pool their resources and share their extensive board collection with the broader skating community. What started as friends lending boards to each other has evolved into one of LA's most trusted sources for quality skateboard rentals.\n\nOur collective represents the diversity of LA's skate scene. We have street skaters from downtown, vert riders from the legendary pools, longboard cruisers from the beach paths, and everything in between. This diversity is reflected in our board collection, which includes setups for every style of skating and skill level.\n\nEach board in our collection has been carefully selected and maintained by experienced skaters who understand the importance of quality equipment. We carry complete setups from respected brands like Santa Cruz, Powell Peralta, Independent, and Bones, as well as custom builds featuring local shaper work and unique graphics.\n\nWhat sets us apart is our community-focused approach. When you rent from us, you're not just getting a board—you're getting insider knowledge about the best spots, current scene happenings, and safety tips from riders who skate these streets daily. We provide recommendations based on your skill level and what you want to experience, whether that's cruising the Venice boardwalk or hitting technical street spots.\n\nWe're committed to keeping skateboarding accessible and building community. A portion of our rental proceeds goes toward maintaining local DIY spots and supporting youth skate programs. We believe skateboarding should be available to everyone, regardless of economic background.\n\nOur rental process is flexible and skater-friendly. We understand that sessions can run long and plans can change, so we work with you to ensure you get the most out of your time on four wheels. Hit us up for recommendations on spots, events, or just to talk skating—we're always down to help fellow skaters discover what makes LA's scene so special.",
    location: "Los Angeles, CA",
    memberSince: "2020",
    personality: "Community Collective",
    partyId: "skate-collective"
  }
];

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
      forums and always hunting for that perfect ride. My gear is meticulously maintained—I treat my gear better than my car!",
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
      shapes that excel in California conditions. My demo program lets you experience how the gear feels before committing. \
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

  // Los Angeles center coordinates
  const losAngelesLat = 34.0522;
  const losAngelesLng = -118.2437;

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
        ownerId = "party-skate-collective";
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

// Export mock data
export const mockEquipment = generateMockEquipment(30);
