
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

  const suitableSkills = ["Beginner", "Intermediate", "Advanced", "Expert"];

  return staticIds.slice(0, count).map((id, index) => {
    const category = categories[index % categories.length];
    const location = generateRandomLocation(losAngelesLat, losAngelesLng, 50);
    const specificLocation = losAngelesLocations[index % losAngelesLocations.length];
    
    // Use specific location if available, otherwise use generated location
    const equipmentLocation = specificLocation || location;
    
    // Randomly select an owner for this equipment
    const owner = allOwners[index % allOwners.length];

    // Select appropriate images based on category
    let imageArray: string[];
    let materials: string[];
    
    switch (category) {
      case "snowboards":
        imageArray = snowboardImages;
        materials = snowboardMaterials;
        break;
      case "skis":
        imageArray = skiImages;
        materials = skiMaterials;
        break;
      case "surfboards":
        imageArray = surfboardImages;
        materials = surfboardMaterials;
        break;
      case "mountain-bikes":
        imageArray = bikeImages;
        materials = bikeMaterials;
        break;
      default:
        imageArray = snowboardImages;
        materials = snowboardMaterials;
    }

    const images = [
      imageArray[index % imageArray.length],
      imageArray[(index + 1) % imageArray.length],
      imageArray[(index + 2) % imageArray.length]
    ].slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 images per equipment

    return {
      id,
      name: `${category === "mountain-bikes" ? "Trek" : category === "surfboards" ? "Lost" : category === "skis" ? "Rossignol" : "Burton"} ${category === "mountain-bikes" ? "Fuel EX" : category === "surfboards" ? "Mayhem" : category === "skis" ? "Experience" : "Custom"} ${index + 1}`,
      category,
      subcategory: category === "surfboards" ? "Shortboard" : category === "mountain-bikes" ? "Trail" : undefined,
      description: `High-quality ${category.slice(0, -1)} perfect for ${suitableSkills[index % suitableSkills.length].toLowerCase()} riders. Features premium construction and excellent performance characteristics.`,
      image_url: images[0],
      images,
      price_per_day: Math.floor(Math.random() * 80) + 20,
      price_per_hour: Math.floor(Math.random() * 15) + 5,
      price_per_week: Math.floor(Math.random() * 400) + 100,
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      review_count: Math.floor(Math.random() * 50) + 1,
      damage_deposit: Math.floor(Math.random() * 200) + 50,
      owner,
      location: {
        lat: equipmentLocation.lat,
        lng: equipmentLocation.lng,
        address: equipmentLocation.address // Changed from zip to address
      },
      distance: parseFloat((Math.random() * 30 + 0.5).toFixed(1)),
      specifications: {
        size: category === "mountain-bikes" ? `${["Small", "Medium", "Large"][index % 3]}` : category === "surfboards" ? `${Math.floor(Math.random() * 3) + 6}'${Math.floor(Math.random() * 12)}"` : `${Math.floor(Math.random() * 20) + 140}cm`,
        weight: `${(Math.random() * 5 + 2).toFixed(1)}kg`,
        material: materials[index % materials.length],
        suitable: suitableSkills[index % suitableSkills.length]
      },
      availability: {
        available: Math.random() > 0.2,
        nextAvailableDate: Math.random() > 0.8 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
      },
      pricing_options: [
        { id: `${id}-day`, price: Math.floor(Math.random() * 80) + 20, duration: "day" }
      ],
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      visible_on_map: true
    };
  });
}
