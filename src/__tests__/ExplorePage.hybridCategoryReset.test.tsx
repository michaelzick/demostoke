import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import ExplorePage from "@/pages/ExplorePage";
import type { Equipment } from "@/types";

const pageHarness = vi.hoisted(() => ({
  getEquipmentDataMock: vi.fn(),
  hybridViewMock: vi.fn(),
}));

vi.mock("@/services/searchService", () => ({
  getEquipmentData: pageHarness.getEquipmentDataMock,
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
  useUserLocations: () => ({
    data: [
      {
        id: "shop-1",
        name: "Shop 1",
        role: "retail-store",
        address: "Shop 1 address",
        location: { lat: 34.05, lng: -118.25 },
        avatar_url: null,
        equipment_categories: ["snowboards"],
      },
      {
        id: "shop-2",
        name: "Shop 2",
        role: "retail-store",
        address: "Shop 2 address",
        location: { lat: 36.17, lng: -115.14 },
        avatar_url: null,
        equipment_categories: ["skis"],
      },
    ],
  }),
}));

vi.mock("@/hooks/useEquipmentWithDynamicDistance", () => ({
  useEquipmentWithDynamicDistance: (equipment: Equipment[]) => ({
    equipment,
    isLocationBased: false,
  }),
}));

vi.mock("@/hooks/useUserRole", () => ({
  useIsAdmin: () => ({
    isAdmin: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/contexts/FavoritesContext", () => ({
  useFavorites: () => ({
    favorites: [],
  }),
}));

vi.mock("@/contexts/auth", () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock("@/hooks/useRecentlyViewedEquipment", () => ({
  useRecentlyViewedEquipment: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock("@/components/MapComponent", () => ({
  default: () => <div data-testid="map-component" />,
}));

vi.mock("@/components/map/MapLegend", () => ({
  default: () => <div data-testid="map-legend" />,
}));

vi.mock("@/components/EquipmentCard", () => ({
  default: () => <div data-testid="equipment-card" />,
}));

vi.mock("@/components/HybridView", () => ({
  default: (props: {
    activeCategory: string | null;
    filteredEquipment: Equipment[];
    resetSignal?: number;
  }) => {
    pageHarness.hybridViewMock(props);

    return (
      <div
        data-testid="hybrid-view-props"
        data-active-category={props.activeCategory ?? ""}
        data-filtered-count={String(props.filteredEquipment.length)}
        data-reset-signal={String(props.resetSignal ?? 0)}
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
    location: {
      lat: 34.05,
      lng: -118.25,
      address: "Shop 1 address",
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
  },
  {
    id: "gear-2",
    name: "Skis One",
    category: "skis",
    description: "Test gear",
    image_url: "",
    images: [],
    price_per_day: 60,
    rating: 4.8,
    review_count: 8,
    owner: {
      id: "shop-2",
      name: "Shop 2",
      imageUrl: "",
      rating: 4.6,
      reviewCount: 9,
      responseRate: 90,
    },
    location: {
      lat: 36.17,
      lng: -115.14,
      address: "Shop 2 address",
    },
    distance: 0,
    specifications: {
      size: "L",
      weight: "12",
      material: "Carbon",
      suitable: "Advanced",
    },
    availability: {
      available: true,
    },
  },
];

describe("ExplorePage hybrid category reset", () => {
  beforeEach(() => {
    pageHarness.getEquipmentDataMock.mockReset();
    pageHarness.hybridViewMock.mockClear();
    pageHarness.getEquipmentDataMock.mockResolvedValue(sampleEquipment);
  });

  it("increments hybrid resetSignal on category select and same-category reselect", async () => {
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <ExplorePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("hybrid-view-props")).toHaveAttribute(
        "data-reset-signal",
        "0",
      );
    });

    const snowboardsButton = screen.getByRole("button", { name: "Snowboards" });
    fireEvent.click(snowboardsButton);

    await waitFor(() => {
      expect(screen.getByTestId("hybrid-view-props")).toHaveAttribute(
        "data-active-category",
        "snowboards",
      );
    });

    expect(screen.getByTestId("hybrid-view-props")).toHaveAttribute(
      "data-reset-signal",
      "1",
    );

    fireEvent.click(snowboardsButton);

    await waitFor(() => {
      expect(screen.getByTestId("hybrid-view-props")).toHaveAttribute(
        "data-reset-signal",
        "2",
      );
    });

    expect(screen.getByTestId("hybrid-view-props")).toHaveAttribute(
      "data-active-category",
      "snowboards",
    );
  });
});
