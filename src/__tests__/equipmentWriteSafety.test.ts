import { describe, expect, it, vi } from "vitest";
import { prepareEquipmentData } from "@/utils/equipmentDataPreparation";

const fields = {
  gearName: "Rental board", gearType: "surfboard", description: "Public listing",
  address: "123 Public Shop St", coordinates: { lat: 20, lng: -100 }, size: "Medium",
  skillLevel: "intermediate", pricePerDay: "250", currencyCode: "MXN",
  finalImageUrl: "https://example.com/board.jpg", damageDeposit: "500",
};

describe("equipment write preparation", () => {
  it("retains verified ownership, public visibility and source currency on creation", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(prepareEquipmentData({ ...fields, userId: "owner-id" })).toMatchObject({
        user_id: "owner-id", visible_on_map: true, status: "available", currency_code: "MXN", price_per_day: 250,
        location_address: "123 Public Shop St", location_lat: 20, location_lng: -100,
      });
    } finally { log.mockRestore(); }
  });
  it("does not overwrite ownership in an edit payload", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(prepareEquipmentData(fields)).not.toHaveProperty("user_id");
    } finally { log.mockRestore(); }
  });
});
