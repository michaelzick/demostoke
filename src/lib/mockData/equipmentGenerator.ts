
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

// Image arrays for different categories
const snowboardImages = [
  "https://images.unsplash.com/photo-1518608774889-b04d2abe7702?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1488580923008-6f98dfbd7a25?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1625154869776-100eba31abbb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522056615691-da7b8106c665?auto=format&fit=crop&w=800&q=80"
];

const skiImages = [
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1586356415056-bd7a5c2bbef7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507534192483-69914c0692d7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511984212987-27f5efecd5a7?auto=format&fit=crop&w=800&q=80"
];

const surfboardImages = [
  "https://images.unsplash.com/photo-1516633630673-67bbad747022?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1530870110042-98b2cb110834?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1459745930869-b3d0d72c3cbb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1455264745730-cb3b76250ae8?auto=format&fit=crop&w=800&q=80"
];

const supImages = [
  "https://images.unsplash.com/photo-1597175971918-76e969f42f74?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1655213721792-113a056d9267?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1569118793811-5ea7a250313b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598112747595-0ac8aa788d4d?auto=format&fit=crop&w=800&q=80"
];

const bikeImages = [
  "https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1566480047210-b10eaa1f8095?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1633707167682-9068729bc84c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1589100984317-79246528923c?auto=format&fit=crop&w=800&q=80"
];

// Mock equipment data generator
export function generateMockEquipment(count: number = 20): Equipment[] {
  const categories = ["snowboards", "skis", "surfboards", "mountain-bikes"];
  const snowboardMaterials = ["Wood Core", "Carbon", "Fiberglass", "Cap Construction"];
  const skiMaterials = ["Wood Core", "Carbon", "Fiberglass", "Cap Construction"];
  const surfboardMaterials = ["Polyurethane", "Epoxy", "Soft-top", "Carbon Fiber"];
  const paddleMaterials = ["Epoxy", "Inflatable", "Carbon Fiber", "Plastic"];
  const bikeMaterials = ["Aluminum", "Carbon Fiber", "Steel", "Titanium"];

  // Mountain bike experts and enthusiasts
  const bikeOwnerIds = ["owner-2", "owner-5", "owner-8", "owner-10"]; // Chris T, Dustin R, Taylor S, Casey K

  return Array.from({ length: count }).map((_, i) => {
    const id = staticIds[i]; // Use static ID
    const category = categories[i % categories.length]; // Cycle through categories

    // Assign owner based on category
    let ownerId: string;
    switch (category) {
      case "surfboards":
        ownerId = "shop-the-boarder";
        break;
      case "snowboards":
      case "skis":
        ownerId = "shop-the-pow-house";
        break;
      case "mountain-bikes":
        // Use individual owners for mountain bikes, cycling through them
        ownerId = bikeOwnerIds[i % bikeOwnerIds.length];
        break;
      default:
        ownerId = `owner-${(i % 10) + 1}`;
    }

    // Generate different details based on category
    let name, material, suitable, images, subcategory;

    switch (category) {
      case "snowboards": {
        const snowboardTypes = ['All-Mountain', 'Freestyle', 'Freeride', 'Powder'];
        const snowboardType = snowboardTypes[i % 4];
        name = `${snowboardType} Snowboard`;
        subcategory = snowboardType;
        material = snowboardMaterials[i % snowboardMaterials.length];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'Park Rider'][i % 4]}`;
        const snowboardCount = Math.floor(Math.random() * 3) + 2;
        images = snowboardImages.slice(0, snowboardCount);
        break;
      }
      case "skis": {
        const skiTypes = ['All-Mountain', 'Freestyle', 'Freeride', 'Powder'];
        const skiType = skiTypes[i % 4];
        name = `${skiType} Skis`;
        subcategory = skiType;
        material = skiMaterials[i % skiMaterials.length];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'Park Rider'][i % 4]}`;
        const skiCount = Math.floor(Math.random() * 3) + 2;
        images = skiImages.slice(0, skiCount);
        break;
      }
      case "surfboards": {
        const surfboardTypes = ['Shortboard', 'Longboard', 'Fish', 'Funboard'];
        const surfboardType = surfboardTypes[i % 4];
        name = `${surfboardType} Surfboard`;
        subcategory = surfboardType;
        material = surfboardMaterials[i % surfboardMaterials.length];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'All Levels'][i % 4]} Surfers`;
        const surfboardCount = Math.floor(Math.random() * 3) + 2;
        images = surfboardImages.slice(0, surfboardCount);
        break;
      }
      case "mountain-bikes": {
        const bikeTypes = ['Trail', 'Cross Country', 'Enduro', 'Downhill'];
        const bikeType = bikeTypes[i % 4];
        name = `${bikeType} Mountain Bike`;
        subcategory = bikeType;
        material = bikeMaterials[i % bikeMaterials.length];
        suitable = `${['Beginner', 'Intermediate', 'Advanced', 'Expert'][i % 4]} Riders`;
        const bikeCount = Math.floor(Math.random() * 3) + 2;
        images = bikeImages.slice(0, bikeCount);
        break;
      }
      default:
        name = "Equipment";
        subcategory = "General";
        material = "Various";
        suitable = "All Levels";
        images = ["https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=800&q=80"];
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
      reviewCount: Math.floor(Math.random() * 50) + 1,
      responseRate: Math.floor(Math.random() * 20) + 80,
    };

    return {
      id,
      name,
      category,
      subcategory, // Now properly assigned for all categories
      description: `Great ${category.replace('-', ' ')} for ${suitable.toLowerCase()}. Well maintained and ready for your next adventure!`,
      image_url: images[0],
      images: images,
      price_per_day: Math.floor(Math.random() * 30) + 20,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      review_count: Math.floor(Math.random() * 50) + 1,
      owner: ownerData,
      location: {
        lat: location.lat,
        lng: location.lng,
        zip: locationName,
      },
      distance: +(Math.random() * 8).toFixed(1),
      specifications: {
        size: category === "mountain-bikes"
          ? `${['Small', 'Medium', 'Large', 'XL', 'XXL'][i % 5]}`
          : `${Math.floor(Math.random() * 20) + 152}cm`,
        weight: `${Math.floor(Math.random() * 5) + 3}kg`,
        material,
        suitable,
      },
      availability: {
        available: Math.random() > 0.2,
        nextAvailableDate: Math.random() > 0.2 ? undefined : new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      pricing_options: [
        { id: '1', price: Math.floor(Math.random() * 30) + 20, duration: 'day' }
      ],
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      visible_on_map: true,
    };
  });
}
