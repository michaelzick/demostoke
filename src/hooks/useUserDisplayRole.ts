import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useUserDisplayRole = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['userDisplayRole', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('display_role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user display role:', error);
        return 'retail-store'; // Default to retail-store if error
      }

      return data?.display_role || 'retail-store';
    },
    enabled: !!user?.id && isAuthenticated,
  });
};