import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { YouTubeTutorialModal } from "@/components/equipment-detail/YouTubeTutorialModal";
import type { Trick } from "@/hooks/useTricksGeneration";

// Control the data layer so we can assert each end state independently.
vi.mock("@/hooks/useYouTubeSearch", () => ({
  useYouTubeSearch: vi.fn(),
}));

import { useYouTubeSearch } from "@/hooks/useYouTubeSearch";

const useYouTubeSearchMock = useYouTubeSearch as unknown as ReturnType<typeof vi.fn>;

const trick: Trick = {
  name: "Ollie",
  difficulty: "beginner",
  description: "A foundational skate trick.",
  youtubeSearchQuery: "how to ollie",
};

const baseHookState = {
  videos: [],
  isLoading: false,
  error: null as string | null,
  isRateLimited: false,
  searchVideos: vi.fn().mockResolvedValue([]),
  reset: vi.fn(),
};

// Radix Sheet (Dialog) touches these browser APIs that jsdom does not implement.
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe("YouTubeTutorialModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a retryable message when rate limited and hides the generic error", () => {
    useYouTubeSearchMock.mockReturnValue({ ...baseHookState, isRateLimited: true });

    render(<YouTubeTutorialModal isOpen onClose={() => {}} trick={trick} />);

    expect(screen.getByText(/temporarily unavailable due to high demand/i)).toBeInTheDocument();
    expect(screen.queryByText(/Failed to load videos/i)).not.toBeInTheDocument();
  });

  it("shows the generic error only when it is not a rate limit", () => {
    useYouTubeSearchMock.mockReturnValue({ ...baseHookState, error: "boom" });

    render(<YouTubeTutorialModal isOpen onClose={() => {}} trick={trick} />);

    expect(screen.getByText(/Failed to load videos/i)).toBeInTheDocument();
    expect(screen.queryByText(/temporarily unavailable/i)).not.toBeInTheDocument();
  });
});
