
export const mapGearTypeToCategory = (gearType: string): string => {
  const typeMap: { [key: string]: string } = {
    "snowboard": "snowboards",
    "skis": "skis",
    "surfboard": "surfboards",
    "mountain-bike": "mountain-bikes",
    "e-bike": "e-bikes",
    "skateboard": "skateboards"
  };
  return typeMap[gearType] || gearType;
};
