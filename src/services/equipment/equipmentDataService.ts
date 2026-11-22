import { supabase } from "@/integrations/supabase/client";
import { Equipment } from "@/types";
import { convertSupabaseToEquipment } from "./equipmentConverter";
import { deduplicateImageUrls } from "@/utils/imageDeduplication";
import { getHiddenUserIds, filterHiddenUsers } from "./hiddenUserFilter";
import { fetchConfiguredShopGearFeed } from "./configuredShopGearFeed";

export type EquipmentDataOptions = {
  start?: string | Date;
  end?: string | Date;
};

export const fetchEquipmentFromSupabase = async (): Promise<Equipment[]> => {
  // Paginate to bypass PostgREST max_rows (default 1000).
  // Images are embedded via the PostgREST join so we avoid one query per item.
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
        ),
        equipment_images (
          image_url,
          display_order,
          is_primary
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

  // Images are already embedded — sort and extract URLs without extra queries
  const convertedEquipment = await Promise.all(
    visibleData.map(async (item) => {
      const embeddedImages: Array<{ image_url: string; display_order: number; is_primary: boolean }> =
        item.equipment_images ?? [];

      const sortedImageUrls = embeddedImages
        .slice()
        .sort((a, b) => {
          if (b.is_primary !== a.is_primary) return b.is_primary ? 1 : -1;
          return a.display_order - b.display_order;
        })
        .map((img) => img.image_url);

      const allImages = deduplicateImageUrls(sortedImageUrls);

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

const fetchEquipmentFromConfiguredShopFeed = async (
  options?: EquipmentDataOptions,
): Promise<Equipment[] | null> => {
  if (process.env.NEXT_PUBLIC_USE_SHOP_GEAR_FEED !== "true") return null;
  if ((options?.start && !options.end) || (options?.end && !options.start)) {
    console.warn("Ignoring partial equipment date range. Both start and end are required.");
  }
  const { start, end } = options?.start && options.end ? options : getDateRangeFromQueryString();
  const date = (value: string | Date) => typeof value === "string" ? value : value.toISOString();

  try {
    return await fetchConfiguredShopGearFeed(start && end ? { start: date(start), end: date(end) } : {});
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
