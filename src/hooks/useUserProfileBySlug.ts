import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { unslugify } from "@/utils/slugify";
import { useIsAdmin } from "@/hooks/useUserRole";

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
  hero_image_url?: string | null;
  show_phone?: boolean | null;
  show_address?: boolean | null;
  show_website?: boolean | null;
  show_location?: boolean | null;
  privacy_acknowledgment?: boolean | null;
  is_hidden?: boolean;
}

export const useUserProfileBySlug = (slug: string) => {
  const { isAdmin } = useIsAdmin();
  return useQuery({
    queryKey: ['userProfile', slug, isAdmin],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!slug) {
        throw new Error('Slug is required');
      }

      const name = unslugify(slug);
      const pattern = `%${name.split(/\s+/).join('%')}%`;

      // Try public_profiles first
      let { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .ilike('name', pattern)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile by slug:', error);
        throw error;
      }

      // If not found and viewer is admin, try the full profiles table (user may be hidden)
      let isHidden = false;
      if (!data && isAdmin) {
        const { data: fullProfile, error: fullError } = await (supabase as any)
          .from('profiles')
          .select('*')
          .ilike('name', pattern)
          .limit(1)
          .maybeSingle();

        if (fullError) {
          console.error('Error fetching hidden profile:', fullError);
        } else if (fullProfile) {
          data = fullProfile;
          isHidden = fullProfile.is_hidden === true;
        }
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
          const { data: fnData, error: fnError } = await supabase.functions.invoke(
            'get-user-display-role',
            { body: { user_id: data.id } }
          );
          if (!fnError && (fnData as any)?.display_role) {
            displayRole = (fnData as any).display_role as string;
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
        displayRole: displayRole || 'retail-store',
        is_hidden: isHidden,
      } as UserProfile & { displayRole: string; is_hidden: boolean };
    },
    enabled: !!slug,
  });
};
