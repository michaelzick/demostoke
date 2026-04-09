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
  category = "skis",
): Equipment => ({
  id,
  name,
  category,
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
  pricing_options: [],
});

const createUserLocation = (
  id: string,
  lat: number,
  lng: number,
  equipmentCategories: string[] = ["skis"],
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
  equipment_categories: equipmentCategories,
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

const renderHybridViewWithProps = (
  customEquipment: Equipment[],
  customUserLocations: UserLocation[],
  overrideProps: Partial<React.ComponentProps<typeof HybridView>> = {},
) =>
  render(
    <HybridView
      filteredEquipment={customEquipment}
      activeCategory="skis"
      isLocationBased={false}
      userLocations={customUserLocations}
      sortBy="distance"
      onSortChange={vi.fn()}
      {...overrideProps}
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
    expect(mapHarness.initializeMapMock).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      "test-token",
    );
  });

  it("does not reinitialize or move the map on a non-map rerender", async () => {
    const props = {
      filteredEquipment: equipment,
      activeCategory: "skis" as const,
      isLocationBased: false,
      userLocations,
      sortBy: "distance",
      onSortChange: vi.fn(),
    };

    const { rerender } = render(<HybridView {...props} />);

    await screen.findByText("Showing 3 of 3 gear in this map area");

    mapHarness.initializeMapMock.mockClear();
    mapHarness.fitMapBoundsMock.mockClear();
    mapHarness.mapMock.flyTo.mockClear();

    rerender(<HybridView {...props} />);

    expect(mapHarness.initializeMapMock).not.toHaveBeenCalled();
    expect(mapHarness.fitMapBoundsMock).not.toHaveBeenCalled();
    expect(mapHarness.mapMock.flyTo).not.toHaveBeenCalled();
  });

  it("does not refit the map when only sort changes", async () => {
    const baseProps = {
      filteredEquipment: equipment,
      activeCategory: "skis" as const,
      isLocationBased: false,
      userLocations,
      onSortChange: vi.fn(),
    };

    const { rerender } = render(<HybridView {...baseProps} sortBy="distance" />);

    await screen.findByText("Showing 3 of 3 gear in this map area");

    mapHarness.fitMapBoundsMock.mockClear();
    mapHarness.mapMock.flyTo.mockClear();

    rerender(<HybridView {...baseProps} sortBy="price-low" />);

    expect(mapHarness.fitMapBoundsMock).not.toHaveBeenCalled();
    expect(mapHarness.mapMock.flyTo).not.toHaveBeenCalled();
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

  it("includes gear from visible shop pins even when the gear coordinates fall just outside the tight viewport", async () => {
    const summitGear = createEquipment("summit-gear", "Snow Summit Bike", 34.24, -116.89, "shop-summit");
    const valleyGear = createEquipment("valley-gear", "Snow Valley Bike", 34.24, -116.89, "shop-valley");
    const summitShop = createUserLocation("shop-summit", 34.24, -116.89);
    const valleyShop = createUserLocation("shop-valley", 34.18, -117.00);

    renderHybridViewWithProps(
      [summitGear, valleyGear],
      [summitShop, valleyShop],
    );

    await screen.findByText("Showing 2 of 2 gear in this map area");

    act(() => {
      mapHarness.setBounds({
        north: 34.22,
        south: 34.14,
        east: -116.96,
        west: -117.04,
      });
      mapHarness.emit("moveend");
    });

    await waitFor(() => {
      expect(screen.getByText("Showing 1 of 2 gear in this map area")).toBeInTheDocument();
    });

    expect(screen.getByText("Snow Valley Bike")).toBeInTheDocument();
    expect(screen.queryByText("Snow Summit Bike")).not.toBeInTheDocument();
  });

  it("does not show another shop's gear when both shops share the same gear coordinates", async () => {
    const summitGear = createEquipment("summit-gear", "Snow Summit Bike", 34.24, -116.89, "shop-summit");
    const valleyGear = createEquipment("valley-gear", "Snow Valley Bike", 34.24, -116.89, "shop-valley");
    const summitShop = createUserLocation("shop-summit", 34.24, -116.89);
    const valleyShop = createUserLocation("shop-valley", 34.18, -117.00);

    renderHybridViewWithProps(
      [summitGear, valleyGear],
      [summitShop, valleyShop],
    );

    await screen.findByText("Showing 2 of 2 gear in this map area");

    act(() => {
      mapHarness.setBounds({
        north: 34.28,
        south: 34.20,
        east: -116.85,
        west: -116.93,
      });
      mapHarness.emit("moveend");
    });

    await waitFor(() => {
      expect(screen.getByText("Showing 1 of 2 gear in this map area")).toBeInTheDocument();
    });

    expect(screen.getByText("Snow Summit Bike")).toBeInTheDocument();
    expect(screen.queryByText("Snow Valley Bike")).not.toBeInTheDocument();
  });

  it("clicking a gear card flies to that gear but shows all filtered gear at the focused shop", async () => {
    const shopOneBoard = createEquipment(
      "gear-1a",
      "Shop One Board",
      34.05,
      -118.25,
      "shop-1",
    );
    const shopOneSkis = createEquipment(
      "gear-1b",
      "Shop One Skis",
      34.051,
      -118.251,
      "shop-1",
    );
    const shopTwoBike = createEquipment(
      "gear-2",
      "Shop Two Bike",
      36.17,
      -115.14,
      "shop-2",
    );

    renderHybridViewWithProps(
      [shopOneBoard, shopOneSkis, shopTwoBike],
      [
        createUserLocation("shop-1", 34.05, -118.25),
        createUserLocation("shop-2", 36.17, -115.14),
      ],
    );

    await screen.findByText("Showing 3 of 3 gear in this map area");

    fireEvent.click(screen.getByText("Shop One Board"));

    await waitFor(() => {
      expect(screen.getByText("Showing 2 of 2 gear at this shop")).toBeInTheDocument();
    });

    expect(mapHarness.mapMock.flyTo).toHaveBeenCalled();
    expect(screen.getByText("Shop One Board")).toBeInTheDocument();
    expect(screen.getByText("Shop One Skis")).toBeInTheDocument();
    expect(screen.queryByText("Shop Two Bike")).not.toBeInTheDocument();
  });

  it("returns to viewport sync after a manual map interaction while focused on a shop", async () => {
    const shopOneBoard = createEquipment(
      "gear-1a",
      "Shop One Board",
      34.05,
      -118.25,
      "shop-1",
    );
    const shopOneSkis = createEquipment(
      "gear-1b",
      "Shop One Skis",
      34.051,
      -118.251,
      "shop-1",
    );
    const shopTwoBike = createEquipment(
      "gear-2",
      "Shop Two Bike",
      36.17,
      -115.14,
      "shop-2",
    );

    renderHybridViewWithProps(
      [shopOneBoard, shopOneSkis, shopTwoBike],
      [
        createUserLocation("shop-1", 34.05, -118.25),
        createUserLocation("shop-2", 36.17, -115.14),
      ],
    );

    await screen.findByText("Showing 3 of 3 gear in this map area");
    fireEvent.click(screen.getByText("Shop One Board"));

    await screen.findByText("Showing 2 of 2 gear at this shop");

    act(() => {
      mapHarness.emit("wheel");
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

    expect(screen.getByText("Shop Two Bike")).toBeInTheDocument();
    expect(screen.queryByText("Shop One Board")).not.toBeInTheDocument();
    expect(screen.queryByText("Shop One Skis")).not.toBeInTheDocument();
  });

  it("clears focused-shop mode on category-reset rerenders and shows the new category list", async () => {
    const surfShopOne = createEquipment(
      "surf-1",
      "Surf Shop One",
      34.05,
      -118.25,
      "shop-1",
      "surfboards",
    );
    const surfShopTwo = createEquipment(
      "surf-2",
      "Surf Shop Two",
      36.17,
      -115.14,
      "shop-2",
      "surfboards",
    );
    const snowboardShop = createEquipment(
      "snow-1",
      "Snow Shop Board",
      37.77,
      -122.42,
      "shop-3",
      "snowboards",
    );

    const { rerender } = renderHybridViewWithProps(
      [surfShopOne, surfShopTwo, snowboardShop],
      [
        createUserLocation("shop-1", 34.05, -118.25, ["surfboards"]),
        createUserLocation("shop-2", 36.17, -115.14, ["surfboards"]),
        createUserLocation("shop-3", 37.77, -122.42, ["snowboards"]),
      ],
      { activeCategory: null },
    );

    await screen.findByText("Showing 3 of 3 gear in this map area");
    fireEvent.click(screen.getByText("Snow Shop Board"));
    await screen.findByText("Showing 1 of 1 gear at this shop");

    rerender(
      <HybridView
        filteredEquipment={[surfShopOne, surfShopTwo]}
        activeCategory="surfboards"
        isLocationBased={false}
        userLocations={[
          createUserLocation("shop-1", 34.05, -118.25, ["surfboards"]),
          createUserLocation("shop-2", 36.17, -115.14, ["surfboards"]),
        ]}
        resetSignal={1}
        sortBy="distance"
        onSortChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Showing 2 of 2 gear in this map area")).toBeInTheDocument();
    });

    expect(screen.getByText("Surf Shop One")).toBeInTheDocument();
    expect(screen.getByText("Surf Shop Two")).toBeInTheDocument();
    expect(screen.queryByText("Snow Shop Board")).not.toBeInTheDocument();
  });

  it("same-category reset rerenders clear focused-shop mode and refit to all visible shops", async () => {
    const surfShopOneBoard = createEquipment(
      "surf-1",
      "Surf Shop One Board",
      34.05,
      -118.25,
      "shop-1",
      "surfboards",
    );
    const surfShopOneFish = createEquipment(
      "surf-2",
      "Surf Shop One Fish",
      34.051,
      -118.251,
      "shop-1",
      "surfboards",
    );
    const surfShopTwoLongboard = createEquipment(
      "surf-3",
      "Surf Shop Two Longboard",
      36.17,
      -115.14,
      "shop-2",
      "surfboards",
    );

    const surfShops = [
      createUserLocation("shop-1", 34.05, -118.25, ["surfboards"]),
      createUserLocation("shop-2", 36.17, -115.14, ["surfboards"]),
    ];

    const { rerender } = renderHybridViewWithProps(
      [surfShopOneBoard, surfShopOneFish, surfShopTwoLongboard],
      surfShops,
      { activeCategory: "surfboards" },
    );

    await screen.findByText("Showing 3 of 3 gear in this map area");
    fireEvent.click(screen.getByText("Surf Shop One Board"));
    await screen.findByText("Showing 2 of 2 gear at this shop");

    mapHarness.fitMapBoundsMock.mockClear();

    rerender(
      <HybridView
        filteredEquipment={[surfShopOneBoard, surfShopOneFish, surfShopTwoLongboard]}
        activeCategory="surfboards"
        isLocationBased={false}
        userLocations={surfShops}
        resetSignal={1}
        sortBy="distance"
        onSortChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Showing 3 of 3 gear in this map area")).toBeInTheDocument();
    });

    expect(mapHarness.fitMapBoundsMock).toHaveBeenCalled();
    expect(screen.getByText("Surf Shop One Board")).toBeInTheDocument();
    expect(screen.getByText("Surf Shop One Fish")).toBeInTheDocument();
    expect(screen.getByText("Surf Shop Two Longboard")).toBeInTheDocument();
  });

  it("clears focused-shop mode when the focused gear disappears from the filtered dataset", async () => {
    const shopOneBoard = createEquipment(
      "gear-1a",
      "Shop One Board",
      34.05,
      -118.25,
      "shop-1",
    );
    const shopOneSkis = createEquipment(
      "gear-1b",
      "Shop One Skis",
      34.051,
      -118.251,
      "shop-1",
    );
    const shopTwoBike = createEquipment(
      "gear-2",
      "Shop Two Bike",
      36.17,
      -115.14,
      "shop-2",
    );

    const { rerender } = renderHybridViewWithProps(
      [shopOneBoard, shopOneSkis, shopTwoBike],
      [
        createUserLocation("shop-1", 34.05, -118.25),
        createUserLocation("shop-2", 36.17, -115.14),
      ],
    );

    await screen.findByText("Showing 3 of 3 gear in this map area");
    fireEvent.click(screen.getByText("Shop One Board"));
    await screen.findByText("Showing 2 of 2 gear at this shop");

    rerender(
      <HybridView
        filteredEquipment={[shopTwoBike]}
        activeCategory="skis"
        isLocationBased={false}
        userLocations={[createUserLocation("shop-2", 36.17, -115.14)]}
        sortBy="distance"
        onSortChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Showing 1 of 1 gear in this map area")).toBeInTheDocument();
    });

    expect(screen.getByText("Shop Two Bike")).toBeInTheDocument();
    expect(screen.queryByText("Shop One Board")).not.toBeInTheDocument();
    expect(screen.queryByText("Shop One Skis")).not.toBeInTheDocument();
  });
});
