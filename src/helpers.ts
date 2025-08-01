
import { useContext } from "react";
import { AuthContext } from "@/contexts/auth/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Function to get display name for category
export const getCategoryDisplayName = (category: string) => {
  switch (category) {
    case "snowboards":
      return "Snowboards";
    case "skis":
      return "Skis";
    case "surfboards":
      return "Surfboards";
    case "mountain-bikes":
      return "Mountain Bikes";
    default:
      return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
};
