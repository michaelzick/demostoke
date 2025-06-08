
export const mapGearTypeToCategory = (gearType: string): string => {
  const typeMap: { [key: string]: string } = {
    "snowboard": "snowboards",
    "skis": "skis",
    "surfboard": "surfboards",
    "sup": "sups",
    "mountain-bike": "mountain-bikes"
  };
  return typeMap[gearType] || gearType;
};
