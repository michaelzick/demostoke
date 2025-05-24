
// Parse size from specifications
export const parseSize = (sizeStr: string) => {
  if (sizeStr.includes("x")) {
    const [length, width] = sizeStr.split("x").map(s => s.trim().replace(/[^\d.]/g, ''));
    return { length, width };
  } else if (sizeStr.includes('"')) {
    return { length: sizeStr.replace(/[^0-9.]/g, ''), width: "" };
  } else if (sizeStr.includes('cm')) {
    return { length: sizeStr.replace(/[^0-9.]/g, ''), width: "" };
  }
  return { length: "", width: "" };
};

// Map category to gear type that matches skillLevels keys
export const mapCategoryToGearType = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    "snowboards": "snowboard",
    "skis": "skis",
    "surfboards": "surfboard",
    "sups": "sup",
    "skateboards": "skateboard"
  };
  return categoryMap[category.toLowerCase()] || category.slice(0, -1);
};

// Map skill level from database to dropdown options
export const mapSkillLevel = (dbSkillLevel: string, gearType: string) => {
  if (!dbSkillLevel || !gearType) return "";
  
  const skillLevels = {
    snowboard: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    skis: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    surfboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    sup: ["Flat Water", "Surf", "Racing", "Yoga"],
    skateboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
  };

  const validLevels = skillLevels[gearType as keyof typeof skillLevels] || [];
  
  // Try exact match first
  if (validLevels.includes(dbSkillLevel)) {
    return dbSkillLevel;
  }
  
  // Try case-insensitive match
  const matchedLevel = validLevels.find(level => 
    level.toLowerCase() === dbSkillLevel.toLowerCase()
  );
  
  return matchedLevel || "";
};
