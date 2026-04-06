import { matchPath } from "react-router-dom";
import { PUBLIC_ROUTE_META } from "./publicMetadata.js";

export const ROBOTS_INDEX_FOLLOW = "index,follow";
export const ROBOTS_NOINDEX_FOLLOW = "noindex,follow";
export const SEO_STATUS_OK = 200;
export const SEO_STATUS_NOT_FOUND = 404;
export const DEMO_EVENT_TIME_ZONE = "America/Los_Angeles";

export const UTILITY_ROUTE_META = Object.freeze({
  "/api/gear/search": {
    title: "API: Gear Search | DemoStoke",
    description:
      "Documentation for DemoStoke gear search query patterns and indexable entry points.",
    type: "website",
  },
});

const KNOWN_APP_ROUTE_PATTERNS = Object.freeze([
  "/",
  "/about",
  "/how-it-works",
  "/privacy-policy",
  "/terms-of-service",
  "/blog",
  "/blog/create",
  "/blog/drafts",
  "/blog/edit/:id",
  "/blog/preview/:id",
  "/blog/:slug",
  "/contact-us",
  "/explore",
  "/gear",
  "/gear/surfboards",
  "/gear/used-skis",
  "/gear/:gearSlug",
  "/api/gear/search",
  "/:category/:ownerSlug/:slug",
  "/list-your-gear",
  "/list-your-gear/add-gear-form",
  "/list-your-gear/lightspeed-pos",
  "/edit-gear/:id",
  "/my-gear",
  "/analytics",
  "/bookings",
  "/admin",
  "/user-profile/chad-g",
  "/user-profile/gemini",
  "/user-profile/:slug",
  "/profile",
  "/private-party/:partyId",
  "/search",
  "/gear-quiz",
  "/demo-calendar",
  "/demo-calendar/event/:eventSlug",
  "/demo-events/:eventSlug",
  "/event/:eventSlug",
  "/widget",
  "/auth/signin",
]);

const normalizeSortableTime = (value) => {
  if (!value) return "23:59:59";

  const [hours = "00", minutes = "00", seconds = "00"] = String(value).split(":");
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
};

const getDateTimePartsInTimeZone = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}:${values.second}`,
  };
};

export const buildSeoPolicy = ({
  canonicalUrl,
  robots = ROBOTS_INDEX_FOLLOW,
  status = SEO_STATUS_OK,
} = {}) => ({
  canonicalUrl,
  robots,
  status,
});

export const hasSearchParams = (search = "") =>
  search.replace(/^\?/, "").trim().length > 0;

export const getRouteMetaForPath = (pathname = "") =>
  PUBLIC_ROUTE_META[pathname] || UTILITY_ROUTE_META[pathname] || null;

export const resolveStaticRouteSeo = (pathname = "", search = "") => {
  const routeMeta = PUBLIC_ROUTE_META[pathname];
  if (!routeMeta) {
    return null;
  }

  if (pathname === "/explore" || pathname === "/search") {
    return buildSeoPolicy({
      canonicalUrl: routeMeta.canonicalUrl,
      robots: hasSearchParams(search) ? ROBOTS_NOINDEX_FOLLOW : ROBOTS_INDEX_FOLLOW,
    });
  }

  return buildSeoPolicy({
    canonicalUrl: routeMeta.canonicalUrl,
  });
};

export const resolveUtilityRouteSeo = (pathname = "") => {
  if (pathname !== "/api/gear/search") {
    return null;
  }

  return buildSeoPolicy({
    robots: ROBOTS_NOINDEX_FOLLOW,
  });
};

export const resolveNotFoundSeo = () =>
  buildSeoPolicy({
    robots: ROBOTS_NOINDEX_FOLLOW,
    status: SEO_STATUS_NOT_FOUND,
  });

export const isKnownAppRoute = (pathname = "") =>
  KNOWN_APP_ROUTE_PATTERNS.some((path) =>
    Boolean(
      matchPath(
        {
          path,
          end: true,
        },
        pathname,
      ),
    ),
  );

export const isPublicEquipmentRecord = ({
  status,
  visibleOnMap,
  ownerIsHidden,
}) => status === "available" && visibleOnMap === true && ownerIsHidden !== true;

export const isPastDemoEvent = (event, now = new Date()) => {
  if (!event?.event_date) {
    return false;
  }

  const currentDateTime = getDateTimePartsInTimeZone(now, DEMO_EVENT_TIME_ZONE);
  if (event.event_date < currentDateTime.date) {
    return true;
  }

  if (event.event_date > currentDateTime.date) {
    return false;
  }

  return normalizeSortableTime(event.event_time) <= currentDateTime.time;
};

export const isUpcomingDemoEvent = (event, now = new Date()) =>
  !isPastDemoEvent(event, now);
