import { format } from "date-fns";
import { DemoEvent } from "@/types/demo-calendar";
import { slugify } from "./slugify";

const parseLocalDate = (dateStr: string) => new Date(dateStr + 'T00:00:00');

export const generateEventSlug = (event: DemoEvent): string => {
  const titlePart = slugify(event.title);
  const datePart = event.event_date ? format(parseLocalDate(event.event_date), 'MM-dd-yyyy') : 'tbd';
  const timePart = event.event_time ? event.event_time.replace(':', '') : 'tbd';
  return `${titlePart}-${datePart}-${timePart}`;
};

export const findEventBySlug = (events: DemoEvent[], slug: string): DemoEvent | null => {
  return events.find(ev => generateEventSlug(ev) === slug) || null;
};
