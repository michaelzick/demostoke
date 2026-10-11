import type { DemoEvent } from "@/types/demo-calendar";

export const DEMO_EVENT_HOMEPAGE_LIMIT = 5;

type ScheduledDemoEvent = Pick<DemoEvent, "event_date" | "event_time" | "is_featured">;

const parseEventDate = (eventDate: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

// An event date "passes" at the end of its day, and the event stays on the
// home page for 24 more hours after that: it expires at local midnight two
// days after the event date.
export const getDemoEventExpiry = (eventDate: string): Date | null => {
  const start = parseEventDate(eventDate);
  if (!start) return null;

  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 2);
};

export const isDemoEventExpired = (
  event: Pick<DemoEvent, "event_date">,
  now: Date,
): boolean => {
  if (!event.event_date) return false;

  const expiry = getDemoEventExpiry(event.event_date);
  return expiry !== null && now.getTime() >= expiry.getTime();
};

const compareBySchedule = (a: ScheduledDemoEvent, b: ScheduledDemoEvent): number => {
  const byDate = (a.event_date ?? "").localeCompare(b.event_date ?? "");
  if (byDate !== 0) return byDate;

  // Events without a time sort after timed events on the same day.
  return (a.event_time ?? "99:99").localeCompare(b.event_time ?? "99:99");
};

// Home page picks: upcoming dated events only, admin-featured events claim
// slots first, remaining slots fill soonest-first, and the final list is
// ordered by date so slot 1 is the soonest event.
export const selectHomepageDemoEvents = <T extends ScheduledDemoEvent>(
  events: T[],
  now: Date,
  limit: number = DEMO_EVENT_HOMEPAGE_LIMIT,
): T[] => {
  const upcoming = events
    .filter((event) => Boolean(event.event_date) && getDemoEventExpiry(event.event_date!) !== null)
    .filter((event) => !isDemoEventExpired(event, now))
    .sort(compareBySchedule);

  const featured = upcoming.filter((event) => event.is_featured);
  const others = upcoming.filter((event) => !event.is_featured);

  return [...featured, ...others].slice(0, Math.max(0, limit)).sort(compareBySchedule);
};
