import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";
import { convertSupabaseToEquipment } from "./equipmentConverter";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";
import { deduplicateImageUrls } from "@/utils/imageDeduplication";
import { getHiddenUserIds, filterHiddenUsers } from "./hiddenUserFilter";
import { fetchEquipmentFromShopGearFeed } from "./shopGearFeedService";

export type EquipmentDataOptions = {
  start?: string | Date;
  end?: string | Date;
};

export const fetchEquipmentFromSupabase = async (): Promise<Equipment[]> => {
  // Paginate to bypass PostgREST max_rows (default 1000)
  const PAGE_SIZE = 1000;
  const allData: any[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("equipment")
      .select(
        `
        *,
        profiles!equipment_user_id_fkey (
          name,
          avatar_url
        )
      `,
      )
      .eq("status", "available")
      .eq("visible_on_map", true)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("❌ Supabase query error:", error);
      throw error;
    }

    allData.push(...(data || []));
    hasMore = (data?.length || 0) === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  if (allData.length === 0) {
    return [];
  }

  const data = allData;

  // Filter out equipment from hidden users
  const hiddenUserIds = await getHiddenUserIds();
  const visibleData = filterHiddenUsers(data, hiddenUserIds);

  // Convert each item and fetch additional images
  const convertedEquipment = await Promise.all(
    visibleData.map(async (item) => {
      // Fetch images from equipment_images table
      const additionalImages = await fetchEquipmentImages(item.id);

      const allImages = deduplicateImageUrls(additionalImages);

      const flatItem = {
        ...item,
        profile_name: item.profiles?.name,
        profile_avatar_url: item.profiles?.avatar_url,
        all_images: allImages,
      };

      return await convertSupabaseToEquipment(flatItem);
    }),
  );

  return convertedEquipment;
};

const getDateRangeFromQueryString = (): EquipmentDataOptions => {
  if (typeof window === "undefined") return {};

  const searchParams = new URLSearchParams(window.location.search);
  const keyPairs: Array<[string, string]> = [
    ["start", "end"],
    ["startDate", "endDate"],
    ["from", "to"],
    ["checkin", "checkout"],
  ];

  for (const [startKey, endKey] of keyPairs) {
    const start = searchParams.get(startKey);
    const end = searchParams.get(endKey);
    if (start && end) {
      return { start, end };
    }
  }

  return {};
};

const resolveDateRange = (
  options: EquipmentDataOptions | undefined,
  envStart: string | undefined,
  envEnd: string | undefined,
): EquipmentDataOptions => {
  if (options?.start && options?.end) {
    return { start: options.start, end: options.end };
  }

  if (options?.start || options?.end) {
    console.warn(
      "Ignoring partial equipment date range. Both start and end are required.",
    );
  }

  const queryRange = getDateRangeFromQueryString();
  if (queryRange.start && queryRange.end) {
    return queryRange;
  }

  if (envStart && envEnd) {
    return { start: envStart, end: envEnd };
  }

  if (envStart || envEnd) {
    console.warn(
      "Ignoring partial env date range. Set both VITE_SHOP_GEAR_FEED_START and VITE_SHOP_GEAR_FEED_END.",
    );
  }

  return {};
};

const fetchEquipmentFromConfiguredShopFeed = async (
  options?: EquipmentDataOptions,
): Promise<Equipment[] | null> => {
  const useShopFeed = import.meta.env.VITE_USE_SHOP_GEAR_FEED === "true";
  if (!useShopFeed) return null;

  const endpointUrl = import.meta.env.VITE_SHOP_GEAR_FEED_URL as string | undefined;
  const shopSlug = import.meta.env.VITE_SHOP_GEAR_FEED_SHOP_SLUG as string | undefined;
  const envStart = import.meta.env.VITE_SHOP_GEAR_FEED_START as string | undefined;
  const envEnd = import.meta.env.VITE_SHOP_GEAR_FEED_END as string | undefined;
  const includeHidden = import.meta.env.VITE_SHOP_GEAR_FEED_INCLUDE_HIDDEN === "true";
  const apiKey = import.meta.env.VITE_SHOP_GEAR_FEED_APIKEY as string | undefined;
  const { start, end } = resolveDateRange(options, envStart, envEnd);

  if (!endpointUrl || !shopSlug) {
    console.warn(
      "VITE_USE_SHOP_GEAR_FEED is enabled but VITE_SHOP_GEAR_FEED_URL or VITE_SHOP_GEAR_FEED_SHOP_SLUG is missing. Falling back to Supabase equipment query.",
    );
    return null;
  }

  try {
    const headers = apiKey
      ? {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
        }
      : undefined;

    return await fetchEquipmentFromShopGearFeed({
      endpointUrl,
      shopSlug,
      start,
      end,
      includeHidden,
      headers,
    });
  } catch (error) {
    console.error("Failed to fetch shop gear feed; falling back to Supabase data.", error);
    return null;
  }
};

// Export getEquipmentData function that returns real data from Supabase
export const getEquipmentData = async (
  options?: EquipmentDataOptions,
): Promise<Equipment[]> => {
  const feedEquipment = await fetchEquipmentFromConfiguredShopFeed(options);
  if (feedEquipment) return feedEquipment;

  return await fetchEquipmentFromSupabase();
};
