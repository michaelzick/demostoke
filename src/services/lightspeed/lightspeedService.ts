import { supabase } from '@/integrations/supabase/client';
import { mockLightspeedItems, LightspeedItem } from './mockLightspeedData';

export const fetchMockLightspeedInventory = async (): Promise<LightspeedItem[]> => {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 1000));
  return mockLightspeedItems;
};

export const ingestLightspeedInventory = async (items: LightspeedItem[], userId: string) => {
  for (const item of items) {
    const { error } = await supabase.from('equipment').insert({
      user_id: userId,
      name: item.description,
      category: item.category,
      description: item.manufacturer || '',
      price_per_day: item.price,
      image_url: item.image,
      location_zip: '00000',
      status: 'available',
      visible_on_map: true,
    });
    if (error) {
      console.error('Error inserting Lightspeed item', item.itemID, error);
    }
  }
};
