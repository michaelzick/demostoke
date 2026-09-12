import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserEquipment } from "@/hooks/useUserEquipment";

const mocks = vi.hoisted(() => ({
  options: null as unknown as { queryFn: () => Promise<unknown[]> },
  select: vi.fn(), eq: vi.fn(), order: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: typeof mocks.options) => { mocks.options = options; return {}; },
  useMutation: vi.fn(), useQueryClient: vi.fn(),
}));
vi.mock("@/helpers", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/utils/multipleImageHandling", () => ({ fetchEquipmentImagesForIds: async () => new Map() }));
vi.mock("@/services/equipment/shopGearSyncService", () => ({ syncShopGearFromEndpoint: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: mocks.select }) },
}));

const row = { id: "gear", user_id: "public-shop", name: "Board", category: "surfboards", price_per_day: 250, currency_code: "MXN", status: "available", visible_on_map: true };
beforeEach(() => {
  vi.clearAllMocks();
  const query = { eq: mocks.eq, order: mocks.order };
  mocks.select.mockReturnValue(query);
  mocks.eq.mockReturnValue(query);
  mocks.order.mockResolvedValue({ data: [row], error: null });
});

describe("public equipment query compatibility", () => {
  it("reads a specified public shop without a signed-in user and keeps source currency", async () => {
    useUserEquipment("public-shop", true);
    expect(await mocks.options.queryFn()).toMatchObject([{ id: "gear", currency_code: "MXN", price_per_day: 250 }]);
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "public-shop");
    expect(mocks.eq).toHaveBeenCalledWith("visible_on_map", true);
  });
  it("keeps optional visibility filtering and the legacy currency-column fallback", async () => {
    const { currency_code: _currency, ...legacyRow } = row;
    mocks.order.mockResolvedValueOnce({ data: null, error: { code: "42703", message: "column currency_code does not exist" } })
      .mockResolvedValueOnce({ data: [legacyRow], error: null });
    useUserEquipment("public-shop", false);
    expect(await mocks.options.queryFn()).toMatchObject([{ id: "gear", currency_code: "USD" }]);
    expect(mocks.select.mock.calls[0][0]).toContain("currency_code");
    expect(mocks.select.mock.calls[1][0]).not.toContain("currency_code");
    expect(mocks.eq).not.toHaveBeenCalledWith("visible_on_map", true);
  });
});
