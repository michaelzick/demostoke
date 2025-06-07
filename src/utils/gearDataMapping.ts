
export const mapCategoryToGearType = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    "snowboards": "snowboard",
    "skis": "skis",
    "surfboards": "surfboard",
    "sups": "sup",
    "mountain-bikes": "mountain-bike"
  };
  return categoryMap[category] || category;
};

export const mapSkillLevel = (skillLevel: string, gearType: string): string => {
  // Define skill level mappings for each gear type
  const skillLevelMappings: { [key: string]: { [key: string]: string } } = {
    snowboard: {
      "Beginner": "Beginner",
      "Intermediate": "Intermediate", 
      "Advanced": "Advanced",
      "Park Rider": "Park Rider",
      "All Levels": "Beginner" // Default fallback
    },
    skis: {
      "Beginner": "Beginner",
      "Intermediate": "Intermediate",
      "Advanced": "Advanced", 
      "Park Rider": "Park Rider",
      "All Levels": "Beginner" // Default fallback
    },
    surfboard: {
      "Beginner": "Beginner",
      "Intermediate": "Intermediate",
      "Advanced": "Advanced",
      "All Levels": "All Levels"
    },
    sup: {
      "Flat Water": "Flat Water",
      "Surf": "Surf",
      "Racing": "Racing",
      "Yoga": "Yoga",
      "All Levels": "Flat Water" // Default fallback
    },
    "mountain-bike": {
      "Beginner": "Beginner",
      "Intermediate": "Intermediate",
      "Advanced": "Advanced",
      "Expert": "Expert",
      "All Levels": "Beginner" // Default fallback
    }
  };

  const gearSkillLevels = skillLevelMappings[gearType];
  if (!gearSkillLevels) {
    console.warn(`No skill level mapping found for gear type: ${gearType}`);
    return skillLevel;
  }

  // Return mapped skill level or original if no mapping exists
  return gearSkillLevels[skillLevel] || skillLevel;
};

export const parseSize = (sizeString: string): { length: string; width: string; thickness?: string } => {
  // For mountain bikes, the size is just a single value (Small, Medium, etc.)
  if (['Small', 'Medium', 'Large', 'XL', 'XXL'].includes(sizeString)) {
    return {
      length: sizeString,
      width: "",
      thickness: ""
    };
  }

  const parts = sizeString.split(' x ').map(part => part.trim());
  
  if (parts.length >= 3) {
    // Extract thickness (remove unit from the last part)
    const thicknessPart = parts[2].replace(/[a-zA-Z\s]+$/, '');
    return {
      length: parts[0] || "",
      width: parts[1] || "",
      thickness: thicknessPart || ""
    };
  } else if (parts.length === 2) {
    // Remove unit from width (last part)
    const widthPart = parts[1].replace(/[a-zA-Z\s]+$/, '');
    return {
      length: parts[0] || "",
      width: widthPart || "",
      thickness: ""
    };
  }
  
  return { length: "", width: "", thickness: "" };
};
