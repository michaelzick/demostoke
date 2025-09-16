// Brand aliases and common misspellings for better search matching

export interface BrandAlias {
  canonical: string;
  aliases: string[];
  category?: string;
}

export const brandAliases: BrandAlias[] = [
  // Surfboard brands
  {
    canonical: "Lost",
    aliases: ["lost surfboards", "matt mayhem", "mayhem"],
    category: "surfboards"
  },
  {
    canonical: "DHD",
    aliases: ["darcy hardman", "d.h.d", "dhd surfboards"],
    category: "surfboards"
  },
  {
    canonical: "Firewire",
    aliases: ["fire wire", "firewire surfboards"],
    category: "surfboards"
  },
  {
    canonical: "JS",
    aliases: ["jason stevenson", "j.s", "js surfboards"],
    category: "surfboards"
  },
  {
    canonical: "Sharp Eye",
    aliases: ["sharpeye", "sharp-eye", "marcelo"],
    category: "surfboards"
  },
  {
    canonical: "HaydenShapes",
    aliases: ["hayden shapes", "hayden", "shapes"],
    category: "surfboards"
  },
  {
    canonical: "Pyzel",
    aliases: ["john john florence", "jjf"],
    category: "surfboards"
  },
  {
    canonical: "Channel Islands",
    aliases: ["ci", "c.i", "al byrne", "channel island"],
    category: "surfboards"
  },

  // Snowboard brands
  {
    canonical: "Burton",
    aliases: ["burton snowboards", "jake burton"],
    category: "snowboards"
  },
  {
    canonical: "Lib Tech",
    aliases: ["libtech", "lib-tech", "lib technology"],
    category: "snowboards"
  },
  {
    canonical: "GNU",
    aliases: ["gnu snowboards", "g.n.u"],
    category: "snowboards"
  },
  {
    canonical: "Jones",
    aliases: ["jones snowboards", "jeremy jones"],
    category: "snowboards"
  },
  {
    canonical: "Capita",
    aliases: ["capita snowboards"],
    category: "snowboards"
  },
  {
    canonical: "Rome",
    aliases: ["rome snowboards", "rome sds"],
    category: "snowboards"
  },
  {
    canonical: "Never Summer",
    aliases: ["neversummer", "never-summer", "ns"],
    category: "snowboards"
  },

  // Ski brands
  {
    canonical: "Rossignol",
    aliases: ["rossignol skis", "rossi", "rossignal", "rossignol", "rosignol"],
    category: "skis"
  },
  {
    canonical: "Head",
    aliases: ["head skis"],
    category: "skis"
  },
  {
    canonical: "Salomon",
    aliases: ["salomon skis", "solomon", "salomin"],
    category: "skis"
  },
  {
    canonical: "K2",
    aliases: ["k2 skis", "k-2"],
    category: "skis"
  },
  {
    canonical: "Volkl",
    aliases: ["volkl skis", "völkl", "volkle"],
    category: "skis"
  },
  {
    canonical: "Atomic",
    aliases: ["atomic skis"],
    category: "skis"
  },
  {
    canonical: "Blizzard",
    aliases: ["blizzard skis"],
    category: "skis"
  },

  // Mountain bike brands
  {
    canonical: "Specialized",
    aliases: ["specialized bikes", "spesh"],
    category: "mountain-bikes"
  },
  {
    canonical: "Trek",
    aliases: ["trek bikes"],
    category: "mountain-bikes"
  },
  {
    canonical: "Giant",
    aliases: ["giant bikes"],
    category: "mountain-bikes"
  },
  {
    canonical: "Cannondale",
    aliases: ["cannondale bikes", "cannon dale"],
    category: "mountain-bikes"
  },
  {
    canonical: "Santa Cruz",
    aliases: ["santa cruz bikes", "santacruz", "sc bikes"],
    category: "mountain-bikes"
  },
  {
    canonical: "Yeti",
    aliases: ["yeti cycles", "yeti bikes"],
    category: "mountain-bikes"
  }
];

// Find canonical brand name from search term
export const findCanonicalBrand = (searchTerm: string, category?: string): string | null => {
  const search = searchTerm.toLowerCase().trim();
  
  for (const brand of brandAliases) {
    // Filter by category if specified
    if (category && brand.category && brand.category !== category) {
      continue;
    }
    
    // Check canonical name
    if (brand.canonical.toLowerCase() === search) {
      return brand.canonical;
    }
    
    // Check aliases
    for (const alias of brand.aliases) {
      if (alias.toLowerCase() === search || search.includes(alias.toLowerCase())) {
        return brand.canonical;
      }
    }
  }
  
  return null;
};

// Get all possible brand variations for a canonical brand
export const getBrandVariations = (canonicalBrand: string): string[] => {
  const brand = brandAliases.find(b => b.canonical === canonicalBrand);
  if (!brand) return [canonicalBrand];
  
  return [brand.canonical, ...brand.aliases];
};

// Check if search term contains any brand reference
export const extractBrandFromQuery = (query: string, category?: string): string | null => {
  const queryLower = query.toLowerCase();
  
  for (const brand of brandAliases) {
    // Filter by category if specified
    if (category && brand.category && brand.category !== category) {
      continue;
    }
    
    // Check if canonical brand name appears in query
    if (queryLower.includes(brand.canonical.toLowerCase())) {
      return brand.canonical;
    }
    
    // Check aliases
    for (const alias of brand.aliases) {
      if (queryLower.includes(alias.toLowerCase())) {
        return brand.canonical;
      }
    }
  }
  
  return null;
};