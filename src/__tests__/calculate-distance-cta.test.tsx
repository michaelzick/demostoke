// Feature: calculate-distance-cta

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, render, screen, fireEvent } from "@testing-library/react";
import * as fc from "fast-check";
import { useGeolocation } from "../hooks/useGeolocation";
import { useDynamicDistance } from "../hooks/useDynamicDistance";
import { calculateDistance } from "../utils/distanceCalculation";
import DistanceDisplay from "../components/DistanceDisplay";
import { GeolocationProvider } from "../contexts/GeolocationContext";

// Mock useGeolocation so Property 9 can control its return value via vi.mocked().
// Properties 1, 5, and 6 restore the real implementation in their beforeEach.
vi.mock("../hooks/useGeolocation");

// Mock useDynamicDistance so DistanceDisplay tests can control its return value.
vi.mock("../hooks/useDynamicDistance");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Seed localStorage with a stale entry (older than 5 minutes). */
function seedStaleCache(ageMs: number) {
  const staleTimestamp = Date.now() - ageMs;
  localStorage.setItem(
    "userLocation",
    JSON.stringify({ latitude: 37.7749, longitude: -122.4194, timestamp: staleTimestamp })
  );
}

// ---------------------------------------------------------------------------
// Property 1 — No auto-request on mount without cache
// ---------------------------------------------------------------------------

/**
 * Property 1: No auto-request on mount without cache
 *
 * For any mount of `useGeolocation` with an empty or stale `localStorage`,
 * `navigator.geolocation.getCurrentPosition` SHALL NOT have been called after mount completes.
 *
 * Validates: Requirements 1.1
 */
describe("Property 1: No auto-request on mount without cache", () => {
  let getCurrentPositionMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Restore the real useGeolocation implementation for this describe block
    const real = await vi.importActual<typeof import("../hooks/useGeolocation")>("../hooks/useGeolocation");
    vi.mocked(useGeolocation).mockImplementation(real.useGeolocation);

    localStorage.clear();

    getCurrentPositionMock = vi.fn();
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: getCurrentPositionMock },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("property: getCurrentPosition is never called on mount with empty localStorage (100 runs)", () => {
    /**
     * Validates: Requirements 1.1
     */
    fc.assert(
      fc.property(fc.constant(null), () => {
        localStorage.clear();
        getCurrentPositionMock.mockClear();

        const { unmount } = renderHook(() => useGeolocation(), { wrapper: GeolocationProvider });

        expect(getCurrentPositionMock).not.toHaveBeenCalled();

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("property: getCurrentPosition is never called on mount with stale localStorage (100 runs)", () => {
    /**
     * Validates: Requirements 1.1
     *
     * Stale = timestamp older than 5 minutes (300,000 ms).
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 300_000, max: 86_400_000 }),
        (staleAgeMs) => {
          localStorage.clear();
          seedStaleCache(staleAgeMs);
          getCurrentPositionMock.mockClear();

          const { unmount } = renderHook(() => useGeolocation(), { wrapper: GeolocationProvider });

          expect(getCurrentPositionMock).not.toHaveBeenCalled();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 — Fresh cache skips permission prompt
// ---------------------------------------------------------------------------

/**
 * Property 6: Fresh cache skips permission prompt
 *
 * For any `localStorage` entry with key `userLocation` whose `timestamp` is less than
 * 300,000 ms ago, mounting `useGeolocation` SHALL NOT call
 * `navigator.geolocation.getCurrentPosition` and SHALL hydrate state with the cached
 * coordinates.
 *
 * Validates: Requirements 2.3, 2.4
 */
describe("Property 6: Fresh cache skips permission prompt", () => {
  let getCurrentPositionMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const real = await vi.importActual<typeof import("../hooks/useGeolocation")>("../hooks/useGeolocation");
    vi.mocked(useGeolocation).mockImplementation(real.useGeolocation);

    localStorage.clear();

    getCurrentPositionMock = vi.fn();
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: getCurrentPositionMock },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("property: fresh cache hydrates state and skips getCurrentPosition (100 runs)", () => {
    fc.assert(
      fc.property(
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        fc.integer({ min: 0, max: 299_999 }),
        (lat, lng, ageMs) => {
          localStorage.clear();
          getCurrentPositionMock.mockClear();

          const freshTimestamp = Date.now() - ageMs;
          localStorage.setItem(
            "userLocation",
            JSON.stringify({ latitude: lat, longitude: lng, timestamp: freshTimestamp })
          );

          const { result, unmount } = renderHook(() => useGeolocation(), { wrapper: GeolocationProvider });

          expect(getCurrentPositionMock).not.toHaveBeenCalled();
          expect(result.current.permissionState).toBe("granted");
          expect(result.current.latitude).toBeCloseTo(lat, 10);
          expect(result.current.longitude).toBeCloseTo(lng, 10);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5 — Location cached after grant
// ---------------------------------------------------------------------------

/**
 * Property 5: Location cached after grant
 *
 * For any coordinates returned by a successful geolocation call,
 * `localStorage.getItem('userLocation')` SHALL contain those coordinates and a
 * `timestamp` field after the call resolves.
 *
 * Validates: Requirements 2.2
 */
describe("Property 5: Location cached after grant", () => {
  beforeEach(async () => {
    const real = await vi.importActual<typeof import("../hooks/useGeolocation")>("../hooks/useGeolocation");
    vi.mocked(useGeolocation).mockImplementation(real.useGeolocation);

    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("property: localStorage contains lat/lng/timestamp after successful geolocation (100 runs)", () => {
    /**
     * Validates: Requirements 2.2
     */
    fc.assert(
      fc.property(
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          localStorage.clear();

          const getCurrentPositionMock = vi.fn((successCallback: PositionCallback) => {
            successCallback({
              coords: {
                latitude: lat,
                longitude: lng,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
              timestamp: Date.now(),
            } as GeolocationPosition);
          });

          Object.defineProperty(globalThis.navigator, "geolocation", {
            value: { getCurrentPosition: getCurrentPositionMock },
            configurable: true,
            writable: true,
          });

          const { result, unmount } = renderHook(() => useGeolocation(), { wrapper: GeolocationProvider });

          act(() => {
            result.current.requestLocation();
          });

          const raw = localStorage.getItem("userLocation");
          expect(raw).not.toBeNull();

          const cached = JSON.parse(raw!);
          expect(cached.latitude).toBeCloseTo(lat, 10);
          expect(cached.longitude).toBeCloseTo(lng, 10);
          expect(typeof cached.timestamp).toBe("number");

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9 — Distance calculation correctness (model-based)
// ---------------------------------------------------------------------------

/**
 * Property 9: Distance calculation correctness (model-based)
 *
 * For any valid user coordinates and equipment coordinates, the `distance` returned by
 * `useDynamicDistance` SHALL equal `calculateDistance(userLat, userLng, equipLat, equipLng)` —
 * the same value the utility function produces directly.
 *
 * Validates: Requirements 5.1
 */
describe("Property 9: Distance calculation correctness (model-based)", () => {
  beforeEach(async () => {
    // Restore the real useDynamicDistance so this property tests the actual hook logic
    const real = await vi.importActual<typeof import("../hooks/useDynamicDistance")>("../hooks/useDynamicDistance");
    vi.mocked(useDynamicDistance).mockImplementation(real.useDynamicDistance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("property: useDynamicDistance distance equals calculateDistance for any valid coordinates (100 runs)", () => {
    /**
     * Validates: Requirements 5.1
     */
    fc.assert(
      fc.property(
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        (userLat, userLng, equipLat, equipLng) => {
          vi.mocked(useGeolocation).mockReturnValue({
            latitude: userLat,
            longitude: userLng,
            error: null,
            loading: false,
            permissionDenied: false,
            permissionState: "granted",
            requestLocation: vi.fn(),
          });

          const equipment = {
            location: { lat: equipLat, lng: equipLng },
          };

          const { result, unmount } = renderHook(() =>
            useDynamicDistance(equipment)
          );

          const expected = calculateDistance(userLat, userLng, equipLat, equipLng);
          expect(result.current.distance).toBe(expected);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8 — Distance is always non-negative
// ---------------------------------------------------------------------------

/**
 * Property 8: Distance is always non-negative
 *
 * For any valid coordinate pair (lat1, lng1, lat2, lng2),
 * `calculateDistance(lat1, lng1, lat2, lng2)` SHALL return a value >= 0.
 *
 * Validates: Requirements 5.4
 */
describe("Property 8: Distance is always non-negative", () => {
  it("property: calculateDistance returns a non-negative value for any valid coordinate pair (100 runs)", () => {
    /**
     * Validates: Requirements 5.4
     */
    fc.assert(
      fc.property(
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        (lat1, lng1, lat2, lng2) => {
          const distance = calculateDistance(lat1, lng1, lat2, lng2);
          return distance >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Helper: default mock return value for useDynamicDistance
// ---------------------------------------------------------------------------

function mockDynamicDistance(overrides: Partial<ReturnType<typeof useDynamicDistance>> = {}) {
  vi.mocked(useDynamicDistance).mockReturnValue({
    distance: null,
    loading: false,
    error: null,
    isLocationBased: false,
    permissionDenied: false,
    permissionState: "idle",
    requestLocation: vi.fn(),
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Property 2 — CTA rendered in idle state
// ---------------------------------------------------------------------------

/**
 * Property 2: CTA rendered in idle state
 *
 * For any DistanceDisplay rendered with no cached location and no prior permission request,
 * the output SHALL contain the Calculate Distance CTA button and SHALL NOT contain
 * "Calculating distance...".
 *
 * Validates: Requirements 1.2
 */
describe("Property 2: CTA rendered in idle state", () => {
  beforeEach(() => {
    // Ensure geolocation is defined so the unsupported branch doesn't fire
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("property: DistanceDisplay shows Calculate Distance CTA and not loading text in idle state (100 runs)", () => {
    /**
     * Validates: Requirements 1.2
     */
    fc.assert(
      fc.property(
        fc.record({
          lat: fc.float({ min: -90, max: 90, noNaN: true }),
          lng: fc.float({ min: -180, max: 180, noNaN: true }),
        }),
        (coords) => {
          mockDynamicDistance({ permissionState: "idle" });

          const equipment = { location: { lat: coords.lat, lng: coords.lng } };
          const { unmount } = render(

            <DistanceDisplay equipment={equipment} />
          );

          expect(screen.getByRole("button", { name: /calculate distance/i })).toBeTruthy();
          expect(screen.queryByText(/calculating distance/i)).toBeNull();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3 — Click triggers geolocation request
// ---------------------------------------------------------------------------

/**
 * Property 3: Click triggers geolocation request
 *
 * For any DistanceDisplay in the idle state, clicking the Calculate Distance CTA
 * SHALL result in exactly one call to requestLocation.
 *
 * Validates: Requirements 1.3
 */
describe("Property 3: Click triggers geolocation request", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("property: clicking Calculate Distance calls requestLocation exactly once (100 runs)", () => {
    /**
     * Validates: Requirements 1.3
     */
    fc.assert(
      fc.property(fc.constant(null), () => {
        const requestLocation = vi.fn();
        mockDynamicDistance({ permissionState: "idle", requestLocation });

        const equipment = { location: { lat: 37.7749, lng: -122.4194 } };
        const { unmount } = render(
    
          <DistanceDisplay equipment={equipment} />
        );

        const button = screen.getByRole("button", { name: /calculate distance/i });
        fireEvent.click(button);

        expect(requestLocation).toHaveBeenCalledTimes(1);

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4 — Distance format after permission granted
// ---------------------------------------------------------------------------

/**
 * Property 4: Distance format after permission granted
 *
 * For any valid user coordinates and equipment coordinates, after permission is granted,
 * DistanceDisplay SHALL render a string matching `{value}mi away` where value is
 * non-negative rounded to one decimal place (or `< 0.1` for distances below 0.1 miles).
 *
 * Validates: Requirements 2.1, 5.2, 5.3
 */
describe("Property 4: Distance format after permission granted", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("property: granted state renders distance in correct format (100 runs)", () => {
    /**
     * Validates: Requirements 2.1, 5.2, 5.3
     */
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10000, noNaN: true }),
        (distance) => {
          // Round to 1 decimal place as the real useDynamicDistance hook does
          const roundedDistance = Math.round(distance * 10) / 10;
          mockDynamicDistance({ permissionState: "granted", distance: roundedDistance });

          const equipment = { location: { lat: 37.7749, lng: -122.4194 } };
          const { unmount } = render(
      
            <DistanceDisplay equipment={equipment} />
          );

          const distancePattern = /^\d+(\.\d)?mi away$|^< 0\.1mi away$/;
          const el = screen.getByText(distancePattern);
          expect(el).toBeTruthy();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7 — Denial hides CTA and shows fallback text
// ---------------------------------------------------------------------------

/**
 * Property 7: Denial hides CTA and shows fallback text
 *
 * For any DistanceDisplay where the permission state is denied, the output SHALL contain
 * "Distance not available" and SHALL NOT contain the Calculate Distance CTA button.
 *
 * Validates: Requirements 3.1, 3.2
 */
describe("Property 7: Denial hides CTA and shows fallback text", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("property: denied state shows 'Distance not available' and hides CTA (100 runs)", () => {
    /**
     * Validates: Requirements 3.1, 3.2
     */
    fc.assert(
      fc.property(fc.constant(null), () => {
        mockDynamicDistance({ permissionState: "denied", permissionDenied: true });

        const equipment = { location: { lat: 37.7749, lng: -122.4194 } };
        const { unmount } = render(
    
          <DistanceDisplay equipment={equipment} />
        );

        expect(screen.getByText(/distance not available/i)).toBeTruthy();
        expect(screen.queryByRole("button", { name: /calculate distance/i })).toBeNull();

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Task 4.6 — Unit tests for DistanceDisplay
// ---------------------------------------------------------------------------

describe("DistanceDisplay unit tests", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // Restore geolocation to a defined value after each test
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });
  });

  it("renders CTA when permissionState === 'idle' and no cache", () => {
    /**
     * Validates: Requirements 1.2
     */
    mockDynamicDistance({ permissionState: "idle" });

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(

      <DistanceDisplay equipment={{ location: { lat: 37.7749, lng: -122.4194 } }} />
    );

    expect(screen.getByRole("button", { name: /calculate distance/i })).toBeTruthy();
  });

  it("renders 'Distance not available' when navigator.geolocation is undefined", () => {
    /**
     * Validates: Requirements 3.3, 1.4
     */
    mockDynamicDistance({ permissionState: "idle" });

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(

      <DistanceDisplay equipment={{ location: { lat: 37.7749, lng: -122.4194 } }} />
    );

    expect(screen.getByText(/distance not available/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /calculate distance/i })).toBeNull();
  });

  it("renders '< 0.1mi away' for distances below 0.1 miles", () => {
    /**
     * Validates: Requirements 5.3
     */
    mockDynamicDistance({ permissionState: "granted", distance: 0.05 });

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(

      <DistanceDisplay equipment={{ location: { lat: 37.7749, lng: -122.4194 } }} />
    );

    expect(screen.getByText("< 0.1mi away")).toBeTruthy();
  });

  it("CTA button has variant='outline'", () => {
    /**
     * Validates: Requirements 1.4
     */
    mockDynamicDistance({ permissionState: "idle" });

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(

      <DistanceDisplay equipment={{ location: { lat: 37.7749, lng: -122.4194 } }} />
    );

    const button = screen.getByRole("button", { name: /calculate distance/i });
    // The shadcn Button with variant="outline" gets the "outline" variant class
    expect(button.className).toMatch(/outline/);
  });
});

// ---------------------------------------------------------------------------
// Task 5.1 — Unit tests: EquipmentCard and CompactEquipmentCard render DistanceDisplay
// ---------------------------------------------------------------------------

// Additional mocks needed for card components
vi.mock("../contexts/auth", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

vi.mock("../hooks/useUserRole", () => ({
  useIsAdmin: () => ({ isAdmin: false, isLoading: false }),
}));

vi.mock("../contexts/FavoritesContext", () => ({
  useFavorites: () => ({
    favorites: [],
    isLoading: false,
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
    hasFavorites: () => false,
  }),
}));

vi.mock("../hooks/useUserEquipment", () => ({
  useDeleteEquipment: () => ({ mutateAsync: vi.fn() }),
  useUpdateEquipmentVisibility: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({ pathname: "/" }),
    Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) =>
      React.createElement("a", { href: to, ...props }, children),
  };
});

vi.mock("../hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("../services/featuredGearService", () => ({
  featuredGearService: { setFeaturedStatus: vi.fn() },
}));

import React from "react";
import EquipmentCard from "../components/EquipmentCard";
import CompactEquipmentCard from "../components/CompactEquipmentCard";
import { TooltipProvider } from "../components/ui/tooltip";

/** Minimal Equipment object satisfying the Equipment interface */
function makeEquipment(overrides: Partial<Equipment> = {}): Equipment {
  return {
    id: "test-id",
    name: "Test Gear",
    category: "surfboard",
    description: "A test piece of gear",
    image_url: "",
    images: [],
    price_per_day: 50,
    rating: 4.5,
    review_count: 10,
    owner: {
      id: "owner-id",
      name: "Test Owner",
      imageUrl: "",
      rating: 4.8,
      reviewCount: 20,
      responseRate: 95,
    },
    location: { lat: 37.7749, lng: -122.4194, address: "San Francisco, CA" },
    distance: 5,
    specifications: { size: "M", weight: "2kg", material: "foam", suitable: "beginner" },
    availability: { available: true },
    ...overrides,
  } as Equipment;
}

import type { Equipment } from "../types";

describe("Task 5.1: EquipmentCard renders DistanceDisplay", () => {
  beforeEach(() => {
    mockDynamicDistance({ permissionState: "idle" });
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Calculate Distance button (from DistanceDisplay in idle state)", () => {
    /**
     * Validates: Requirements 4.1, 4.4
     */
    render(
      <TooltipProvider>
        <EquipmentCard equipment={makeEquipment()} />
      </TooltipProvider>
    );
    expect(screen.getByRole("button", { name: /calculate distance/i })).toBeTruthy();
  });
});

describe("Task 5.1: CompactEquipmentCard renders DistanceDisplay", () => {
  beforeEach(() => {
    mockDynamicDistance({ permissionState: "idle" });
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: vi.fn() },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Calculate Distance button (from DistanceDisplay in idle state)", () => {
    /**
     * Validates: Requirements 4.2, 4.4
     */
    render(
      <TooltipProvider>
        <CompactEquipmentCard equipment={makeEquipment()} />
      </TooltipProvider>
    );
    expect(screen.getByRole("button", { name: /calculate distance/i })).toBeTruthy();
  });
});
