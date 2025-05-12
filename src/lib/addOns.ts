
import { Equipment } from "@/types";

export type AddOn = {
  name: string;
  imageUrl: string;
  price: number;
  icon: string; // Lucide icon name
};

export const getAddOnsForCategory = (category: string): AddOn[] => {
  switch (category) {
    case "surfboards":
      return [
        {
          name: "Surfboard Leash",
          imageUrl: "https://images.unsplash.com/photo-1610955603079-124df9495d63?auto=format&fit=crop&w=400&q=80",
          price: 29.99,
          icon: "leash"
        },
        {
          name: "Traction Pad",
          imageUrl: "https://images.unsplash.com/photo-1549488497-94b52bddac5d?auto=format&fit=crop&w=400&q=80",
          price: 39.99,
          icon: "traction-pad"
        },
        {
          name: "Fin Set",
          imageUrl: "https://images.unsplash.com/photo-1530345586958-801a080dbc11?auto=format&fit=crop&w=400&q=80",
          price: 59.99,
          icon: "fin"
        }
      ];
    case "snowboards":
      return [
        {
          name: "Snowboard Boots",
          imageUrl: "https://images.unsplash.com/photo-1608234975211-39197a77c798?auto=format&fit=crop&w=400&q=80",
          price: 199.99,
          icon: "snowboard"
        },
        {
          name: "Snowboard Bindings",
          imageUrl: "https://images.unsplash.com/photo-1611114721482-db51427985d9?auto=format&fit=crop&w=400&q=80",
          price: 149.99,
          icon: "snowboard"
        }
      ];
    case "skis":
      return [
        {
          name: "Ski Boots",
          imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=400&q=80",
          price: 249.99,
          icon: "ski-boot"
        },
        {
          name: "Ski Poles",
          imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80",
          price: 79.99,
          icon: "pole"
        },
        {
          name: "Ski Gloves",
          imageUrl: "https://images.unsplash.com/photo-1613763083762-8d5b24cc9531?auto=format&fit=crop&w=400&q=80",
          price: 59.99,
          icon: "glove"
        }
      ];
    case "sups":
      return [
        {
          name: "SUP Paddle",
          imageUrl: "https://images.unsplash.com/photo-1626784215021-2e56bc892b0f?auto=format&fit=crop&w=400&q=80",
          price: 129.99,
          icon: "paddle"
        },
        {
          name: "SUP Leash",
          imageUrl: "https://images.unsplash.com/photo-1610955603079-124df9495d63?auto=format&fit=crop&w=400&q=80",
          price: 34.99,
          icon: "leash"
        }
      ];
    case "skateboards":
      return [
        {
          name: "Skateboard Trucks",
          imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=400&q=80",
          price: 49.99,
          icon: "truck"
        },
        {
          name: "Skateboard Wheels",
          imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=400&q=80",
          price: 34.99,
          icon: "wheel"
        }
      ];
    default:
      return [];
  }
};

// Calculate total price of equipment and selected add-ons
export const calculateTotalPrice = (equipmentPrice: number, selectedAddOns: AddOn[]): number => {
  const addOnsTotal = selectedAddOns.reduce((total, addOn) => total + addOn.price, 0);
  return equipmentPrice + addOnsTotal;
};
