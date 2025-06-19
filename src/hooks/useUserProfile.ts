
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  about: string | null;
  phone: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  member_since: string;
  created_at: string;
}

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
};
