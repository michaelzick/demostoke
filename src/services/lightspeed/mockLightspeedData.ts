export interface LightspeedItem {
  itemID: string;
  description: string;
  price: number;
  image: string;
  category: string;
  manufacturer?: string;
  upc?: string;
}

export const mockLightspeedItems: LightspeedItem[] = [
  {
    itemID: 'LS-1',
    description: 'Demo Carbon Mountain Bike',
    price: 120,
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=60',
    category: 'mountain-bikes',
    manufacturer: 'Demo Bikes',
    upc: '111111',
  },
  {
    itemID: 'LS-2',
    description: 'All-Mountain Snowboard',
    price: 60,
    image: 'https://images.unsplash.com/photo-1542038332026-6d45e63d29ed?auto=format&fit=crop&w=800&q=60',
    category: 'snowboards',
    manufacturer: 'Snow Co',
    upc: '222222',
  },
  {
    itemID: 'LS-3',
    description: '9ft Epoxy Longboard',
    price: 45,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60',
    category: 'surfboards',
    manufacturer: 'WaveWorks',
    upc: '333333',
  },
];
