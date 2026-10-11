import { describe, expect, it } from "vitest";

import {
  DEMO_EVENT_HOMEPAGE_LIMIT,
  getDemoEventExpiry,
  isDemoEventExpired,
  selectHomepageDemoEvents,
} from "@/utils/demoEventSchedule";

type TestEvent = {
  id: string;
  event_date: string | null;
  event_time: string | null;
  is_featured: boolean;
};

const makeEvent = (
  id: string,
  eventDate: string | null,
  overrides: Partial<TestEvent> = {},
): TestEvent => ({
  id,
  event_date: eventDate,
  event_time: null,
  is_featured: false,
  ...overrides,
});

const localTime = (year: number, month: number, day: number, hour = 0, minute = 0) =>
  new Date(year, month - 1, day, hour, minute);

describe("getDemoEventExpiry", () => {
  it("expires at local midnight two days after the event date", () => {
    expect(getDemoEventExpiry("2026-10-15")?.getTime()).toBe(localTime(2026, 10, 17).getTime());
  });

  it("rolls over month and year boundaries", () => {
    expect(getDemoEventExpiry("2026-12-31")?.getTime()).toBe(localTime(2027, 1, 2).getTime());
  });

  it("returns null for malformed dates", () => {
    expect(getDemoEventExpiry("next tuesday")).toBeNull();
  });
});

describe("isDemoEventExpired", () => {
  const event = makeEvent("a", "2026-10-15");

  it("keeps the event visible on the event date", () => {
    expect(isDemoEventExpired(event, localTime(2026, 10, 15, 18))).toBe(false);
  });

  it("keeps the event visible for the 24 hours after the event date passes", () => {
    expect(isDemoEventExpired(event, localTime(2026, 10, 16, 23, 59))).toBe(false);
  });

  it("expires the event once those 24 hours have passed", () => {
    expect(isDemoEventExpired(event, localTime(2026, 10, 17, 0, 0))).toBe(true);
  });

  it("never expires undated events", () => {
    expect(isDemoEventExpired(makeEvent("b", null), localTime(2030, 1, 1))).toBe(false);
  });
});

describe("selectHomepageDemoEvents", () => {
  const now = localTime(2026, 10, 11, 12);

  it("drops expired and undated events", () => {
    const events = [
      makeEvent("expired", "2026-10-09"),
      makeEvent("grace-period", "2026-10-10"),
      makeEvent("undated", null),
      makeEvent("upcoming", "2026-10-20"),
    ];

    expect(selectHomepageDemoEvents(events, now).map((event) => event.id)).toEqual([
      "grace-period",
      "upcoming",
    ]);
  });

  it("orders events soonest first, with timed events before untimed ones on the same day", () => {
    const events = [
      makeEvent("far", "2027-03-01"),
      makeEvent("same-day-untimed", "2026-11-01"),
      makeEvent("same-day-timed", "2026-11-01", { event_time: "09:00:00" }),
      makeEvent("soon", "2026-10-12"),
    ];

    expect(selectHomepageDemoEvents(events, now).map((event) => event.id)).toEqual([
      "soon",
      "same-day-timed",
      "same-day-untimed",
      "far",
    ]);
  });

  it("caps the list at the homepage limit", () => {
    const events = Array.from({ length: 8 }, (_, index) =>
      makeEvent(`e${index}`, `2026-11-${String(index + 1).padStart(2, "0")}`),
    );

    const selected = selectHomepageDemoEvents(events, now);
    expect(selected).toHaveLength(DEMO_EVENT_HOMEPAGE_LIMIT);
    expect(selected.map((event) => event.id)).toEqual(["e0", "e1", "e2", "e3", "e4"]);
  });

  it("gives featured events priority slots, then fills by date and sorts the result", () => {
    const events = [
      makeEvent("n1", "2026-10-13"),
      makeEvent("n2", "2026-10-14"),
      makeEvent("n3", "2026-10-15"),
      makeEvent("n4", "2026-10-16"),
      makeEvent("featured-far", "2027-02-01", { is_featured: true }),
      makeEvent("featured-expired", "2026-10-01", { is_featured: true }),
    ];

    expect(selectHomepageDemoEvents(events, now).map((event) => event.id)).toEqual([
      "n1",
      "n2",
      "n3",
      "n4",
      "featured-far",
    ]);
  });

  it("backfills a slot as soon as an event expires", () => {
    const events = [
      makeEvent("a", "2026-10-11"),
      makeEvent("b", "2026-10-12"),
      makeEvent("c", "2026-10-13"),
      makeEvent("d", "2026-10-14"),
      makeEvent("e", "2026-10-15"),
      makeEvent("f", "2026-10-16"),
    ];

    expect(selectHomepageDemoEvents(events, now).map((event) => event.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
    expect(
      selectHomepageDemoEvents(events, localTime(2026, 10, 13, 0, 0)).map((event) => event.id),
    ).toEqual(["b", "c", "d", "e", "f"]);
  });
});
