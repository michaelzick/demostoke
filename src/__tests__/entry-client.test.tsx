import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRootMock, renderMock, hydrateRootMock } = vi.hoisted(() => {
  const render = vi.fn();
  return {
    createRootMock: vi.fn(() => ({ render })),
    renderMock: render,
    hydrateRootMock: vi.fn(),
  };
});

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
  hydrateRoot: hydrateRootMock,
}));

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../App", () => ({
  default: ({ initialSsrPageData }: { initialSsrPageData?: Record<string, unknown> }) => (
    <div data-testid="app" data-ssr-page-data={JSON.stringify(initialSsrPageData ?? {})} />
  ),
}));

describe("entry-client bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    hydrateRootMock.mockReset();
    createRootMock.mockReset();
    renderMock.mockReset();
    document.body.innerHTML = '<div id="root"></div>';
    window.__SSR_PAGE_DATA__ = undefined;
  });

  it("hydrates when SSR markup is already present", async () => {
    document.getElementById("root")!.innerHTML = '<div data-ssr="true"></div>';
    window.__SSR_PAGE_DATA__ = { source: "server" };

    await import("../entry-client");

    expect(hydrateRootMock).toHaveBeenCalledTimes(1);
    expect(createRootMock).not.toHaveBeenCalled();
  });

  it("falls back to createRoot when the HTML shell has no SSR app markup", async () => {
    document.getElementById("root")!.innerHTML = "<!--app-html-->";

    await import("../entry-client");

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(hydrateRootMock).not.toHaveBeenCalled();
  });
});
