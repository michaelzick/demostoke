import { describe, expect, it } from "vitest";

import type { Equipment } from "@/types";
import {
  filterEquipmentByViewportBounds,
  MapViewportBounds,
} from "@/utils/mapViewportFiltering";

const createEquipment = (
  id: string,
  lat: number | null,
  lng: number | null,
): Equipment => ({
  id,
  name: `Gear ${id}`,
  category: "skis",
  description: "Test gear",
  image_url: "",
  images: [],
  price_per_day: 50,
  rating: 4.7,
  review_count: 12,
  owner: {
    id: `owner-${id}`,
    name: `Owner ${id}`,
    imageUrl: "",
    rating: 4.8,
    reviewCount: 10,
    responseRate: 95,
  },
  location: {
    lat: lat as number,
    lng: lng as number,
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

describe("filterEquipmentByViewportBounds", () => {
  const bounds: MapViewportBounds = {
    north: 42,
    south: 32,
    east: -116,
    west: -124,
  };

  it("includes items inside the current bounds", () => {
    const equipment = [
      createEquipment("inside-a", 37.7749, -122.4194),
      createEquipment("inside-b", 39.7392, -104.9903),
      createEquipment("outside", 47.6062, -122.3321),
    ];

    const result = filterEquipmentByViewportBounds(equipment, bounds);

    expect(result.map((item) => item.id)).toEqual(["inside-a"]);
  });

  it("excludes items outside the current bounds", () => {
    const equipment = [
      createEquipment("west", 36.1699, -130),
      createEquipment("north", 45, -120),
      createEquipment("south", 20, -120),
      createEquipment("east", 36, -100),
    ];

    const result = filterEquipmentByViewportBounds(equipment, bounds);

    expect(result).toEqual([]);
  });

  it("preserves the incoming order for visible items", () => {
    const equipment = [
      createEquipment("second", 35.5, -121),
      createEquipment("first", 36.5, -122),
      createEquipment("third", 37.5, -123),
    ];

    const result = filterEquipmentByViewportBounds(equipment, bounds);

    expect(result.map((item) => item.id)).toEqual(["second", "first", "third"]);
  });

  it("handles wrapped longitude bounds across the antimeridian", () => {
    const wrappedBounds: MapViewportBounds = {
      north: 20,
      south: -20,
      east: -170,
      west: 170,
    };

    const equipment = [
      createEquipment("east-side", 5, 175),
      createEquipment("west-side", -5, -175),
      createEquipment("middle", 0, 160),
    ];

    const result = filterEquipmentByViewportBounds(equipment, wrappedBounds);

    expect(result.map((item) => item.id)).toEqual(["east-side", "west-side"]);
  });

  it("drops items without valid map coordinates", () => {
    const equipment = [
      createEquipment("valid", 37.7749, -122.4194),
      createEquipment("missing-lat", null, -122.4194),
      createEquipment("missing-lng", 37.7749, null),
    ];

    const result = filterEquipmentByViewportBounds(equipment, null);

    expect(result.map((item) => item.id)).toEqual(["valid"]);
  });
});
