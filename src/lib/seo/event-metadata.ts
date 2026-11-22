import type { DemoEvent } from '@/types/demo-calendar';
import { buildDemoEventPath } from '@/utils/eventSlug';
import { isPastDemoEvent } from './policy';
import { buildDemoEventDescription, buildDemoEventTitle, getDemoEventCategoryImage, PUBLIC_SITE_URL } from './publicMetadata';

export function eventMetadata(event: DemoEvent) {
  const canonicalUrl = PUBLIC_SITE_URL + buildDemoEventPath(event);
  const image = event.thumbnail_url || getDemoEventCategoryImage(event.gear_category);
  const description = buildDemoEventDescription({
    title: event.title,
    company: event.company,
    gearCategory: event.gear_category,
    eventDate: event.event_date,
    eventTime: event.event_time,
    location: event.location,
    equipmentAvailable: event.equipment_available,
  });
  const time = event.event_time && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(event.event_time)
    ? event.event_time
    : null;
  const startDate = event.event_date && (time ? `${event.event_date}T${time}` : event.event_date);
  const past = isPastDemoEvent(event);
  return {
    title: buildDemoEventTitle(event.title),
    description,
    canonicalUrl,
    image,
    robots: past ? 'noindex, follow' : undefined,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: PUBLIC_SITE_URL + '/' },
          { '@type': 'ListItem', position: 2, name: 'Demo Calendar', item: PUBLIC_SITE_URL + '/demo-calendar' },
          { '@type': 'ListItem', position: 3, name: event.title, item: canonicalUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description,
        startDate: startDate || undefined,
        eventStatus: startDate && !past ? 'https://schema.org/EventScheduled' : undefined,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        image,
        url: canonicalUrl,
        location: event.location ? { '@type': 'Place', name: event.location, address: event.location } : undefined,
        organizer: event.company ? { '@type': 'Organization', name: event.company } : undefined,
      },
    ],
  };
}
