import { notFound, permanentRedirect } from 'next/navigation';
import GearPage from '@/screens/EquipmentDetailPage';
import { cache } from 'react';
import { loadPublicGearReviews, type PublicGearReview } from '@/services/public-gear-reviews';
import { catalog, loadGear } from '@/lib/server/public-catalog';
import { SsrPageDataProvider } from '@/contexts/SsrPageDataContext';
import { JsonLd, toNextMetadata } from '@/lib/seo/next-metadata';
import { buildGearMetaDescription, buildGearProductSchema, buildGearSummaryText } from '@/lib/seo/gearSeo';
import { buildGearDetailTitle, PUBLIC_SITE_URL } from '@/lib/seo/publicMetadata';
import { buildGearDisplayName, buildGearPath, toISODate } from '@/utils/gearUrl';
import { addQuery, type SearchValues } from '@/lib/seo/redirect-query';
import { InitialSearch } from '@/app/initial-search';
import type { Equipment } from '@/types';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ gearSlug: string }>; searchParams: Promise<SearchValues> };

const pathFor = (item: Equipment) => buildGearPath({ id: item.id, name: item.name, size: item.specifications?.size });

const reviewsFor = cache((id: string) => loadPublicGearReviews(catalog, id));

function describe(item: Equipment, reviews: PublicGearReview[] = []) {
  const displayName = buildGearDisplayName(item.name, item.specifications?.size);
  const lastVerified = toISODate(item.updated_at || item.created_at);
  const canonicalUrl = PUBLIC_SITE_URL + pathFor(item);
  const summaryText = buildGearSummaryText({ displayName, locationText: item.location.address });
  return {
    title: buildGearDetailTitle(displayName),
    description: buildGearMetaDescription({ summaryText, rawDescription: item.description }),
    canonicalUrl,
    image: item.images?.[0],
    schema: buildGearProductSchema({
      displayName,
      canonicalUrl,
      summaryText,
      lastVerified,
      category: item.category,
      imageUrls: item.images ?? [],
      isAvailable: true,
      pricePerHour: item.price_per_hour,
      pricePerDay: item.price_per_day,
      pricePerWeek: item.price_per_week,
      priceCurrency: item.currency_code,
      rating: item.rating,
      reviewCount: item.review_count,
      reviews,
    }),
  };
}

export async function generateMetadata({ params }: Props) {
  const equipment = await loadGear((await params).gearSlug);
  if (!equipment) notFound();
  return toNextMetadata(describe(equipment));
}

export default async function Page({ params, searchParams }: Props) {
  const { gearSlug } = await params;
  const equipment = await loadGear(gearSlug);
  if (!equipment) notFound();
  const path = pathFor(equipment);
  const query = await searchParams;
  if (path !== `/gear/${gearSlug}`) permanentRedirect(addQuery(path, query));
  const reviews = await reviewsFor(equipment.id);
  return (
    <SsrPageDataProvider value={{ equipment, reviews }}>
      <JsonLd value={describe(equipment, reviews).schema} />
      <InitialSearch values={query}><GearPage /></InitialSearch>
    </SsrPageDataProvider>
  );
}
