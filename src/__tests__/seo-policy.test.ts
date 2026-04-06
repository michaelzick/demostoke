import { describe, expect, it } from "vitest";
import {
  ROBOTS_INDEX_FOLLOW,
  ROBOTS_NOINDEX_FOLLOW,
  isKnownAppRoute,
  isPastDemoEvent,
  isPublicEquipmentRecord,
  resolveStaticRouteSeo,
  resolveUtilityRouteSeo,
} from "../lib/seo/policy.js";

describe("SEO policy helpers", () => {
  it("canonicalizes faceted search routes back to the base URL and noindexes them", () => {
    expect(resolveStaticRouteSeo("/search", "?q=powder")).toMatchObject({
      canonicalUrl: "https://www.demostoke.com/search",
      robots: ROBOTS_NOINDEX_FOLLOW,
      status: 200,
    });
    expect(resolveStaticRouteSeo("/explore", "?category=surfboards")).toMatchObject({
      canonicalUrl: "https://www.demostoke.com/explore",
      robots: ROBOTS_NOINDEX_FOLLOW,
      status: 200,
    });
  });

  it("keeps the base search route indexable", () => {
    expect(resolveStaticRouteSeo("/search", "")).toMatchObject({
      canonicalUrl: "https://www.demostoke.com/search",
      robots: ROBOTS_INDEX_FOLLOW,
      status: 200,
    });
  });

  it("marks the utility gear search route as noindex", () => {
    expect(resolveUtilityRouteSeo("/api/gear/search")).toMatchObject({
      robots: ROBOTS_NOINDEX_FOLLOW,
      status: 200,
    });
  });

  it("uses the same public visibility rules for gear everywhere", () => {
    expect(
      isPublicEquipmentRecord({
        status: "available",
        visibleOnMap: true,
        ownerIsHidden: false,
      }),
    ).toBe(true);
    expect(
      isPublicEquipmentRecord({
        status: "draft",
        visibleOnMap: true,
        ownerIsHidden: false,
      }),
    ).toBe(false);
    expect(
      isPublicEquipmentRecord({
        status: "available",
        visibleOnMap: false,
        ownerIsHidden: false,
      }),
    ).toBe(false);
    expect(
      isPublicEquipmentRecord({
        status: "available",
        visibleOnMap: true,
        ownerIsHidden: true,
      }),
    ).toBe(false);
  });

  it("treats past demo events in America/Los_Angeles as non-indexable candidates", () => {
    expect(
      isPastDemoEvent(
        {
          event_date: "2026-04-05",
          event_time: "09:00:00",
        },
        new Date("2026-04-06T10:00:00-07:00"),
      ),
    ).toBe(true);

    expect(
      isPastDemoEvent(
        {
          event_date: "2026-04-07",
          event_time: "09:00:00",
        },
        new Date("2026-04-06T10:00:00-07:00"),
      ),
    ).toBe(false);
  });

  it("distinguishes known app routes from true 404s", () => {
    expect(isKnownAppRoute("/demo-calendar/event/spring-demo")).toBe(true);
    expect(isKnownAppRoute("/does-not-exist")).toBe(false);
  });
});
