
import { Equipment } from "@/types";

export type AddOn = {
  name: string;
  imageUrl: string;
  pricePerDay: number;
};

export const getAddOnsForCategory = (category: string): AddOn[] => {
  switch (category) {
    case "surfboards":
      return [
        {
          name: "Surfboard Leash",
          imageUrl: "https://images.unsplash.com/photo-1610955603079-124df9495d63?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 5.99
        },
        {
          name: "Traction Pad",
          imageUrl: "https://images.unsplash.com/photo-1549488497-94b52bddac5d?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 6.99
        },
        {
          name: "Fin Set",
          imageUrl: "https://images.unsplash.com/photo-1530345586958-801a080dbc11?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 8.99
        }
      ];
    case "snowboards":
      return [
        {
          name: "Snowboard Boots",
          imageUrl: "https://images.unsplash.com/photo-1711066443997-25e0ae3feb33?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 12.99
        },
        {
          name: "Snowboard Bindings",
          imageUrl: "https://images.pexels.com/photos/20146487/pexels-photo-20146487/free-photo-of-legs-in-in-ski-wear-and-snowboard-on-snow.jpeg",
          pricePerDay: 10.99
        }
      ];
    case "skis":
      return [
        {
          name: "Ski Boots",
          imageUrl: "https://images.unsplash.com/photo-1610989178999-1d9fbb57c1a1?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 14.99
        },
        {
          name: "Ski Poles",
          imageUrl: "https://images.unsplash.com/photo-1692022193291-239f6fedf4bb?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 7.99
        },
        {
          name: "Ski Gloves",
          imageUrl: "https://images.pexels.com/photos/7406675/pexels-photo-7406675.jpeg",
          pricePerDay: 6.99
        }
      ];
    case "sups":
      return [
        {
          name: "SUP Paddle",
          imageUrl: "https://images.unsplash.com/photo-1626784215021-2e56bc892b0f?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 9.99
        },
        {
          name: "SUP Leash",
          imageUrl: "https://images.unsplash.com/photo-1610955603079-124df9495d63?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 5.99
        }
      ];
    case "skateboards":
      return [
        {
          name: "Skateboard Trucks",
          imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 7.99
        },
        {
          name: "Skateboard Wheels",
          imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=400&q=80",
          pricePerDay: 6.99
        }
      ];
    default:
      return [];
  }
};

// Calculate total price of equipment and selected add-ons (per day)
export const calculateTotalPrice = (equipmentPrice: number, selectedAddOns: AddOn[]): number => {
  const addOnsTotal = selectedAddOns.reduce((total, addOn) => total + addOn.pricePerDay, 0);
  return equipmentPrice + addOnsTotal;
};
