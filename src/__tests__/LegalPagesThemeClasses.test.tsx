import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";

describe("Legal page theme-aware typography", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
    });
  });

  it("uses foreground and muted-foreground classes on the privacy policy page", () => {
    render(
      <MemoryRouter initialEntries={["/privacy-policy"]}>
        <PrivacyPolicyPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toHaveClass("text-foreground");
    expect(screen.getByRole("heading", { name: "Information We Collect" })).toHaveClass("text-foreground");
    expect(screen.getByRole("heading", { name: "Personal Information" })).toHaveClass("text-foreground");
    expect(
      screen.getByText(/At DemoStoke, we are committed to protecting your privacy/i),
    ).toHaveClass("text-foreground");
    expect(screen.getByText("Website usage patterns and page views")).toHaveClass("text-foreground");
    expect(
      screen.getByText("We will never sell your personal information for marketing purposes."),
    ).toHaveClass("text-foreground");

    const effectiveDateLabel = screen.getByText("Effective Date:");
    expect(effectiveDateLabel).toHaveClass("text-muted-foreground");
    expect(effectiveDateLabel.closest("p")).toHaveClass("text-muted-foreground");
  });

  it("uses foreground and muted-foreground classes on the terms of service page", () => {
    render(
      <MemoryRouter initialEntries={["/terms-of-service"]}>
        <TermsOfServicePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Terms of Service" })).toHaveClass("text-foreground");
    expect(screen.getByRole("heading", { name: "2. Account Registration" })).toHaveClass("text-foreground");
    expect(screen.getByRole("heading", { name: "For All Users" })).toHaveClass("text-foreground");
    expect(
      screen.getByText(/Welcome to DemoStoke! These Terms of Service/i),
    ).toHaveClass("text-foreground");
    expect(screen.getByText("Create an account with accurate information")).toHaveClass("text-foreground");
    expect(screen.getByText("Important:")).toHaveClass("text-foreground");

    const effectiveDateLabel = screen.getByText("Effective Date:");
    expect(effectiveDateLabel).toHaveClass("text-muted-foreground");
    expect(effectiveDateLabel.closest("p")).toHaveClass("text-muted-foreground");
  });
});
