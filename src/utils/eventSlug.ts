import { format } from "date-fns";
import { DemoEvent } from "@/types/demo-calendar";
import { slugify } from "./slugify";

const parseLocalDate = (dateStr: string) => new Date(dateStr + 'T00:00:00');
const buildEventTimeSlug = (time: string | null) => (time ? time.replace(/[^0-9]/g, '') : 'tbd');
const buildLegacyEventTimeSlug = (time: string | null) => (time ? time.replace(':', '') : 'tbd');

export const generateEventSlug = (event: DemoEvent): string => {
  const titlePart = slugify(event.title);
  const datePart = event.event_date ? format(parseLocalDate(event.event_date), 'MM-dd-yyyy') : 'tbd';
  const timePart = buildEventTimeSlug(event.event_time);
  return `${titlePart}-${datePart}-${timePart}`;
};

export const buildDemoEventPath = (event: DemoEvent): string =>
  `/demo-events/${generateEventSlug(event)}`;

export const findEventBySlug = (events: DemoEvent[], slug: string): DemoEvent | null => {
  return events.find((ev) => {
    const canonicalSlug = generateEventSlug(ev);
    const legacySlug = `${slugify(ev.title)}-${
      ev.event_date ? format(parseLocalDate(ev.event_date), 'MM-dd-yyyy') : 'tbd'
    }-${buildLegacyEventTimeSlug(ev.event_time)}`;

    return canonicalSlug === slug || legacySlug === slug;
  }) || null;
};
