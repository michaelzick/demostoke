import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ExplorePage from "@/pages/ExplorePage";
import type { Equipment } from "@/types";
import { DEFAULT_EXPLORE_COORDINATES } from "@/utils/locationDefaults";

interface MockGeolocationState {
  latitude: number | null;
  longitude: number | null;
  permissionState: "idle" | "loading" | "granted" | "denied";
  permissionDenied: boolean;
  loading: boolean;
}

const harness = vi.hoisted(() => ({
  getEquipmentDataMock: vi.fn(),
  hybridViewMock: vi.fn(),
  requestLocationMock: vi.fn(),
  geoState: {
    latitude: null,
    longitude: null,
    permissionState: "idle",
    permissionDenied: false,
    loading: false,
  } as MockGeolocationState,
}));

const setGeoState = (state: Partial<MockGeolocationState>) => {
  harness.geoState = { ...harness.geoState, ...state };
};

vi.mock("@/services/searchService", () => ({
  getEquipmentData: harness.getEquipmentDataMock,
}));

vi.mock("@/hooks/usePageMetadata", () => ({
  default: () => undefined,
}));

vi.mock("@/hooks/useScrollToTop", () => ({
  default: () => undefined,
}));

vi.mock("@/hooks/useScrollToTopButton", () => ({
  useScrollToTopButton: () => ({
    showButton: false,
    scrollToTop: vi.fn(),
  }),
}));

vi.mock("@/hooks/useUserLocations", () => ({
  useUserLocations: () => ({ data: [] }),
}));

vi.mock("@/hooks/useEquipmentWithDynamicDistance", () => ({
  useEquipmentWithDynamicDistance: (equipment: Equipment[]) => ({
    equipment,
    isLocationBased: false,
  }),
}));

vi.mock("@/hooks/useUserRole", () => ({
  useIsAdmin: () => ({ isAdmin: false }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/contexts/FavoritesContext", () => ({
  useFavorites: () => ({ favorites: [] }),
}));

vi.mock("@/contexts/auth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/hooks/useRecentlyViewedEquipment", () => ({
  useRecentlyViewedEquipment: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({
    latitude: harness.geoState.latitude,
    longitude: harness.geoState.longitude,
    permissionState: harness.geoState.permissionState,
    permissionDenied: harness.geoState.permissionDenied,
    loading: harness.geoState.loading,
    error: null,
    requestLocation: harness.requestLocationMock,
  }),
}));

vi.mock("@/components/MapComponent", () => ({
  default: (props: { initialCenter?: { lat: number; lng: number; isUserLocation: boolean } | null }) => (
    <div
      data-testid="map-component"
      data-initial-center-lat={props.initialCenter?.lat ?? ""}
      data-initial-center-lng={props.initialCenter?.lng ?? ""}
      data-is-user-location={String(props.initialCenter?.isUserLocation ?? "")}
    />
  ),
}));

vi.mock("@/components/map/MapLegend", () => ({
  default: () => <div data-testid="map-legend" />,
}));

vi.mock("@/components/EquipmentCard", () => ({
  default: () => <div data-testid="equipment-card" />,
}));

vi.mock("@/components/HybridView", () => ({
  default: (props: {
    filteredEquipment: Equipment[];
    activeCategory: string | null;
    initialCenter?: { lat: number; lng: number; isUserLocation: boolean } | null;
  }) => {
    harness.hybridViewMock(props);

    return (
      <div
        data-testid="hybrid-view-props"
        data-filtered-count={String(props.filteredEquipment.length)}
        data-initial-center-lat={props.initialCenter?.lat ?? ""}
        data-initial-center-lng={props.initialCenter?.lng ?? ""}
        data-is-user-location={String(props.initialCenter?.isUserLocation ?? "")}
      />
    );
  },
}));

vi.mock("@/components/SortDropdown", () => ({
  default: () => <div data-testid="sort-dropdown" />,
}));

vi.mock("@/components/GearQuickFilterInput", () => ({
  default: () => <div data-testid="quick-filter" />,
}));

vi.mock("@/components/ScrollToTopButton", () => ({
  ScrollToTopButton: () => null,
}));

const renderExplore = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/explore"]}>
        <ExplorePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const sampleEquipment: Equipment[] = [
  {
    id: "gear-1",
    name: "Snowboard One",
    category: "snowboards",
    description: "Test gear",
    image_url: "",
    images: [],
    price_per_day: 50,
    rating: 4.7,
    review_count: 12,
    owner: {
      id: "shop-1",
      name: "Shop 1",
      imageUrl: "",
      rating: 4.8,
      reviewCount: 10,
      responseRate: 95,
    },
    location: { lat: 34.05, lng: -118.25, address: "Shop 1 address" },
    distance: 0,
    specifications: { size: "M", weight: "10", material: "Carbon", suitable: "Intermediate" },
    availability: { available: true },
    pricing_options: [],
  },
];

describe("ExplorePage geolocation gate", () => {
  beforeEach(() => {
    harness.getEquipmentDataMock.mockReset();
    harness.hybridViewMock.mockClear();
    harness.requestLocationMock.mockClear();
    harness.getEquipmentDataMock.mockResolvedValue(sampleEquipment);
    setGeoState({
      latitude: null,
      longitude: null,
      permissionState: "idle",
      permissionDenied: false,
      loading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch equipment while permission is idle and shows the waiting copy", async () => {
    renderExplore();

    expect(screen.getByText("Finding gear near you...")).toBeInTheDocument();
    expect(harness.getEquipmentDataMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("hybrid-view-props")).not.toBeInTheDocument();
  });

  it("triggers requestLocation once on mount when state is idle", () => {
    renderExplore();

    expect(harness.requestLocationMock).toHaveBeenCalledTimes(1);
  });

  it("does not fetch equipment while permission is loading", async () => {
    setGeoState({ permissionState: "loading", loading: true });
    renderExplore();

    expect(screen.getByText("Finding gear near you...")).toBeInTheDocument();
    expect(harness.getEquipmentDataMock).not.toHaveBeenCalled();
  });

  it("fetches equipment and passes user coords as initialCenter when granted", async () => {
    setGeoState({
      latitude: 37.7749,
      longitude: -122.4194,
      permissionState: "granted",
      permissionDenied: false,
      loading: false,
    });

    renderExplore();

    await waitFor(() => {
      expect(harness.getEquipmentDataMock).toHaveBeenCalled();
    });

    const hybridViewEl = await screen.findByTestId("hybrid-view-props");
    expect(hybridViewEl).toHaveAttribute("data-initial-center-lat", "37.7749");
    expect(hybridViewEl).toHaveAttribute("data-initial-center-lng", "-122.4194");
    expect(hybridViewEl).toHaveAttribute("data-is-user-location", "true");
  });

  it("fetches equipment and passes the Santa Monica fallback coords as initialCenter when denied", async () => {
    setGeoState({
      latitude: null,
      longitude: null,
      permissionState: "denied",
      permissionDenied: true,
      loading: false,
    });

    renderExplore();

    await waitFor(() => {
      expect(harness.getEquipmentDataMock).toHaveBeenCalled();
    });

    const hybridViewEl = await screen.findByTestId("hybrid-view-props");
    expect(hybridViewEl).toHaveAttribute(
      "data-initial-center-lat",
      String(DEFAULT_EXPLORE_COORDINATES.lat),
    );
    expect(hybridViewEl).toHaveAttribute(
      "data-initial-center-lng",
      String(DEFAULT_EXPLORE_COORDINATES.lng),
    );
    expect(hybridViewEl).toHaveAttribute("data-is-user-location", "false");
  });
});
