import { supabase } from '@/integrations/supabase/client';
import { normalizeCurrencyCode } from '@/utils/currency';
import {
  isMissingCurrencyCodeColumnError,
  omitCurrencyCode,
} from '@/utils/supabaseCurrencyCompat';
import { mockLightspeedItems, LightspeedItem } from './mockLightspeedData';

export const fetchMockLightspeedInventory = async (): Promise<LightspeedItem[]> => {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 1000));
  return mockLightspeedItems;
};

export const ingestLightspeedInventory = async (items: LightspeedItem[], userId: string) => {
  for (const item of items) {
    const payload = {
      user_id: userId,
      name: item.description,
      category: item.category,
      description: item.manufacturer || '',
      price_per_day: item.price,
      currency_code: normalizeCurrencyCode(item.currency_code),
      status: 'available',
      visible_on_map: true,
    };
    let { error } = await supabase.from('equipment').insert(payload);
    if (isMissingCurrencyCodeColumnError(error)) {
      ({ error } = await supabase.from('equipment').insert(omitCurrencyCode(payload)));
    }
    if (error) {
      console.error('Error inserting Lightspeed item', item.itemID, error);
    }
  }
};
