import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import { useDemoEventCandidates } from "@/hooks/useDemoEventCandidates";

vi.mock("@/helpers", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order() {
          return this;
        },
        eq: () => new Promise(() => {}),
      }),
    }),
  },
}));

it("keeps the candidate list stable while the Content tab loads", () => {
  const queryClient = new QueryClient();
  const { result, rerender } = renderHook(() => useDemoEventCandidates("pending"), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  expect(result.current.isLoading).toBe(true);
  const initialCandidates = result.current.candidates;
  expect(initialCandidates).toEqual([]);

  rerender();

  expect(result.current.candidates).toBe(initialCandidates);
});
