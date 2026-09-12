import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BrokenImageScannerSection from "@/components/admin/BrokenImageScannerSection";

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), remove: vi.fn(), toast: vi.fn() }));
vi.mock("@/hooks/useUserRole", () => ({ useIsAdmin: () => ({ isAdmin: true, isLoading: false }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: { access_token: "test-token" } } }) },
    functions: { invoke: mocks.invoke },
    from: () => ({ delete: () => ({ eq: mocks.remove }) }),
  },
}));

const image = (id: string, errorReason: string) => ({
  imageId: id, imageUrl: "https://images.example.com/shared.jpg", equipmentId: id,
  gearName: `Board ${id}`, gearSlug: `board--${id}`, category: "surfboards", totalImages: 2, errorReason,
});

beforeEach(() => vi.resetAllMocks());

describe("image scan review", () => {
  it("groups temporary failures and never offers deletion, including legacy function results", async () => {
    mocks.invoke.mockResolvedValue({ data: {
      brokenImages: [image("1", "HTTP 429"), image("2", "Timeout")],
      inconclusiveImages: [image("3", "HTTP 503")], total: 2000, scanned: 1000,
    } });
    render(<BrokenImageScannerSection />);
    fireEvent.click(screen.getByRole("button", { name: "Scan for Broken Images" }));
    await screen.findByText("Checks to retry");
    expect(screen.getAllByText("https://images.example.com/shared.jpg")).toHaveLength(1);
    expect(screen.getByText(/These 3 images are excluded from deletion/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delete All|Remove broken image/ })).not.toBeInTheDocument();
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ description: "Checked 1000 of 2000 images: 0 confirmed broken, 3 inconclusive." }));
  });

  it("offers only confirmed missing images for deletion and retains the exact failed rows", async () => {
    mocks.invoke.mockResolvedValue({ data: {
      brokenImages: [image("1", "HTTP 404"), image("2", "HTTP 410"), image("3", "HTTP 404"), image("4", "HTTP 429")],
      total: 4, scanned: 4,
    } });
    mocks.remove.mockImplementation(async (_, id) => ({ error: id === "2" ? new Error("failed") : null }));
    render(<BrokenImageScannerSection />);
    fireEvent.click(screen.getByRole("button", { name: "Scan for Broken Images" }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete All (3)" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete All" }));
    await waitFor(() => expect(screen.queryByRole("link", { name: "Board 1" })).not.toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Board 2" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Board 3" })).not.toBeInTheDocument();
    expect(mocks.remove.mock.calls).toEqual([["id", "1"], ["id", "2"], ["id", "3"]]);
  });
});
