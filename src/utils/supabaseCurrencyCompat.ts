type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

export const isMissingCurrencyCodeColumnError = (
  error: unknown,
): error is SupabaseErrorLike => {
  if (!error || typeof error !== "object") return false;

  const { code, message } = error as SupabaseErrorLike;
  const normalizedMessage = (message || "").toLowerCase();

  return (
    normalizedMessage.includes("currency_code") &&
    (code === "42703" ||
      code === "PGRST204" ||
      normalizedMessage.includes("schema cache") ||
      normalizedMessage.includes("column"))
  );
};

export const omitCurrencyCode = <T extends Record<string, unknown>>(
  payload: T,
) => {
  const { currency_code: _currencyCode, ...rest } = payload;
  return rest;
};
