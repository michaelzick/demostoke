
import { Equipment } from '@/types';
import { categories, skillLevels, locations, descriptions, materials, ownerPersonas } from './constants';

const generateRandomEquipment = (count: number, showMockData: boolean = true): Equipment[] => {
  if (!showMockData) return [];
  
  const equipment: Equipment[] = [];
  
  // Filter out 'sups' from categories
  const filteredCategories = categories.filter(cat => cat !== 'sups');
  
  for (let i = 0; i < count; i++) {
    const category = filteredCategories[Math.floor(Math.random() * filteredCategories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const ownerPersona = ownerPersonas[Math.floor(Math.random() * ownerPersonas.length)];
    
    // Generate subcategory based on category (excluding SUPs)
    let subcategory = "";
    switch (category) {
      case 'snowboards':
        subcategory = ['All-Mountain', 'Freestyle', 'Freeride', 'Powder', 'Splitboard'][Math.floor(Math.random() * 5)];
        break;
      case 'skis':
        subcategory = ['All-Mountain', 'Carving', 'Freestyle', 'Backcountry', 'Racing'][Math.floor(Math.random() * 5)];
        break;
      case 'surfboards':
        subcategory = ['Shortboard', 'Longboard', 'Fish', 'Gun', 'Funboard'][Math.floor(Math.random() * 5)];
        break;
      case 'mountain-bikes':
        subcategory = ['Trail', 'Cross-Country', 'Enduro', 'Downhill', 'Fat Bike'][Math.floor(Math.random() * 5)];
        break;
    }

    // Create owner object that matches the Owner interface
    const owner = {
      id: ownerPersona.id,
      name: ownerPersona.name,
      imageUrl: ownerPersona.avatar_url,
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      reviewCount: Math.floor(Math.random() * 50) + 5, // Random review count 5-55
      responseRate: 90 + Math.floor(Math.random() * 10), // Random response rate 90-99%
      location: location.name,
      memberSince: '2020',
    };
    
    const item: Equipment = {
      id: `mock-${i + 1}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${Math.floor(Math.random() * 1000)}`,
      category,
      subcategory,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      price_per_day: Math.floor(Math.random() * 200) + 50,
      image_url: getImageForCategory(category),
      rating: Math.floor(Math.random() * 50) / 10 + 3,
      review_count: Math.floor(Math.random() * 20),
      location: {
        lat: location.lat + (Math.random() - 0.5) * 0.1,
        lng: location.lng + (Math.random() - 0.5) * 0.1,
        zip: generateRandomZip(), // Add zip code
      },
      distance: Math.floor(Math.random() * 50) + 1,
      specifications: {
        size: generateSizeForCategory(category),
        weight: `${Math.floor(Math.random() * 10) + 5} lbs`,
        material: materials[Math.floor(Math.random() * materials.length)],
        suitable: skillLevels[Math.floor(Math.random() * skillLevels.length)],
      },
      availability: {
        available: true,
      },
      pricing_options: [{
        id: `pricing-${i + 1}`,
        price: Math.floor(Math.random() * 200) + 50,
        duration: '1 day',
      }],
      owner: owner,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      visible_on_map: true,
      has_multiple_images: Math.random() > 0.7,
    };
    
    equipment.push(item);
  }
  
  return equipment;
};

const getImageForCategory = (category: string): string => {
  const imageMap: { [key: string]: string } = {
    'snowboards': 'https://images.unsplash.com/photo-1551524164-687a55dd1126?auto=format&fit=crop&w=800&q=80',
    'skis': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
    'surfboards': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
    'mountain-bikes': 'https://images.unsplash.com/photo-1558568382-b0ad6dd895e7?auto=format&fit=crop&w=800&q=80',
  };
  return imageMap[category] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80';
};

const generateSizeForCategory = (category: string): string => {
  switch (category) {
    case 'snowboards':
      return `${140 + Math.floor(Math.random() * 20)}cm`;
    case 'skis':
      return `${150 + Math.floor(Math.random() * 30)}cm`;
    case 'surfboards':
      const length = 6 + Math.floor(Math.random() * 3);
      const width = 18 + Math.floor(Math.random() * 4);
      const thickness = 2 + Math.floor(Math.random() * 2);
      return `${length}' x ${width}" x ${thickness}"`;
    case 'mountain-bikes':
      const sizes = ['Small', 'Medium', 'Large', 'XL'];
      return sizes[Math.floor(Math.random() * sizes.length)];
    default:
      return 'Medium';
  }
};

const generateRandomZip = (): string => {
  // Generate a random 5-digit ZIP code for California
  return (90000 + Math.floor(Math.random() * 9999)).toString();
};

// Export with the correct name
export const generateMockEquipment = generateRandomEquipment;
export { generateRandomEquipment };
