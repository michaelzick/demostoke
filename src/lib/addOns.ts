import { Equipment } from "@/types";

export type AddOn = {
  name: string;
  imageUrl: string;
  price_per_day: number;
};

export const getAddOnsForCategory = (category: string): AddOn[] => {
  switch (category) {
    case "surfboards":
      return [
        {
          name: "Surfboard Leash",
          imageUrl: "https://images.evo.com/imgp/zoom/195813/777292/catch-surf-beater-8-leash-.jpg",
          price_per_day: 1.99
        },
        {
          name: "Fin Set",
          imageUrl: "https://images.unsplash.com/photo-1515061942942-2fb5aa4d63c9?auto=format&fit=crop&w=400&q=80",
          price_per_day: 5.99
        }
      ];
    case "snowboards":
      return [
        {
          name: "Snowboard Boots",
          imageUrl: "https://images.unsplash.com/photo-1711066443997-25e0ae3feb33?auto=format&fit=crop&w=400&q=80",
          price_per_day: 10.99
        },
        {
          name: "Snowboard Bindings",
          imageUrl: "https://images.pexels.com/photos/20146487/pexels-photo-20146487/free-photo-of-legs-in-in-ski-wear-and-snowboard-on-snow.jpeg",
          price_per_day: 5.99
        }
      ];
    case "skis":
      return [
        {
          name: "Ski Boots",
          imageUrl: "https://images.unsplash.com/photo-1610989178999-1d9fbb57c1a1?auto=format&fit=crop&w=400&q=80",
          price_per_day: 12.99
        },
        {
          name: "Ski Poles",
          imageUrl: "https://images.unsplash.com/photo-1692022193291-239f6fedf4bb?auto=format&fit=crop&w=400&q=80",
          price_per_day: 3.99
        },
        {
          name: "Ski Gloves",
          imageUrl: "https://www.truckgloves.com/cdn/shop/products/221014_M3-SHN_2000.jpg?v=1665783335&width=500",
          price_per_day: 1.99
        }
      ];
    case "skateboards":
      return [
        {
          name: "Skateboard Trucks",
          imageUrl: "https://images.unsplash.com/photo-1536318431364-5cc762cfc8ec?auto=format&fit=crop&w=400&q=80",
          price_per_day: 3.99
        },
        {
          name: "Skateboard Wheels",
          imageUrl: "https://images.unsplash.com/photo-1631367095408-7293f0a85d85?auto=format&fit=crop&w=400&q=80",
          price_per_day: 1.99
        }
      ];
    default:
      return [];
  }
};

// Calculate total price of equipment and selected add-ons (per day)
export const calculateTotalPrice = (equipmentPrice: number, selectedAddOns: AddOn[]): number => {
  const addOnsTotal = selectedAddOns.reduce((total, addOn) => total + addOn.price_per_day, 0);
  return equipmentPrice + addOnsTotal;
};
