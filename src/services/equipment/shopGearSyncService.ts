import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { fetchEquipmentFromShopGearFeed } from "./shopGearFeedService";

const SOURCE_PROVIDER = "demostoke_widget";
const IMAGE_BUCKET = "gear-images";
const LOCALHOST_HOSTNAMES = new Set(["127.0.0.1", "localhost", "0.0.0.0"]);

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
  removedCount: number;
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

const guessImageExtension = (
  sourceUrl: string,
  contentType?: string | null,
): string => {
  try {
    const pathname = new URL(sourceUrl).pathname;
    const extension = pathname.split(".").pop()?.trim().toLowerCase();
    if (extension && extension.length <= 5) return extension;
  } catch {
    // Fall through to content type mapping.
  }

  const normalizedType = contentType?.split(";")[0]?.trim().toLowerCase();
  switch (normalizedType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    case "image/svg+xml":
      return "svg";
    default:
      return "jpg";
  }
};

const resolveSourceImageUrl = (value: string, endpointUrl: string): string => {
  try {
    return new URL(value).toString();
  } catch {
    const endpointOrigin = new URL(endpointUrl).origin;
    const normalizedPath = value.startsWith("/")
      ? value
      : `/${value.replace(/^\.?\/*/, "")}`;
    return new URL(normalizedPath, endpointOrigin).toString();
  }
};

const buildImageProxyUrl = (sourceUrl: string, endpointUrl: string): string => {
  const proxyUrl = new URL(endpointUrl);
  proxyUrl.searchParams.set("proxy_image_url", sourceUrl);
  return proxyUrl.toString();
};

const shouldProxyImageUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.pathname.includes("/storage/v1/object/public/");
  } catch {
    return false;
  }
};

const shouldMirrorImageUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol !== "https:" ||
      LOCALHOST_HOSTNAMES.has(parsed.hostname)
    );
  } catch {
    return true;
  }
};

const mirrorImageToDemostokeStorage = async ({
  sourceUrl,
  endpointUrl,
  userId,
  itemId,
  imageIndex,
  headers,
}: {
  sourceUrl: string;
  endpointUrl: string;
  userId: string;
  itemId: string;
  imageIndex: number;
  headers?: HeadersInit;
}): Promise<string> => {
  const downloadUrl = shouldProxyImageUrl(sourceUrl)
    ? buildImageProxyUrl(sourceUrl, endpointUrl)
    : sourceUrl;
  const response = await fetch(
    downloadUrl,
    headers ? { headers } : undefined,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to download source image (${response.status}) from ${downloadUrl}`,
    );
  }

  const blob = await response.blob();
  const extension = guessImageExtension(
    sourceUrl,
    response.headers.get("content-type"),
  );
  const filePath = `synced-shop-feed/${userId}/${itemId}-${imageIndex}-${crypto.randomUUID()}.${extension}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filePath, blob, {
      contentType: blob.type || response.headers.get("content-type") || undefined,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload mirrored image: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(uploadData.path);

  return publicUrl;
};

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
    console.warn(
      "Skipping endpoint mapping save:",
      mappingError.message,
    );
  }

  const sourceItemIds = new Set(externalGear.map((item) => item.id));
  const { data: existingSyncedRows, error: existingSyncedRowsError } =
    await supabase
      .from("equipment")
      .select("id, external_source_item_id")
      .eq("user_id", userId)
      .eq("external_source_provider", SOURCE_PROVIDER)
      .eq("external_source_endpoint_url", endpointUrl)
      .eq("external_source_shop_slug", shopSlug);

  if (existingSyncedRowsError) {
    throw new Error(
      `Unable to load previously synced equipment: ${existingSyncedRowsError.message}`,
    );
  }

  const staleEquipmentIds = (existingSyncedRows ?? [])
    .filter((row) => {
      const externalId = row.external_source_item_id;
      return !externalId || !sourceItemIds.has(externalId);
    })
    .map((row) => row.id);

  if (staleEquipmentIds.length > 0) {
    const { error: deleteStaleError } = await supabase
      .from("equipment")
      .delete()
      .in("id", staleEquipmentIds);

    if (deleteStaleError) {
      throw new Error(
        `Unable to remove stale synced gear: ${deleteStaleError.message}`,
      );
    }
  }

  if (externalGear.length === 0) {
    return {
      syncedCount: 0,
      removedCount: staleEquipmentIds.length,
      endpointUrl: buildCanonicalFeedUrl(endpointUrl, shopSlug, includeHidden),
      shopSlug,
    };
  }

  const mirroredImageUrlCache = new Map<string, string>();
  const normalizedImagesByItemId = new Map<string, string[]>();

  for (const item of externalGear) {
    const rawImageUrls =
      item.images && item.images.length > 0
        ? item.images
        : item.image_url
          ? [item.image_url]
          : [];

    const normalizedImageUrls: string[] = [];

    for (let index = 0; index < rawImageUrls.length; index += 1) {
      const rawUrl = rawImageUrls[index];
      if (!rawUrl) continue;

      try {
        const resolvedSourceUrl = resolveSourceImageUrl(rawUrl, endpointUrl);
        const finalUrl = shouldMirrorImageUrl(resolvedSourceUrl)
          ? mirroredImageUrlCache.get(resolvedSourceUrl) ||
            await mirrorImageToDemostokeStorage({
              sourceUrl: resolvedSourceUrl,
              endpointUrl,
              userId,
              itemId: item.id,
              imageIndex: index,
              headers,
            })
          : resolvedSourceUrl;

        if (!mirroredImageUrlCache.has(resolvedSourceUrl) && finalUrl !== resolvedSourceUrl) {
          mirroredImageUrlCache.set(resolvedSourceUrl, finalUrl);
        }

        if (!normalizedImageUrls.includes(finalUrl)) {
          normalizedImageUrls.push(finalUrl);
        }
      } catch (error) {
        console.warn(
          `Skipping image ${index + 1} for synced gear "${item.name || item.id}":`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    normalizedImagesByItemId.set(item.id, normalizedImageUrls);
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
    has_multiple_images:
      (normalizedImagesByItemId.get(item.id)?.length ?? 0) > 1,
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

      const imageUrls = normalizedImagesByItemId.get(item.id) || [];

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
    removedCount: staleEquipmentIds.length,
    endpointUrl: buildCanonicalFeedUrl(endpointUrl, shopSlug, includeHidden),
    shopSlug,
  };
};
