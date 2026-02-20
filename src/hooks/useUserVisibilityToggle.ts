import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VISIBILITY_INVALIDATION_KEYS = [
  ["userProfile"],
  ["userLocations"],
  ["featuredEquipment"],
  ["recentEquipment"],
  ["trendingEquipment"],
  ["equipment"],
] as const;

export const useUserVisibilityToggle = () => {
  const queryClient = useQueryClient();

  const toggleUserVisibility = async (
    profileId: string,
    currentlyHidden: boolean,
  ): Promise<boolean> => {
    const newValue = !currentlyHidden;

    const { error } = await supabase
      .from("profiles")
      .update({ is_hidden: newValue })
      .eq("id", profileId);

    if (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update user visibility");
      throw error;
    }

    toast.success(newValue ? "User hidden from site" : "User is now visible on site");

    await Promise.all(
      VISIBILITY_INVALIDATION_KEYS.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );

    return newValue;
  };

  return { toggleUserVisibility };
};
