import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

import { supabase } from "@/integrations/supabase/client";
import { useYouTubeSearch } from "@/hooks/useYouTubeSearch";

const invokeMock = supabase.functions.invoke as unknown as ReturnType<typeof vi.fn>;

const sampleVideos = [
  { videoId: "abc", title: "Ollie", thumbnail: "t", channelTitle: "c", publishedAt: "" },
];

describe("useYouTubeSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // Regression: the tutorial drawer lists searchVideos/reset in its effect deps.
  // If their identity changed every render, the effect would re-fire the search
  // forever and the spinner would never settle.
  it("keeps searchVideos and reset stable across re-renders", () => {
    invokeMock.mockResolvedValue({ data: { videos: [] }, error: null });

    const { result, rerender } = renderHook(() => useYouTubeSearch());

    const firstSearch = result.current.searchVideos;
    const firstReset = result.current.reset;

    rerender();

    expect(result.current.searchVideos).toBe(firstSearch);
    expect(result.current.reset).toBe(firstReset);
  });

  it("loads videos once and settles the loading state", async () => {
    invokeMock.mockResolvedValue({ data: { videos: sampleVideos }, error: null });

    const { result } = renderHook(() => useYouTubeSearch());

    let returned: typeof sampleVideos = [];
    await act(async () => {
      returned = await result.current.searchVideos("how to ollie");
    });

    expect(invokeMock).toHaveBeenCalledTimes(1);
    expect(invokeMock).toHaveBeenCalledWith("youtube-tutorial-search", {
      body: { query: "how to ollie", maxResults: 3 },
    });
    expect(returned).toEqual(sampleVideos);
    expect(result.current.videos).toEqual(sampleVideos);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isRateLimited).toBe(false);
  });

  it("serves cached results without re-invoking the function", async () => {
    invokeMock.mockResolvedValue({ data: { videos: sampleVideos }, error: null });

    const { result } = renderHook(() => useYouTubeSearch());

    await act(async () => {
      await result.current.searchVideos("how to carve");
    });
    expect(invokeMock).toHaveBeenCalledTimes(1);

    invokeMock.mockClear();

    let returned: typeof sampleVideos = [];
    await act(async () => {
      returned = await result.current.searchVideos("how to carve");
    });

    // Second search for the same query is served from cache — no quota spent.
    expect(invokeMock).not.toHaveBeenCalled();
    expect(returned).toEqual(sampleVideos);
    expect(result.current.videos).toEqual(sampleVideos);
  });

  it("flags a clean 429 response as rate limited, not a generic error", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: {
        message: "Edge Function returned a non-2xx status code",
        context: { status: 429, json: async () => ({ error: "rate_limited", rateLimited: true }) },
      },
    });

    const { result } = renderHook(() => useYouTubeSearch());

    await act(async () => {
      await result.current.searchVideos("how to ollie");
    });

    expect(result.current.isRateLimited).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("detects a rate limit from a non-2xx body that mentions a 429", async () => {
    // Shape returned by the currently-deployed function (500 + body string).
    invokeMock.mockResolvedValue({
      data: null,
      error: {
        message: "Edge Function returned a non-2xx status code",
        context: { status: 500, json: async () => ({ error: "YouTube API error: 429" }) },
      },
    });

    const { result } = renderHook(() => useYouTubeSearch());

    await act(async () => {
      await result.current.searchVideos("how to ollie");
    });

    expect(result.current.isRateLimited).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("surfaces a generic error and stops loading when the function fails", async () => {
    invokeMock.mockResolvedValue({ data: null, error: { message: "boom" } });

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useYouTubeSearch());

    let returned: unknown[] = [];
    await act(async () => {
      returned = await result.current.searchVideos("how to ollie");
    });

    expect(returned).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.error).toBe("boom");
    errorSpy.mockRestore();
  });
});
