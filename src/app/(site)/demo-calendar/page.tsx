import Link from 'next/link';
import { buildDemoEventPath } from '@/utils/eventSlug';
import { isPastDemoEvent } from '@/lib/seo/policy';
import DemoCalendarPage from '@/screens/DemoCalendarPage';
import { SsrPageDataProvider } from '@/contexts/SsrPageDataContext';
import { loadEvents } from '@/lib/server/public-catalog';
import { routeMetadata } from '@/lib/seo/next-metadata';

export const dynamic = 'force-dynamic';
export const metadata = routeMetadata('/demo-calendar');

export default async function Page() {
  const demoEvents = await loadEvents();
  const upcoming = demoEvents.filter((event) => event.event_date && !isPastDemoEvent(event)).slice(0, 12);
  return (
    <SsrPageDataProvider value={{ demoEvents }}>
      <DemoCalendarPage />
      {!!upcoming.length && (
        <section className="container mx-auto px-4 pb-12">
          <h2 className="mb-4 text-xl font-semibold">Upcoming demo events</h2>
          <ul className="grid list-inside list-disc gap-2 sm:grid-cols-2">
            {upcoming.map((event) => (
              <li key={event.id}>
                <Link prefetch={false} className="underline hover:text-primary" href={buildDemoEventPath(event)}>
                  {event.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </SsrPageDataProvider>
  );
}
