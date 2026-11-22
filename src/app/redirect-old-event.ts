import { permanentRedirect } from 'next/navigation';
import { loadEvent } from '@/lib/server/public-catalog';
import { buildDemoEventPath } from '@/utils/eventSlug';
import { addQuery, type SearchValues } from '@/lib/seo/redirect-query';

export default async function RedirectOldEvent({ params, searchParams }: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<SearchValues>;
}) {
  const { eventSlug } = await params;
  const event = await loadEvent(eventSlug);
  const canonical = event ? buildDemoEventPath(event) : `/demo-calendar/event/${encodeURIComponent(eventSlug)}`;
  permanentRedirect(addQuery(canonical, await searchParams));
}
