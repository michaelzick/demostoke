import { describe, expect, it } from "vitest";

import {
  DEFAULT_EXPLORE_ZOOM,
  LAKE_TAHOE_COORDINATES,
  USER_LOCATION_EXPLORE_ZOOM,
  resolveExploreCenter,
} from "@/utils/locationDefaults";

describe("resolveExploreCenter", () => {
  it("returns null while permission is idle", () => {
    expect(
      resolveExploreCenter({ latitude: null, longitude: null, permissionState: "idle" }),
    ).toBeNull();
  });

  it("returns null while permission is loading", () => {
    expect(
      resolveExploreCenter({
        latitude: null,
        longitude: null,
        permissionState: "loading",
      }),
    ).toBeNull();
  });

  it("returns null when granted but coordinates are still missing", () => {
    expect(
      resolveExploreCenter({
        latitude: null,
        longitude: null,
        permissionState: "granted",
      }),
    ).toBeNull();
  });

  it("returns null when granted but coordinates are out of range", () => {
    expect(
      resolveExploreCenter({
        latitude: 999,
        longitude: -120.5,
        permissionState: "granted",
      }),
    ).toBeNull();
  });

  it("returns user-centered result when granted with valid coords", () => {
    const result = resolveExploreCenter({
      latitude: 37.7749,
      longitude: -122.4194,
      permissionState: "granted",
    });

    expect(result).toEqual({
      lat: 37.7749,
      lng: -122.4194,
      zoom: USER_LOCATION_EXPLORE_ZOOM,
      isUserLocation: true,
    });
  });

  it("returns Lake Tahoe fallback when permission is denied", () => {
    const result = resolveExploreCenter({
      latitude: null,
      longitude: null,
      permissionState: "denied",
    });

    expect(result).toEqual({
      lat: LAKE_TAHOE_COORDINATES.lat,
      lng: LAKE_TAHOE_COORDINATES.lng,
      zoom: DEFAULT_EXPLORE_ZOOM,
      isUserLocation: false,
    });
  });

  it("ignores cached lat/lng when permission has been denied", () => {
    const result = resolveExploreCenter({
      latitude: 40,
      longitude: -100,
      permissionState: "denied",
    });

    expect(result?.isUserLocation).toBe(false);
    expect(result?.lat).toBe(LAKE_TAHOE_COORDINATES.lat);
    expect(result?.lng).toBe(LAKE_TAHOE_COORDINATES.lng);
  });
});
