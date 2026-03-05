import { supabase } from "@/integrations/supabase/client";

export type ActiveShopGearFeedMapping = {
  id: string;
  profileId: string;
  endpointUrl: string;
  shopSlug: string;
  includeHidden: boolean;
};

export const fetchActiveShopGearFeedMappings = async (): Promise<
  ActiveShopGearFeedMapping[]
> => {
  const { data, error } = await supabase
    .from("shop_gear_feed_mappings")
    .select("id, profile_id, endpoint_url, shop_slug, include_hidden")
    .eq("provider", "demostoke_widget")
    .eq("is_active", true);

  if (error) {
    console.error("Failed to load shop gear feed mappings:", error);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const endpointUrl = row.endpoint_url?.trim();
      const shopSlug = row.shop_slug?.trim();

      if (!endpointUrl || !shopSlug || !row.profile_id) return null;

      return {
        id: row.id,
        profileId: row.profile_id,
        endpointUrl,
        shopSlug,
        includeHidden: !!row.include_hidden,
      } satisfies ActiveShopGearFeedMapping;
    })
    .filter((row): row is ActiveShopGearFeedMapping => row !== null);
};
