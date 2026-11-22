import { notFound, permanentRedirect } from 'next/navigation';
import DemoEventPage from '@/screens/DemoEventPage';
import { SsrPageDataProvider } from '@/contexts/SsrPageDataContext';
import { loadEvent } from '@/lib/server/public-catalog';
import { eventMetadata } from '@/lib/seo/event-metadata';
import { JsonLd, toNextMetadata } from '@/lib/seo/next-metadata';
import { buildDemoEventPath } from '@/utils/eventSlug';
import { addQuery, type SearchValues } from '@/lib/seo/redirect-query';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ eventSlug: string }>; searchParams: Promise<SearchValues> };

export async function generateMetadata({ params }: Props) {
  const event = await loadEvent((await params).eventSlug);
  if (!event) notFound();
  return toNextMetadata(eventMetadata(event));
}

export default async function Page({ params, searchParams }: Props) {
  const { eventSlug } = await params;
  const event = await loadEvent(eventSlug);
  if (!event) notFound();
  const path = buildDemoEventPath(event);
  if (path !== `/demo-calendar/event/${eventSlug}`) permanentRedirect(addQuery(path, await searchParams));
  return (
    <SsrPageDataProvider value={{ demoEvent: event, demoEventResolved: true }}>
      <JsonLd value={eventMetadata(event).schema} />
      <DemoEventPage />
    </SsrPageDataProvider>
  );
}
