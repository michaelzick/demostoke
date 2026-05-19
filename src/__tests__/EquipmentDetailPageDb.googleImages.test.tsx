import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EquipmentDetailPageDb from "@/pages/EquipmentDetailPageDb";
import type { Equipment } from "@/types";

const testHarness = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  toastMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: testHarness.invokeMock,
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: testHarness.toastMock,
  }),
}));

vi.mock("@/contexts/auth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/hooks/useUserRole", () => ({
  useIsAdmin: () => ({ isAdmin: false }),
}));

vi.mock("@/hooks/useUserEquipment", () => ({
  useDeleteEquipment: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateEquipmentVisibility: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/utils/tracking", () => ({
  buildEquipmentTrackingFrom: () => ({}),
  trackEvent: vi.fn(),
}));

vi.mock("@/components/Breadcrumbs", () => ({
  default: () => <nav aria-label="breadcrumbs" />,
}));

vi.mock("@/components/waiver/CustomerWaiverForm", () => ({
  default: () => <div data-testid="waiver-form" />,
}));

vi.mock("@/components/equipment-detail/EquipmentHeader", () => ({
  default: ({ gearDisplayName }: { gearDisplayName: string }) => (
    <h1>{gearDisplayName}</h1>
  ),
}));

vi.mock("@/components/equipment-detail/EquipmentSpecs", () => ({
  default: () => <div data-testid="equipment-specs" />,
}));

vi.mock("@/components/equipment-detail/LocationTab", () => ({
  default: () => <div data-testid="location-tab" />,
}));

vi.mock("@/components/equipment-detail/ReviewsTab", () => ({
  default: () => <div data-testid="reviews-tab" />,
}));

vi.mock("@/components/equipment-detail/PolicyTab", () => ({
  default: () => <div data-testid="policy-tab" />,
}));

vi.mock("@/components/equipment-detail/OwnerCard", () => ({
  default: () => <div data-testid="owner-card" />,
}));

vi.mock("@/components/equipment-detail/SimilarEquipment", () => ({
  default: () => <div data-testid="similar-equipment" />,
}));

vi.mock("@/components/equipment-detail/GearImageModal", () => ({
  default: () => null,
}));

vi.mock("@/components/equipment-detail/ContactInfoModal", () => ({
  default: () => null,
}));

vi.mock("@/components/equipment-detail/TricksSection", () => ({
  TricksSection: () => <div data-testid="tricks-section" />,
}));

vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel">{children}</div>
  ),
  CarouselContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CarouselItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CarouselNext: () => <button type="button">Next</button>,
  CarouselPrevious: () => <button type="button">Previous</button>,
}));

const equipment: Equipment = {
  id: "gear-1",
  name: "Burton Custom",
  category: "snowboards",
  subcategory: "all-mountain",
  description: "A directional twin snowboard.",
  image_url: "https://stored.example.com/original.jpg",
  images: ["https://stored.example.com/original.jpg"],
  price_per_day: 65,
  price_per_hour: 15,
  price_per_week: 300,
  rating: 4.8,
  review_count: 12,
  owner: {
    id: "owner-1",
    name: "Demo Shop",
    imageUrl: "",
    rating: 4.9,
    reviewCount: 20,
    responseRate: 95,
  },
  location: {
    lat: 39.1,
    lng: -120.1,
    address: "Truckee, CA",
  },
  distance: 0,
  specifications: {
    size: "156",
    weight: "",
    material: "",
    suitable: "Intermediate",
  },
  availability: {
    available: true,
  },
  pricing_options: [],
  status: "available",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-05-01T00:00:00Z",
};

const renderDetailPage = () =>
  render(
    <MemoryRouter>
      <EquipmentDetailPageDb
        equipment={equipment}
        similarEquipment={[]}
        waiverCompleted={false}
        showWaiver={false}
        setShowWaiver={vi.fn()}
        handleWaiverComplete={vi.fn()}
        bookingCardRef={React.createRef<HTMLDivElement>()}
        lastVerifiedDate="2026-05-01"
        gearDisplayName="Burton Custom 156"
      />
    </MemoryRouter>,
  );

const imageSources = () =>
  screen
    .getAllByRole("img")
    .map((img) => img.getAttribute("src"))
    .filter(Boolean);

const googleImageResult = (
  url: string,
  overrides: Record<string, unknown> = {},
) => ({
  url,
  thumbnail: url.replace("/gear-", "/thumbs/gear-"),
  title: "Burton Custom snowboard product image",
  source: "burton.example.com",
  width: 1600,
  height: 1000,
  ...overrides,
});

describe("EquipmentDetailPageDb Google image swap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches Google image URLs and swaps the rendered carousel images", async () => {
    testHarness.invokeMock.mockResolvedValue({
      data: {
        results: [
          googleImageResult(
            "https://images.example.com/burton-custom-1.jpg",
          ),
          googleImageResult(
            "https://images.example.com/burton-custom-2.jpg",
          ),
        ],
      },
      error: null,
    });

    renderDetailPage();

    expect(imageSources()).toEqual(["https://stored.example.com/original.jpg"]);

    fireEvent.click(
      screen.getByRole("button", { name: "View Real Gear Images" }),
    );

    await waitFor(() => {
      expect(imageSources()).toEqual([
        "https://images.example.com/burton-custom-1.jpg",
        "https://images.example.com/burton-custom-2.jpg",
      ]);
    });

    expect(testHarness.invokeMock).toHaveBeenCalledWith(
      "google-image-search",
      {
        body: {
          query: "Burton Custom",
          gearType: "snowboards",
          count: 10,
          size: "large",
        },
      },
    );
  });

  it("uses only the first 10 unique HTTPS result URLs", async () => {
    testHarness.invokeMock.mockResolvedValue({
      data: {
        results: [
          googleImageResult("http://images.example.com/insecure.jpg"),
          googleImageResult("https://images.example.com/gear-1.jpg"),
          googleImageResult("https://images.example.com/gear-1.jpg"),
          ...Array.from({ length: 11 }, (_, index) => ({
            ...googleImageResult(
              `https://images.example.com/gear-${index + 2}.jpg`,
            ),
          })),
        ],
      },
      error: null,
    });

    renderDetailPage();

    fireEvent.click(
      screen.getByRole("button", { name: "View Real Gear Images" }),
    );

    await waitFor(() => {
      expect(imageSources()).toHaveLength(10);
    });

    expect(imageSources()).toEqual(
      Array.from(
        { length: 10 },
        (_, index) => `https://images.example.com/gear-${index + 1}.jpg`,
      ),
    );
  });

  it("ignores low-resolution, missing-dimension, duplicate, non-HTTPS, and blocked-media results", async () => {
    testHarness.invokeMock.mockResolvedValue({
      data: {
        results: [
          googleImageResult("http://images.example.com/insecure.jpg"),
          googleImageResult("https://images.example.com/low-res.jpg", {
            width: 900,
            height: 600,
          }),
          googleImageResult("https://images.example.com/missing-width.jpg", {
            width: undefined,
          }),
          googleImageResult("https://i.ytimg.com/vi/demo/maxresdefault.jpg", {
            thumbnail: "https://i.ytimg.com/vi/demo/hqdefault.jpg",
            title: "Burton Custom video review thumbnail",
            source: "youtube.com",
          }),
          googleImageResult("https://images.example.com/valid.jpg"),
          googleImageResult("https://images.example.com/valid.jpg"),
        ],
      },
      error: null,
    });

    renderDetailPage();

    fireEvent.click(
      screen.getByRole("button", { name: "View Real Gear Images" }),
    );

    await waitFor(() => {
      expect(imageSources()).toEqual(["https://images.example.com/valid.jpg"]);
    });
  });

  it("keeps the original carousel images when the search returns no URLs", async () => {
    testHarness.invokeMock.mockResolvedValue({
      data: {
        results: [],
      },
      error: null,
    });

    renderDetailPage();

    fireEvent.click(
      screen.getByRole("button", { name: "View Real Gear Images" }),
    );

    await waitFor(() => {
      expect(testHarness.toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "No Real Images Found",
        }),
      );
    });

    expect(imageSources()).toEqual(["https://stored.example.com/original.jpg"]);
  });

  it("keeps the original carousel images when the search fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    testHarness.invokeMock.mockResolvedValue({
      data: null,
      error: new Error("Search failed"),
    });

    renderDetailPage();

    fireEvent.click(
      screen.getByRole("button", { name: "View Real Gear Images" }),
    );

    await waitFor(() => {
      expect(testHarness.toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Image Search Failed",
          variant: "destructive",
        }),
      );
    });

    expect(imageSources()).toEqual(["https://stored.example.com/original.jpg"]);
    consoleErrorSpy.mockRestore();
  });
});
