import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import MapLegend from "@/components/map/MapLegend";

describe("MapLegend", () => {
  it("lets pointer input pass through the legend overlay", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/explore"]}>
        <MapLegend activeCategory="skis" viewMode="hybrid" />
      </MemoryRouter>,
    );

    expect(container.firstChild).toHaveClass("pointer-events-none");
  });
});
