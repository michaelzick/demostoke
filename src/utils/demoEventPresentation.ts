import { format } from "date-fns";
import { CategoryFilter, DemoEvent } from "@/types/demo-calendar";

const CATEGORY_META: Record<
  DemoEvent["gear_category"],
  {
    name: string;
    singularName: string;
    colorClass: string;
    textColorClass: string;
    placeholderClass: string;
    placeholderTextClass: string;
  }
> = {
  snowboards: {
    name: "Snowboards",
    singularName: "Snowboard",
    colorClass: "bg-rose-500",
    textColorClass: "text-rose-500",
    placeholderClass: "bg-rose-500",
    placeholderTextClass: "text-white",
  },
  skis: {
    name: "Skis",
    singularName: "Ski",
    colorClass: "bg-fuchsia-500",
    textColorClass: "text-fuchsia-500",
    placeholderClass: "bg-fuchsia-500",
    placeholderTextClass: "text-white",
  },
  surfboards: {
    name: "Surfboards",
    singularName: "Surfboard",
    colorClass: "bg-sky-500",
    textColorClass: "text-sky-500",
    placeholderClass: "bg-sky-500",
    placeholderTextClass: "text-white",
  },
  "mountain-bikes": {
    name: "Mountain Bikes",
    singularName: "Mountain Bike",
    colorClass: "bg-orange-400",
    textColorClass: "text-orange-400",
    placeholderClass: "bg-orange-400",
    placeholderTextClass: "text-black",
  },
};

const FALLBACK_META = {
  name: "Demo Event",
  singularName: "Demo Event",
  colorClass: "bg-slate-600",
  textColorClass: "text-slate-600",
  placeholderClass: "bg-slate-600",
  placeholderTextClass: "text-white",
};

export const DEMO_EVENT_CATEGORY_FILTERS: CategoryFilter[] = (
  Object.entries(CATEGORY_META) as Array<[DemoEvent["gear_category"], (typeof CATEGORY_META)[DemoEvent["gear_category"]]]>
).map(([category, meta]) => ({
  category,
  name: meta.name,
  color: meta.colorClass,
  enabled: true,
}));

export const getDemoEventCategoryMeta = (category?: DemoEvent["gear_category"] | null) =>
  (category ? CATEGORY_META[category] : null) || FALLBACK_META;

const parseLocalDate = (dateStr: string) => new Date(`${dateStr}T00:00:00`);

export const formatDemoEventDate = (dateStr: string | null) => {
  if (!dateStr) return "Date TBD";

  try {
    return format(parseLocalDate(dateStr), "MMM d, yyyy");
  } catch {
    return "Date TBD";
  }
};

export const formatDemoEventTime = (timeStr: string | null) => {
  if (!timeStr) return "Time TBD";

  try {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return format(date, "h:mm a");
  } catch {
    return "Time TBD";
  }
};

export const buildDemoEventMapHref = (location: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
