import { slugify } from "@/utils/slugify";

interface GearUrlInput {
  id: string;
  name: string;
  size?: string | null;
}

const UUID_SUFFIX_REGEX =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const normalizeToken = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const hasSizeInName = (name: string, size: string): boolean => {
  const normalizedName = normalizeToken(name);
  const normalizedSize = normalizeToken(size);
  return normalizedSize.length > 0 && normalizedName.includes(normalizedSize);
};

export const buildGearDisplayName = (
  name: string,
  size?: string | null,
): string => {
  const trimmedName = name.trim();
  const trimmedSize = size?.trim();

  if (!trimmedSize || hasSizeInName(trimmedName, trimmedSize)) {
    return trimmedName;
  }

  return `${trimmedName} ${trimmedSize}`;
};

export const buildGearSlug = ({ id, name, size }: GearUrlInput): string => {
  const displayName = buildGearDisplayName(name, size);
  return `${slugify(displayName)}--${id}`;
};

export const buildGearPath = (input: GearUrlInput): string =>
  `/gear/${buildGearSlug(input)}`;

export const buildGearCanonicalUrl = (
  input: GearUrlInput,
  baseUrl = "https://www.demostoke.com",
): string => `${baseUrl}${buildGearPath(input)}`;

export const extractGearIdFromSlug = (slug: string): string | null => {
  if (!slug) {
    return null;
  }

  const delimiterIndex = slug.lastIndexOf("--");
  if (delimiterIndex > -1) {
    const idPart = slug.slice(delimiterIndex + 2).trim();
    return idPart || null;
  }

  const uuidMatch = slug.match(UUID_SUFFIX_REGEX);
  if (uuidMatch?.[1]) {
    return uuidMatch[1];
  }

  const lastDashIndex = slug.lastIndexOf("-");
  if (lastDashIndex === -1) {
    return null;
  }

  const fallbackId = slug.slice(lastDashIndex + 1).trim();
  return fallbackId || null;
};

export const toISODate = (dateInput?: string | Date | null): string => {
  const date =
    dateInput instanceof Date
      ? dateInput
      : dateInput
        ? new Date(dateInput)
        : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};
