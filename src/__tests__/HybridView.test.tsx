import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UserLocation } from "@/hooks/useUserLocations";
import type { Equipment } from "@/types";
import HybridView from "@/components/HybridView";

type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

const mapHarness = vi.hoisted(() => {
  const worldBounds: Bounds = {
    north: 90,
    south: -90,
    east: 180,
    west: -180,
  };

  let currentBounds = worldBounds;
  const listeners = new Map<string, Set<() => void>>();

  const emit = (event: string) => {
    listeners.get(event)?.forEach((listener) => listener());
  };

  const setBounds = (bounds: Bounds) => {
    currentBounds = bounds;
  };

  const toBoundsObject = () => ({
    getNorth: () => currentBounds.north,
    getSouth: () => currentBounds.south,
    getEast: () => currentBounds.east,
    getWest: () => currentBounds.west,
  });

  const boundsFromLocations = (
    locations: Array<{ location: { lat: number; lng: number } }>,
    padding: number,
  ): Bounds => {
    const latitudes = locations.map((item) => item.location.lat);
    const longitudes = locations.map((item) => item.location.lng);

    return {
      north: Math.max(...latitudes) + padding,
      south: Math.min(...latitudes) - padding,
      east: Math.max(...longitudes) + padding,
      west: Math.min(...longitudes) - padding,
    };
  };

  const mapMock = {
    on: vi.fn((event: string, callback: () => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }

      listeners.get(event)!.add(callback);

      if (event === "load") {
        callback();
      }

      return mapMock;
    }),
    off: vi.fn((event: string, callback: () => void) => {
      listeners.get(event)?.delete(callback);
      return mapMock;
    }),
    remove: vi.fn(),
    flyTo: vi.fn(({ center }: { center: [number, number] }) => {
      currentBounds = {
        north: center[1] + 0.2,
        south: center[1] - 0.2,
        east: center[0] + 0.2,
        west: center[0] - 0.2,
      };
      emit("moveend");
      return mapMock;
    }),
    getBounds: vi.fn(() => toBoundsObject()),
  };

  const initializeMapMock = vi.fn(() => mapMock);
  const fitMapBoundsMock = vi.fn(
    (
      _map: unknown,
      locations: Array<{ location: { lat: number; lng: number } }>,
      isSingleView = false,
    ) => {
      if (locations.length === 0) return;

      currentBounds = boundsFromLocations(locations, isSingleView ? 0.15 : 0.75);
      emit("moveend");
    },
  );
  const invokeMock = vi.fn(async () => ({
    data: { token: "test-token" },
    error: null,
  }));

  const reset = () => {
    currentBounds = worldBounds;
    listeners.clear();
    mapMock.on.mockClear();
    mapMock.off.mockClear();
    mapMock.remove.mockClear();
    mapMock.flyTo.mockClear();
    mapMock.getBounds.mockClear();
    initializeMapMock.mockClear();
    fitMapBoundsMock.mockClear();
    invokeMock.mockClear();
  };

  return {
    emit,
    fitMapBoundsMock,
    initializeMapMock,
    invokeMock,
    mapMock,
    reset,
    setBounds,
  };
});

vi.mock("mapbox-gl", () => ({
  default: {},
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: mapHarness.invokeMock,
    },
  },
}));

vi.mock("@/utils/mapUtils", () => ({
  initializeMap: mapHarness.initializeMapMock,
  fitMapBounds: mapHarness.fitMapBoundsMock,
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/hooks/useMapMarkers", () => ({
  useMapMarkers: () => [],
}));

vi.mock("@/hooks/useScrollToTopButton", () => ({
  useScrollToTopButton: () => ({
    showButton: false,
    scrollToTop: vi.fn(),
  }),
}));

vi.mock("@/contexts/auth", () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock("@/hooks/useUserRole", () => ({
  useIsAdmin: () => ({
    isAdmin: false,
  }),
}));

vi.mock("@/hooks/useUserEquipment", () => ({
  useDeleteEquipment: () => ({
    mutateAsync: vi.fn(),
  }),
  useUpdateEquipmentVisibility: () => ({
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("@/components/ScrollToTopButton", () => ({
  ScrollToTopButton: () => null,
}));

vi.mock("@/components/map/MapLegend", () => ({
  default: () => <div data-testid="map-legend" />,
}));

vi.mock("@/components/SortDropdown", () => ({
  default: () => <div data-testid="sort-dropdown" />,
}));

vi.mock("@/components/CompactEquipmentCard", () => ({
  default: ({ equipment }: { equipment: Equipment }) => (
    <div data-testid="equipment-card">{equipment.name}</div>
  ),
}));

const createEquipment = (
  id: string,
  name: string,
  lat: number,
  lng: number,
  ownerId: string,
): Equipment => ({
  id,
  name,
  category: "skis",
  description: "Test gear",
  image_url: "",
  images: [],
  price_per_day: 50,
  rating: 4.7,
  review_count: 12,
  owner: {
    id: ownerId,
    name: `Owner ${ownerId}`,
    imageUrl: "",
    rating: 4.8,
    reviewCount: 10,
    responseRate: 95,
  },
  location: {
    lat,
    lng,
    address: "Test address",
  },
  distance: 0,
  specifications: {
    size: "M",
    weight: "10",
    material: "Carbon",
    suitable: "Intermediate",
  },
  availability: {
    available: true,
  },
});

const createUserLocation = (
  id: string,
  lat: number,
  lng: number,
): UserLocation => ({
  id,
  name: `Shop ${id}`,
  role: "retail-store",
  address: "Shop address",
  location: {
    lat,
    lng,
  },
  avatar_url: null,
  equipment_categories: ["skis"],
});

const equipment = [
  createEquipment("gear-1", "Gear One", 34.05, -118.25, "shop-1"),
  createEquipment("gear-2", "Gear Two", 36.17, -115.14, "shop-2"),
  createEquipment("gear-3", "Gear Three", 37.77, -122.42, "shop-3"),
];

const userLocations = [
  createUserLocation("shop-1", 34.05, -118.25),
  createUserLocation("shop-2", 36.17, -115.14),
  createUserLocation("shop-3", 37.77, -122.42),
];

const renderHybridView = () =>
  render(
    <HybridView
      filteredEquipment={equipment}
      activeCategory="skis"
      isLocationBased={false}
      userLocations={userLocations}
      sortBy="distance"
      onSortChange={vi.fn()}
    />,
  );

describe("HybridView viewport sync", () => {
  beforeEach(() => {
    mapHarness.reset();
  });

  it("shows the in-bounds gear after the initial fit", async () => {
    renderHybridView();

    expect(await screen.findByText("Showing 3 of 3 gear in this map area")).toBeInTheDocument();
    expect(screen.getAllByTestId("equipment-card")).toHaveLength(3);
    expect(mapHarness.fitMapBoundsMock).toHaveBeenCalled();
  });

  it("shrinks the list when the map moves to tighter bounds", async () => {
    renderHybridView();

    await screen.findByText("Showing 3 of 3 gear in this map area");

    act(() => {
      mapHarness.setBounds({
        north: 36.5,
        south: 35.5,
        east: -114.5,
        west: -115.5,
      });
      mapHarness.emit("moveend");
    });

    await waitFor(() => {
      expect(screen.getByText("Showing 1 of 3 gear in this map area")).toBeInTheDocument();
    });

    expect(screen.getByText("Gear Two")).toBeInTheDocument();
    expect(screen.queryByText("Gear One")).not.toBeInTheDocument();
    expect(screen.queryByText("Gear Three")).not.toBeInTheDocument();
  });

  it("shows the map-specific empty state when the viewport has no gear", async () => {
    renderHybridView();

    await screen.findByText("Showing 3 of 3 gear in this map area");

    act(() => {
      mapHarness.setBounds({
        north: 10,
        south: 5,
        east: -70,
        west: -80,
      });
      mapHarness.emit("moveend");
    });

    await waitFor(() => {
      expect(screen.getByText("Showing 0 of 3 gear in this map area")).toBeInTheDocument();
    });

    expect(screen.getByText("No gear in this map area. Move the map or zoom out.")).toBeInTheDocument();
    expect(screen.queryAllByTestId("equipment-card")).toHaveLength(0);
  });

  it("recomputes the visible list after clicking a gear card and flying to it", async () => {
    renderHybridView();

    await screen.findByText("Gear Two");

    fireEvent.click(screen.getByText("Gear Two"));

    await waitFor(() => {
      expect(screen.getByText("Showing 1 of 3 gear in this map area")).toBeInTheDocument();
    });

    expect(mapHarness.mapMock.flyTo).toHaveBeenCalled();
    expect(screen.getByText("Gear Two")).toBeInTheDocument();
    expect(screen.queryByText("Gear One")).not.toBeInTheDocument();
    expect(screen.queryByText("Gear Three")).not.toBeInTheDocument();
  });
});
