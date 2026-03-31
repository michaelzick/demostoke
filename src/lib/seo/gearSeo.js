export const PUBLIC_GEAR_CATEGORIES = Object.freeze([
  'snowboards',
  'skis',
  'surfboards',
  'mountain-bikes',
]);

const normalizePrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) ? price : 0;
};

export const isPublicGearCategory = (category) =>
  PUBLIC_GEAR_CATEGORIES.includes(category);

export const parseLegacyGearRoute = (pathname = '') => {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
  if (!normalizedPath) {
    return null;
  }

  const segments = normalizedPath.split('/');
  if (segments.length !== 3) {
    return null;
  }

  const [category, ownerSlug, slug] = segments;
  if (!category || !ownerSlug || !slug || !isPublicGearCategory(category)) {
    return null;
  }

  return { category, ownerSlug, slug };
};

export const buildLegacyGearNamePattern = (slug = '') => {
  const nameParts = slug
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (nameParts.length === 0) {
    return null;
  }

  return `%${nameParts.join('%')}%`;
};

export const buildGearSummaryText = ({
  displayName,
  locationText,
  lastVerified,
}) => `${displayName} is available in ${locationText || 'United States'}. Last verified ${lastVerified}.`;

export const buildGearMetaDescription = ({
  summaryText,
  rawDescription,
}) => `${summaryText} ${rawDescription || ''}`.trim().slice(0, 350);

export const buildGearOfferSchema = ({
  canonicalUrl,
  isAvailable,
  lastVerified,
  pricePerHour,
  pricePerDay,
  pricePerWeek,
}) => {
  const baseOffer = {
    '@type': 'Offer',
    priceCurrency: 'USD',
    availability: isAvailable
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    availabilityStarts: lastVerified,
    businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
    url: canonicalUrl,
  };

  const offers = [];

  const hourlyPrice = normalizePrice(pricePerHour);
  if (hourlyPrice > 0) {
    offers.push({
      ...baseOffer,
      name: 'Hourly rental',
      price: String(hourlyPrice),
    });
  }

  const dailyPrice = normalizePrice(pricePerDay);
  if (dailyPrice > 0) {
    offers.push({
      ...baseOffer,
      name: 'Daily rental',
      price: String(dailyPrice),
    });
  }

  const weeklyPrice = normalizePrice(pricePerWeek);
  if (weeklyPrice > 0) {
    offers.push({
      ...baseOffer,
      name: 'Weekly rental',
      price: String(weeklyPrice),
    });
  }

  return offers;
};

export const buildGearProductSchema = ({
  canonicalUrl,
  category,
  displayName,
  imageUrls,
  isAvailable,
  lastVerified,
  pricePerHour,
  pricePerDay,
  pricePerWeek,
  rating,
  reviewCount,
  summaryText,
}) => {
  const offers = buildGearOfferSchema({
    canonicalUrl,
    isAvailable,
    lastVerified,
    pricePerHour,
    pricePerDay,
    pricePerWeek,
  });

  const offerPrices = offers
    .map((offer) => Number(offer.price))
    .filter((price) => Number.isFinite(price));

  const offerSchema =
    offers.length > 1
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: String(Math.min(...offerPrices)),
          highPrice: String(Math.max(...offerPrices)),
          offerCount: String(offers.length),
          offers,
        }
      : offers[0];

  const normalizedRating = Number(rating);
  const normalizedReviewCount = Number(reviewCount);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: displayName,
    description: summaryText,
    image: (imageUrls || []).filter(Boolean),
    url: canonicalUrl,
    category,
    offers: offerSchema,
    aggregateRating:
      normalizedReviewCount > 0 &&
      normalizedRating > 0 &&
      normalizedRating <= 5
        ? {
            '@type': 'AggregateRating',
            ratingValue: normalizedRating,
            reviewCount: normalizedReviewCount,
          }
        : undefined,
  };
};
