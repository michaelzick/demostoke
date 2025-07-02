
export interface PricingOption {
  id?: string;
  price: string;
  duration: string;
}

export interface DuplicatedGear {
  gearName: string;
  gearType: string;
  description: string;
  address: string; // Changed from zipCode to address
  measurementUnit: string;
  dimensions: {
    length: string;
    width: string;
    thickness?: string;
  };
  skillLevel: string;
  price: string;
  damageDeposit: string;
  imageUrl?: string;
}

// Create a specific FormData interface for validation
export interface FormData {
  gearName: string;
  gearType: string;
  description: string;
  address: string; // Changed from zipCode to address
  measurementUnit: string;
  size: string;
  skillLevel: string;
  damageDeposit: string;
  pricingOptions: PricingOption[];
  imageUrl: string;
  useImageUrl: boolean;
  role: string;
}

export interface FormState {
  gearName: string;
  setGearName: (value: string) => void;
  gearType: string;
  setGearType: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  address: string; // Changed from zipCode to address
  setAddress: (value: string) => void; // Changed from setZipCode to setAddress
  measurementUnit: string;
  setMeasurementUnit: (value: string) => void;
  size: string;
  setSize: (value: string) => void;
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
