
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserEquipment } from "@/types/equipment";
import { useAuth } from "@/helpers";

export const useEquipmentById = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async (): Promise<UserEquipment | null> => {
      if (!user?.id || !id) {
        return null;
      }

      // Fetch equipment with owner profile information
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          profiles!equipment_user_id_fkey (
            id,
            name,
            avatar_url,
            role
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      // Transform the flat DB structure into nested UserEquipment structure
      const isAvailable = data.status === 'available';
      return {
        ...data,
        status: data.status as 'available' | 'booked' | 'unavailable',
        location: {
          lat: typeof data.location_lat === 'number' ? data.location_lat : 34.0522, // Default to LA
          lng: typeof data.location_lng === 'number' ? data.location_lng : -118.2437,
          zip: data.location_zip || ''
        },
        specifications: {
          size: data.size || '',
          weight: data.weight || '',
          material: data.material || '',
          suitable: data.suitable_skill_level || ''
        },
        availability: {
          available: isAvailable
        },
        owner: {
          id: data.profiles?.id || data.user_id,
          name: data.profiles?.name || 'Equipment Owner',
          imageUrl: data.profiles?.avatar_url || `https://api.dicebear.com/6.x/avataaars/svg?seed=${data.user_id}`,
          rating: 4.9, // Default rating for now
          responseRate: 98, // Default response rate for now
          memberSince: String(new Date().getFullYear() - Math.floor(Math.random() * 3 + 1))
        }
      } as UserEquipment;
    },
    enabled: !!user?.id && !!id,
  });
};
