import type { Equipment } from '@/types';

type FeedAvailability = {
  available?: boolean;
  nextAvailableDate?: string | null;
  next_available_date?: string | null;
};

type FeedOwner = {
  id?: string;
  name?: string;
  imageUrl?: string;
  logo_url?: string;
  rating?: number;
  reviewCount?: number;
  responseRate?: number;
};

type FeedLocation = {
  lat?: number;
  lng?: number;
  address?: string;
};

type FeedSpecifications = {
  size?: string;
  weight?: string;
  material?: string;
  suitable?: string;
};

type FeedShop = {
  id?: string;
  slug?: string;
  name?: string;
  logo_url?: string | null;
};

export type ShopGearFeedItem = {
  id: string;
  user_id?: string;
  name?: string;
  category?: string;
  subcategory?: string | null;
  description?: string | null;
  image_url?: string | null;
  images?: string[];
  price_per_day?: number | string | null;
  price_per_hour?: number | string | null;
  price_per_week?: number | string | null;
  damage_deposit?: number | string | null;
  rating?: number | string | null;
  review_count?: number | string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
  visible_on_map?: boolean;
  location?: FeedLocation;
  specifications?: FeedSpecifications;
  availability?: FeedAvailability;
  pricing_options?: Array<{ id: string; duration: string; price: number | string }>;
  owner?: FeedOwner;
};

type ShopGearFeedResponse = {
  shop?: FeedShop;
  gear?: ShopGearFeedItem[];
};

const hasGearItems = (
  payload: ShopGearFeedResponse | { error?: string } | null,
): payload is { gear: ShopGearFeedItem[] } =>
  Boolean(
    payload &&
      typeof payload === 'object' &&
      'gear' in payload &&
      Array.isArray(payload.gear),
  );

const hasFeedShop = (
  payload: ShopGearFeedResponse | { error?: string } | null,
): payload is { shop: FeedShop } =>
  Boolean(
    payload &&
      typeof payload === 'object' &&
      'shop' in payload &&
      payload.shop &&
      typeof payload.shop === 'object',
  );

type OwnerOverride = {
  id?: string;
  name?: string;
  imageUrl?: string;
  shopId?: string | null;
  partyId?: string | null;
};

export type FetchShopGearFeedParams = {
  endpointUrl: string;
  shopSlug: string;
  start?: string | Date;
  end?: string | Date;
  includeHidden?: boolean;
  ownerOverride?: OwnerOverride;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

const toNumber = (
  value: number | string | null | undefined,
  fallback = 0,
): number => {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCategory = (category?: string): string => {
  const normalized = (category || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

  if (!normalized) return 'snowboards';
  if (
    normalized === 'mountain-bike' ||
    normalized === 'mountain-bikes' ||
    normalized === 'mountainbike' ||
    normalized === 'mountainbikes' ||
    normalized === 'mtb'
  ) {
    return 'mountain-bikes';
  }
  if (normalized === 'snowboard' || normalized === 'snowboards') {
    return 'snowboards';
  }
  if (normalized === 'ski' || normalized === 'skis') {
    return 'skis';
  }
  if (normalized === 'surfboard' || normalized === 'surfboards') {
    return 'surfboards';
  }

  return normalized;
};

const toQueryDate = (value?: string | Date): string | null => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
};

const buildFeedUrl = (params: FetchShopGearFeedParams): string => {
  const start = toQueryDate(params.start);
  const end = toQueryDate(params.end);

  if ((start && !end) || (!start && end)) {
    throw new Error('shop-gear-feed requires both start and end when filtering by date');
  }

  const url = new URL(params.endpointUrl);
  url.searchParams.set('shop', params.shopSlug);
  if (start && end) {
    url.searchParams.set('start', start);
    url.searchParams.set('end', end);
  }
  if (params.includeHidden) {
    url.searchParams.set('include_hidden', 'true');
  }
  return url.toString();
};

export const mapShopGearFeedItemToEquipment = (
  item: ShopGearFeedItem,
  ownerOverride?: OwnerOverride,
): Equipment => {
  const images =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image_url
        ? [item.image_url]
        : [];

  const ownerId = ownerOverride?.id || item.owner?.id || item.user_id || 'shop-owner';
  const ownerName = ownerOverride?.name || item.owner?.name || 'Shop';
  const ownerImage =
    ownerOverride?.imageUrl ||
    item.owner?.imageUrl ||
    item.owner?.logo_url ||
    `https://api.dicebear.com/6.x/avataaars/svg?seed=${ownerId}`;
  const ownerShopId = ownerOverride?.shopId === null ? undefined : (ownerOverride?.shopId || ownerId);
  const ownerPartyId = ownerOverride?.partyId ?? null;

  const nextAvailableDate =
    item.availability?.nextAvailableDate ||
    item.availability?.next_available_date ||
    undefined;

  return {
    id: item.id,
    user_id: ownerOverride?.id || item.user_id || ownerId,
    name: item.name || 'Unnamed gear',
    category: normalizeCategory(item.category),
    subcategory: item.subcategory || undefined,
    description: item.description || '',
    image_url: images[0] || '',
    images,
    price_per_day: toNumber(item.price_per_day, 0),
    price_per_hour:
      item.price_per_hour === null || item.price_per_hour === undefined
        ? undefined
        : toNumber(item.price_per_hour, 0),
    price_per_week:
      item.price_per_week === null || item.price_per_week === undefined
        ? undefined
        : toNumber(item.price_per_week, 0),
    damage_deposit:
      item.damage_deposit === null || item.damage_deposit === undefined
        ? undefined
        : toNumber(item.damage_deposit, 0),
    rating: toNumber(item.rating, 0),
    review_count: toNumber(item.review_count, 0),
    owner: {
      id: ownerId,
      name: ownerName,
      imageUrl: ownerImage,
      rating: toNumber(item.owner?.rating, 0),
      reviewCount: toNumber(item.owner?.reviewCount, 0),
      responseRate: toNumber(item.owner?.responseRate, 0),
      shopId: ownerShopId,
      partyId: ownerPartyId,
    },
    location: {
      lat: toNumber(item.location?.lat, 0),
      lng: toNumber(item.location?.lng, 0),
      address: item.location?.address || '',
    },
    distance: 0,
    specifications: {
      size: item.specifications?.size || '',
      weight: item.specifications?.weight || '',
      material: item.specifications?.material || '',
      suitable: item.specifications?.suitable || '',
    },
    availability: {
      available: !!item.availability?.available,
      nextAvailableDate,
    },
    pricing_options: Array.isArray(item.pricing_options)
      ? item.pricing_options.map((opt) => ({
          id: opt.id,
          duration: opt.duration,
          price: toNumber(opt.price, 0),
        }))
      : [],
    status: item.status || 'available',
    created_at: item.created_at,
    updated_at: item.updated_at,
    visible_on_map:
      item.visible_on_map !== undefined ? !!item.visible_on_map : true,
  };
};

export const fetchEquipmentFromShopGearFeed = async (
  params: FetchShopGearFeedParams,
): Promise<Equipment[]> => {
  const response = await fetch(buildFeedUrl(params), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(params.headers || {}),
    },
    signal: params.signal,
  });

  const payload = (await response.json().catch(() => null)) as
    | ShopGearFeedResponse
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? payload.error
        : null;
    throw new Error(
      message || `shop-gear-feed request failed with status ${response.status}`,
    );
  }

  const feedShop = hasFeedShop(payload) ? payload.shop : undefined;
  const ownerOverride: OwnerOverride = {
    ...params.ownerOverride,
    name: params.ownerOverride?.name || feedShop?.name || undefined,
    imageUrl: params.ownerOverride?.imageUrl || feedShop?.logo_url || undefined,
  };

  const items = hasGearItems(payload) ? payload.gear : [];
  return items.map((item) =>
    mapShopGearFeedItemToEquipment(item, ownerOverride),
  );
};
