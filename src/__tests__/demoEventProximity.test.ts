import { describe, expect, it } from "vitest";
import type { DemoEvent } from "@/types/demo-calendar";
import { filterDemoEventsByProximity } from "@/utils/demoEventProximity";

const makeEvent = (id: string, lat: number | null, lng: number | null): DemoEvent =>
  ({ id, location_lat: lat, location_lng: lng }) as DemoEvent;

// Santa Monica, CA
const USER_LAT = 34.0195;
const USER_LNG = -118.4912;

const events = [
  makeEvent("venice", 33.985, -118.4695), // ~3 miles
  makeEvent("malibu", 34.0259, -118.7798), // ~17 miles
  makeEvent("ventura", 34.2746, -119.229), // ~45 miles
  makeEvent("tahoe", 39.0968, -120.0324), // ~360 miles
  makeEvent("no-coords", null, null),
];

const ids = (list: DemoEvent[]) => list.map((event) => event.id);

describe("filterDemoEventsByProximity", () => {
  it("returns every event when no radius is selected", () => {
    expect(filterDemoEventsByProximity(events, null, USER_LAT, USER_LNG)).toEqual(events);
  });

  it("returns every event while the user location is unknown", () => {
    expect(filterDemoEventsByProximity(events, 25, null, null)).toEqual(events);
  });

  it("keeps only events inside the radius", () => {
    expect(ids(filterDemoEventsByProximity(events, 10, USER_LAT, USER_LNG))).toEqual(["venice"]);
    expect(ids(filterDemoEventsByProximity(events, 25, USER_LAT, USER_LNG))).toEqual(["venice", "malibu"]);
    expect(ids(filterDemoEventsByProximity(events, 50, USER_LAT, USER_LNG))).toEqual([
      "venice",
      "malibu",
      "ventura",
    ]);
  });

  it("excludes events without coordinates once the filter is active", () => {
    expect(ids(filterDemoEventsByProximity(events, 100, USER_LAT, USER_LNG))).not.toContain("no-coords");
  });

  it("treats a zero latitude or longitude as a real location", () => {
    const equatorEvents = [makeEvent("near", 0.05, 0.05), makeEvent("far", 5, 5)];
    expect(ids(filterDemoEventsByProximity(equatorEvents, 10, 0, 0))).toEqual(["near"]);
  });
});
