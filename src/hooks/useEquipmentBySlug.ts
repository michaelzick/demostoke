import { useQuery } from "@tanstack/react-query";
import { Equipment } from "@/types";
import { getEquipmentData } from "@/services/equipment/equipmentDataService";
import { slugify, unslugify } from "@/utils/slugify";
import { supabase } from "@/integrations/supabase/client";
import { fetchEquipmentImages } from "@/utils/multipleImageHandling";
import { deduplicateImageUrls } from "@/utils/imageDeduplication";
import { useAuth } from "@/contexts/auth";
import { useIsAdmin } from "@/hooks/useUserRole";

export const useEquipmentBySlug = (
  category: string,
  slug: string,
  ownerSlug?: string,
) => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["equipment", category, slug, ownerSlug, user?.id, isAdmin],
    queryFn: async (): Promise<Equipment | null> => {
      if (!category || !slug) {
        throw new Error("Category and slug are required");
      }

      // First check the public equipment data
      const data = await getEquipmentData();
      const publicItem = data.find(
        (e) =>
          e.category === category &&
          slugify(e.name) === slug &&
          (!ownerSlug || slugify(e.owner?.name || "") === ownerSlug),
      );
      if (publicItem) {
        return publicItem;
      }

      // If not found, try fetching directly from Supabase
      const name = unslugify(slug);
      const pattern = `%${name.split(/\s+/).join('%')}%`;

      const { data: rows, error } = await supabase
        .from('equipment')
        .select(
          `
          *,
          profiles!equipment_user_id_fkey (
            name,
            avatar_url
          )
        `,
        )
        .eq('category', category)
        .ilike('name', pattern);

      const row = (rows || []).find((r) =>
        ownerSlug ? slugify(r.profiles?.name || '') === ownerSlug : true,
      );

      if (error) {
        console.error('Error fetching equipment by slug:', error);
        throw error;
      }

      if (!row) {
        return null;
      }

      if (ownerSlug && slugify(row.profiles?.name || '') !== ownerSlug) {
        return null;
      }

      // If the equipment is not publicly visible, ensure the user owns it or is an admin
      if (row.user_id !== user?.id && !isAdmin) {
        return null;
      }

      const additionalImages = await fetchEquipmentImages(
        row.id,
        row.image_url || undefined,
      );
      const allImages = deduplicateImageUrls(additionalImages);

      const equipment: Equipment = {
        id: row.id,
        name: row.name,
        category: row.category,
        subcategory: row.subcategory || undefined,
        description: row.description || '',
        image_url: row.image_url || '',
        images: allImages,
        price_per_day: Number(row.price_per_day),
        price_per_hour:
          row.price_per_hour !== null && row.price_per_hour !== undefined
            ? Number(row.price_per_hour)
            : undefined,
        price_per_week:
          row.price_per_week !== null && row.price_per_week !== undefined
            ? Number(row.price_per_week)
            : undefined,
        rating: Number(row.rating || 0),
        review_count: row.review_count || 0,
        damage_deposit: row.damage_deposit ? Number(row.damage_deposit) : undefined,
        owner: {
          id: row.user_id,
          name: row.profiles?.name || 'Owner',
          imageUrl:
            row.profiles?.avatar_url ||
            'https://api.dicebear.com/6.x/avataaars/svg?seed=' + row.user_id,
          rating: 4.8,
          reviewCount: 15,
          responseRate: 95,
        },
        location: {
          lat: Number(row.location_lat || 0),
          lng: Number(row.location_lng || 0),
          address: row.location_address || '',
        },
        distance: 0,
        specifications: {
          size: row.size || '',
          weight: row.weight || '',
          material: row.material || '',
          suitable: row.suitable_skill_level || '',
        },
        availability: {
          available: row.status === 'available',
        },
        pricing_options: [],
        status: row.status || 'available',
        created_at: row.created_at,
        updated_at: row.updated_at,
        visible_on_map: row.visible_on_map !== undefined ? row.visible_on_map : true,
        user_id: row.user_id,
      };

      return equipment;
    },
  });
};
