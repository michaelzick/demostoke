import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { unslugify } from "@/utils/slugify";

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  about: string | null;
  phone: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  member_since: string;
  created_at: string;
  website: string | null;
  displayRole: string | null;
}

export const useUserProfileBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['userProfile', slug],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!slug) {
        throw new Error('Slug is required');
      }

      const name = unslugify(slug);
      const pattern = `%${name.split(/\s+/).join('%')}%`;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', pattern)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile by slug:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      let displayRole: string | null = null;

      const { data: roleRow, error: roleError } = await supabase
        .from('user_roles')
        .select('display_role')
        .eq('user_id', data.id)
        .single();

      if (roleError || !roleRow) {
        try {
          const res = await fetch(
            `https://qtlhqsqanbxgfbcjigrl.supabase.co/functions/v1/get-user-display-role?user_id=${data.id}`
          );
          if (res.ok) {
            const json = await res.json();
            displayRole = json.display_role;
          }
        } catch (e) {
          console.error('Edge function display role fetch failed:', e);
        }
      } else {
        displayRole = roleRow.display_role;
      }

      return {
        ...data,
        display_role: undefined,
        displayRole: displayRole || 'retail-store'
      } as UserProfile & { displayRole: string };
    },
    enabled: !!slug,
  });
};
