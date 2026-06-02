import { describe, expect, it } from "vitest";
import {
  formatCurrencyAmount,
  formatCurrencyPerDuration,
  normalizeCurrencyCode,
} from "@/utils/currency";

describe("currency utilities", () => {
  it("normalizes valid ISO currency codes and defaults invalid values to USD", () => {
    expect(normalizeCurrencyCode("mxn")).toBe("MXN");
    expect(normalizeCurrencyCode(" cad ")).toBe("CAD");
    expect(normalizeCurrencyCode("")).toBe("USD");
    expect(normalizeCurrencyCode("US")).toBe("USD");
  });

  it("formats source-native daily rates with the requested currency code", () => {
    const mxnDailyRate = formatCurrencyPerDuration(700, "MXN");
    const cadDailyRate = formatCurrencyPerDuration(80, "CAD");
    const usdDailyRate = formatCurrencyPerDuration(55, "USD");

    expect(mxnDailyRate).toMatch(/^(MX\$|MXN\s?)700\/day$/);
    expect(cadDailyRate).toMatch(/^(CA\$|CAD\s?)80\/day$/);
    expect(usdDailyRate).toBe("$55/day");
  });

  it("falls back to USD display when the currency code is missing or invalid", () => {
    expect(formatCurrencyAmount(42, undefined)).toBe("$42");
    expect(formatCurrencyPerDuration(42, "bad-code")).toBe("$42/day");
  });
});
