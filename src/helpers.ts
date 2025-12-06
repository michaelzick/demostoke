
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

// Function to get singular activity name for category (e.g., "Snowboarding" not "Snowboards")
export const getCategoryActivityName = (category: string) => {
  switch (category) {
    case "snowboards":
      return "Snowboarding";
    case "skis":
      return "Skiing";
    case "surfboards":
      return "Surfing";
    case "mountain-bikes":
      return "Mountain Biking";
    default: {
      // Try to convert plural to activity form
      const singular = category.endsWith('s') ? category.slice(0, -1) : category;
      return singular.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + 'ing';
    }
  }
};
