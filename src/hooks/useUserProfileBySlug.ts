import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { unslugify } from "@/utils/slugify";

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
  website: string | null;
}

export const useUserProfileBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['userProfile', slug],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!slug) {
        throw new Error('Slug is required');
      }

      const name = unslugify(slug);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', name)
        .single();

      if (error) {
        console.error('Error fetching user profile by slug:', error);
        throw error;
      }

      return data;
    },
    enabled: !!slug,
  });
};
