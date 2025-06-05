export interface PricingOption {
  id: string;
  price: string;
  duration: string;
}

export interface DuplicatedGear {
  gearName: string;
  gearType: string;
  description: string;
  zipCode: string;
  measurementUnit: string;
  dimensions: {
    length: string;
    width: string;
  };
  skillLevel: string;
  price: string;
  damageDeposit: string;
  imageUrl?: string; // Add optional image URL
}

export interface FormState {
  gearName: string;
  setGearName: (value: string) => void;
  gearType: string;
  setGearType: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
  measurementUnit: string;
  setMeasurementUnit: (value: string) => void;
  dimensions: { length: string; width: string };
  setDimensions: (value: { length: string; width: string }) => void;
  skillLevel: string;
  setSkillLevel: (value: string) => void;
  images: File[];
  setImages: (value: File[]) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  useImageUrl: boolean;
  setUseImageUrl: (value: boolean) => void;
  pricingOptions: PricingOption[];
  setPricingOptions: (value: PricingOption[]) => void;
  damageDeposit: string;
  setDamageDeposit: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
}
