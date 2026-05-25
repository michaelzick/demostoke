import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoSave } from "@/hooks/useAutoSave";

interface DraftPayload {
  title: string;
  content?: string;
  tags?: string[];
}

async function advanceTimers(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does not save just because the save callback identity changes", async () => {
    const save = vi.fn(async (_data: DraftPayload) => undefined);

    const { rerender } = renderHook(
      ({ data, enabled }: { data: DraftPayload; enabled: boolean }) =>
        useAutoSave<DraftPayload>({
          data,
          delay: 100,
          enabled,
          onSave: async (payload) => {
            await save(payload);
          },
        }),
      { initialProps: { data: { title: "Loaded draft" }, enabled: true } }
    );

    rerender({ data: { title: "Loaded draft" }, enabled: true });
    await advanceTimers(500);

    expect(save).not.toHaveBeenCalled();
  });

  it("saves once after debounced content changes and does not loop after save state updates", async () => {
    const save = vi.fn(async (_data: DraftPayload) => undefined);

    const { rerender } = renderHook(
      ({ data, enabled }: { data: DraftPayload; enabled: boolean }) =>
        useAutoSave<DraftPayload>({
          data,
          delay: 100,
          enabled,
          onSave: async (payload) => {
            await save(payload);
          },
        }),
      { initialProps: { data: { title: "" }, enabled: true } }
    );

    rerender({ data: { title: "First draft" }, enabled: true });
    await advanceTimers(99);
    expect(save).not.toHaveBeenCalled();

    await advanceTimers(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenLastCalledWith({ title: "First draft" });

    rerender({ data: { title: "First draft" }, enabled: true });
    await advanceTimers(500);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("does not save stale pre-load editor state when autosave is first enabled", async () => {
    const save = vi.fn(async (_data: DraftPayload) => undefined);

    const { rerender } = renderHook(
      ({ data, enabled }: { data: DraftPayload; enabled: boolean }) =>
        useAutoSave<DraftPayload>({
          data,
          delay: 100,
          enabled,
          onSave: async (payload) => {
            await save(payload);
          },
        }),
      { initialProps: { data: { title: "", content: "" }, enabled: false } }
    );

    rerender({
      data: { title: "Loaded draft", content: "Existing post body" },
      enabled: true,
    });
    await advanceTimers(500);
    expect(save).not.toHaveBeenCalled();

    rerender({
      data: { title: "Loaded draft", content: "Existing post body with a local edit" },
      enabled: true,
    });
    await advanceTimers(100);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenLastCalledWith({
      title: "Loaded draft",
      content: "Existing post body with a local edit",
    });
  });
});
