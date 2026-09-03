
export const mapGearTypeToCategory = (gearType: string): string => {
  const typeMap: { [key: string]: string } = {
    "surfboard": "surfboards",
    "snowboard": "snowboards",
    "skis": "skis",
    "mountain-bike": "mountain-bikes",
  };
  return typeMap[gearType] || gearType;
};
