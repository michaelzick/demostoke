import { Equipment } from "@/types";

export const matchesQuickGearQuery = (item: Equipment, query: string): boolean => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    item.name,
    item.description,
    item.category,
    item.owner?.name,
    item.location?.address,
  ];

  return searchableValues.some((value) =>
    (value ?? "").toLowerCase().includes(normalizedQuery)
  );
};

export const filterGearByQuickQuery = <T extends Equipment>(items: T[], query: string): T[] => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => matchesQuickGearQuery(item, normalizedQuery));
};
