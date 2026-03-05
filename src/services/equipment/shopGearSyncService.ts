import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { fetchEquipmentFromShopGearFeed } from "./shopGearFeedService";

const SOURCE_PROVIDER = "demostoke_widget";

type EquipmentInsert = Database["public"]["Tables"]["equipment"]["Insert"];
type EquipmentImageInsert =
  Database["public"]["Tables"]["equipment_images"]["Insert"];
type PricingOptionInsert =
  Database["public"]["Tables"]["pricing_options"]["Insert"];

export type SyncShopGearParams = {
  userId: string;
  endpointInput: string;
};

export type SyncShopGearResult = {
  syncedCount: number;
  endpointUrl: string;
  shopSlug: string;
};

const parseShopFeedEndpoint = (input: string) => {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("Please enter a valid endpoint URL.");
  }

  const shopSlug =
    parsed.searchParams.get("shop")?.trim() ||
    parsed.searchParams.get("shop_slug")?.trim() ||
    "";

  if (!shopSlug) {
    throw new Error(
      "Endpoint URL must include a shop slug query param, e.g. ?shop=my-shop.",
    );
  }

  const includeHidden = parsed.searchParams.get("include_hidden") === "true";
  const endpointUrl = `${parsed.origin}${parsed.pathname}`;

  return {
    endpointUrl,
    shopSlug,
    includeHidden,
  };
};

const toNullableNumber = (value: number | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const buildCanonicalFeedUrl = (
  endpointUrl: string,
  shopSlug: string,
  includeHidden: boolean,
) =>
  `${endpointUrl}?shop=${encodeURIComponent(shopSlug)}${
    includeHidden ? "&include_hidden=true" : ""
  }`;

export const syncShopGearFromEndpoint = async ({
  userId,
  endpointInput,
}: SyncShopGearParams): Promise<SyncShopGearResult> => {
  if (!userId) {
    throw new Error("You must be signed in to sync shop gear.");
  }

  const { endpointUrl, shopSlug, includeHidden } =
    parseShopFeedEndpoint(endpointInput);

  const apiKey = import.meta.env.VITE_SHOP_GEAR_FEED_APIKEY as
    | string
    | undefined;
  const headers = apiKey
    ? {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      }
    : undefined;

  const externalGear = await fetchEquipmentFromShopGearFeed({
    endpointUrl,
    shopSlug,
    includeHidden,
    ownerOverride: {
      id: userId,
      shopId: null,
    },
    headers,
  });

  const { error: mappingError } = await supabase
    .from("shop_gear_feed_mappings")
    .upsert(
      {
        profile_id: userId,
        provider: SOURCE_PROVIDER,
        endpoint_url: endpointUrl,
        shop_slug: shopSlug,
        include_hidden: includeHidden,
        is_active: true,
      },
      {
        onConflict: "profile_id,provider",
      },
    );

  if (mappingError) {
    throw new Error(
      `Unable to save sync endpoint mapping: ${mappingError.message}`,
    );
  }

  if (externalGear.length === 0) {
    return {
      syncedCount: 0,
      endpointUrl: buildCanonicalFeedUrl(endpointUrl, shopSlug, includeHidden),
      shopSlug,
    };
  }

  const syncedAt = new Date().toISOString();
  const equipmentPayload: EquipmentInsert[] = externalGear.map((item) => ({
    user_id: userId,
    name: item.name,
    category: item.category || "snowboards",
    subcategory: item.subcategory ?? null,
    description: item.description || "",
    price_per_day: Number(item.price_per_day || 0),
    price_per_hour: toNullableNumber(item.price_per_hour),
    price_per_week: toNullableNumber(item.price_per_week),
    damage_deposit: toNullableNumber(item.damage_deposit),
    rating: toNullableNumber(item.rating) ?? 0,
    review_count: item.review_count ?? 0,
    status: item.status || "available",
    visible_on_map: item.visible_on_map ?? true,
    has_multiple_images: (item.images?.length ?? 0) > 1,
    location_address: item.location?.address || null,
    location_lat: toNullableNumber(item.location?.lat),
    location_lng: toNullableNumber(item.location?.lng),
    size: item.specifications?.size || null,
    weight: item.specifications?.weight || null,
    material: item.specifications?.material || null,
    suitable_skill_level: item.specifications?.suitable || null,
    external_source_provider: SOURCE_PROVIDER,
    external_source_endpoint_url: endpointUrl,
    external_source_shop_slug: shopSlug,
    external_source_item_id: item.id,
    external_source_synced_at: syncedAt,
    updated_at: syncedAt,
  }));

  const { data: syncedRows, error: equipmentError } = await supabase
    .from("equipment")
    .upsert(equipmentPayload, {
      onConflict: "user_id,external_source_provider,external_source_item_id",
    })
    .select("id, external_source_item_id");

  if (equipmentError) {
    throw new Error(`Unable to sync equipment records: ${equipmentError.message}`);
  }

  const equipmentIdByExternalId = new Map(
    (syncedRows ?? [])
      .filter((row) => !!row.external_source_item_id)
      .map((row) => [row.external_source_item_id as string, row.id]),
  );
  const syncedEquipmentIds = Array.from(equipmentIdByExternalId.values());

  if (syncedEquipmentIds.length > 0) {
    const { error: deleteImagesError } = await supabase
      .from("equipment_images")
      .delete()
      .in("equipment_id", syncedEquipmentIds);
    if (deleteImagesError) {
      throw new Error(
        `Unable to refresh equipment images: ${deleteImagesError.message}`,
      );
    }

    const imageRows: EquipmentImageInsert[] = [];
    externalGear.forEach((item) => {
      const equipmentId = equipmentIdByExternalId.get(item.id);
      if (!equipmentId) return;

      const imageUrls =
        item.images && item.images.length > 0
          ? item.images
          : item.image_url
            ? [item.image_url]
            : [];

      imageUrls.forEach((url, index) => {
        imageRows.push({
          equipment_id: equipmentId,
          image_url: url,
          display_order: index,
          is_primary: index === 0,
        });
      });
    });

    if (imageRows.length > 0) {
      const { error: insertImagesError } = await supabase
        .from("equipment_images")
        .insert(imageRows);
      if (insertImagesError) {
        throw new Error(
          `Unable to store equipment images: ${insertImagesError.message}`,
        );
      }
    }

    const { error: deletePricingError } = await supabase
      .from("pricing_options")
      .delete()
      .in("equipment_id", syncedEquipmentIds);
    if (deletePricingError) {
      throw new Error(
        `Unable to refresh pricing options: ${deletePricingError.message}`,
      );
    }

    const pricingRows: PricingOptionInsert[] = [];
    externalGear.forEach((item) => {
      const equipmentId = equipmentIdByExternalId.get(item.id);
      if (!equipmentId || !Array.isArray(item.pricing_options)) return;

      item.pricing_options.forEach((option) => {
        pricingRows.push({
          equipment_id: equipmentId,
          duration: option.duration,
          price: Number(option.price || 0),
        });
      });
    });

    if (pricingRows.length > 0) {
      const { error: insertPricingError } = await supabase
        .from("pricing_options")
        .insert(pricingRows);
      if (insertPricingError) {
        throw new Error(
          `Unable to store pricing options: ${insertPricingError.message}`,
        );
      }
    }
  }

  return {
    syncedCount: syncedEquipmentIds.length,
    endpointUrl: buildCanonicalFeedUrl(endpointUrl, shopSlug, includeHidden),
    shopSlug,
  };
};
