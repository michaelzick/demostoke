export const DEFAULT_CURRENCY_CODE = "USD";

export const normalizeCurrencyCode = (currencyCode?: string | null): string => {
  const normalized = (currencyCode || DEFAULT_CURRENCY_CODE).trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : DEFAULT_CURRENCY_CODE;
};

const hasFractionalCents = (amount: number): boolean =>
  Number.isFinite(amount) && Math.abs(amount % 1) > Number.EPSILON;

export const formatCurrencyAmount = (
  amount: number,
  currencyCode?: string | null,
): string => {
  const normalizedCurrencyCode = normalizeCurrencyCode(currencyCode);
  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
  const fractionDigits = hasFractionalCents(safeAmount) ? 2 : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrencyCode,
      currencyDisplay: "symbol",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${normalizedCurrencyCode} ${safeAmount.toFixed(fractionDigits)}`;
  }
};

export const formatCurrencyPerDuration = (
  amount: number,
  currencyCode?: string | null,
  duration = "day",
): string => `${formatCurrencyAmount(amount, currencyCode)}/${duration}`;
