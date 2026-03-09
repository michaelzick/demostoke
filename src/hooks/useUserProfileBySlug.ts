import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { slugify, unslugify } from "@/utils/slugify";
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

type PublicProfileRow = Database["public"]["Views"]["public_profiles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ShopGearFeedMappingRow =
  Database["public"]["Tables"]["shop_gear_feed_mappings"]["Row"];
type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];
type ProfileLookupResult = {
  profile: UserProfile | null;
  isHidden: boolean;
};

const humanizeShopSlug = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/-[a-z0-9]{8,}$/i, "");

  return normalized
    .split("-")
    .filter(Boolean)
    .map((segment) =>
      segment.length <= 3
        ? segment.toUpperCase()
        : `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`,
    )
    .join(" ");
};

const normalizeProfileRow = (
  row: PublicProfileRow | ProfileRow,
  {
    isHidden,
    fallbackName,
    fallbackTimestamp,
  }: {
    isHidden: boolean;
    fallbackName: string;
    fallbackTimestamp: string;
  },
): UserProfile | null => {
  if (!row.id) {
    return null;
  }

  return {
    id: row.id,
    name: row.name?.trim() || fallbackName,
    avatar_url: row.avatar_url,
    about: row.about,
    phone: row.phone,
    address: row.address,
    location_lat: row.location_lat,
    location_lng: row.location_lng,
    member_since: row.member_since || row.created_at || fallbackTimestamp,
    created_at: row.created_at || row.member_since || fallbackTimestamp,
    website: row.website,
    displayRole: null,
    hero_image_url: row.hero_image_url,
    show_phone: row.show_phone,
    show_address: row.show_address,
    show_website: row.show_website,
    show_location: row.show_location,
    privacy_acknowledgment: row.privacy_acknowledgment,
    is_hidden: isHidden,
  };
};

const buildShopAliasProfile = (
  profileId: string,
  aliasSlug: string,
  fallbackTimestamp: string,
): UserProfile => ({
  id: profileId,
  name: humanizeShopSlug(aliasSlug) || "Shop",
  avatar_url: null,
  about: null,
  phone: null,
  address: null,
  location_lat: null,
  location_lng: null,
  member_since: fallbackTimestamp,
  created_at: fallbackTimestamp,
  website: null,
  displayRole: "retail-store",
  hero_image_url: null,
  show_phone: false,
  show_address: false,
  show_website: false,
  show_location: false,
  privacy_acknowledgment: false,
  is_hidden: false,
});

export const useUserProfileBySlug = (slug: string) => {
  const { isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["userProfile", slug, isAdmin],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!slug) {
        throw new Error("Slug is required");
      }

      const name = unslugify(slug);
      const pattern = `%${name.split(/\s+/).join("%")}%`;
      const fallbackTimestamp = new Date().toISOString();
      const fallbackName = humanizeShopSlug(slug) || "Shop";

      const fetchProfileById = async (profileId: string): Promise<ProfileLookupResult> => {
        const { data: publicProfile, error: publicProfileError } = await supabase
          .from("public_profiles")
          .select("*")
          .eq("id", profileId)
          .maybeSingle();

        if (publicProfileError) {
          console.error("Error fetching user profile by id:", publicProfileError);
        }

        const normalizedPublicProfile = publicProfile
          ? normalizeProfileRow(publicProfile, {
              isHidden: false,
              fallbackName,
              fallbackTimestamp,
            })
          : null;

        if (normalizedPublicProfile) {
          return { profile: normalizedPublicProfile, isHidden: false };
        }

        if (!isAdmin) {
          return { profile: null, isHidden: false };
        }

        const { data: hiddenProfile, error: hiddenProfileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .maybeSingle();

        if (hiddenProfileError) {
          console.error("Error fetching hidden user profile by id:", hiddenProfileError);
          return { profile: null, isHidden: false };
        }

        const normalizedHiddenProfile = hiddenProfile
          ? normalizeProfileRow(hiddenProfile, {
              isHidden: hiddenProfile.is_hidden,
              fallbackName,
              fallbackTimestamp,
            })
          : null;

        return {
          profile: normalizedHiddenProfile,
          isHidden: hiddenProfile?.is_hidden === true,
        };
      };

      const loadShopMapping = async (
        shopSlug: string,
      ): Promise<Pick<ShopGearFeedMappingRow, "profile_id" | "shop_slug"> | null> => {
        const exactMatchQuery = supabase
          .from("shop_gear_feed_mappings")
          .select("profile_id, shop_slug")
          .eq("provider", "demostoke_widget")
          .eq("is_active", true)
          .eq("shop_slug", shopSlug)
          .limit(1)
          .maybeSingle();

        const { data: exactMapping, error: exactMappingError } = await exactMatchQuery;

        if (exactMappingError) {
          console.error("Error fetching user profile by shop slug:", exactMappingError);
          return null;
        }

        if (exactMapping) {
          return exactMapping;
        }

        const prefixMatchQuery = supabase
          .from("shop_gear_feed_mappings")
          .select("profile_id, shop_slug")
          .eq("provider", "demostoke_widget")
          .eq("is_active", true)
          .like("shop_slug", `${shopSlug}-%`)
          .limit(1)
          .maybeSingle();

        const { data: prefixMapping, error: prefixMappingError } = await prefixMatchQuery;

        if (prefixMappingError) {
          console.error("Error fetching user profile by shop slug alias:", prefixMappingError);
          return null;
        }

        return prefixMapping;
      };

      const fetchProfileFromShopSlug = async (
        shopSlug: string,
      ): Promise<ProfileLookupResult> => {
        const mapping = await loadShopMapping(shopSlug);

        if (!mapping?.profile_id) {
          return { profile: null, isHidden: false };
        }

        const profileById = await fetchProfileById(mapping.profile_id);
        if (profileById.profile) {
          return profileById;
        }

        return {
          profile: buildShopAliasProfile(
            mapping.profile_id,
            mapping.shop_slug || shopSlug,
            fallbackTimestamp,
          ),
          isHidden: false,
        };
      };

      const { data: publicProfileMatches, error: publicProfilesError } = await supabase
        .from("public_profiles")
        .select("*")
        .ilike("name", pattern)
        .limit(10);

      if (publicProfilesError) {
        console.error("Error fetching user profile by slug:", publicProfilesError);
        throw publicProfilesError;
      }

      const exactPublicProfileMatch =
        publicProfileMatches?.find(
          (profile) => slugify(profile.name || "") === slug,
        ) || null;

      let profile =
        exactPublicProfileMatch &&
        normalizeProfileRow(exactPublicProfileMatch, {
          isHidden: false,
          fallbackName,
          fallbackTimestamp,
        });
      let isHidden = false;

      if (!profile) {
        const mappedProfile = await fetchProfileFromShopSlug(slug);
        profile = mappedProfile.profile;
        isHidden = mappedProfile.isHidden;
      }

      if (!profile) {
        profile =
          publicProfileMatches
            ?.map((row) =>
              normalizeProfileRow(row, {
                isHidden: false,
                fallbackName,
                fallbackTimestamp,
              }),
            )
            .find((row): row is UserProfile => row !== null) || null;
      }

      if (!profile) {
        const { data: syncedEquipment, error: syncedEquipmentError } = await supabase
          .from("equipment")
          .select("user_id")
          .eq("external_source_provider", "demostoke_widget")
          .eq("external_source_shop_slug", slug)
          .limit(1)
          .maybeSingle();

        if (syncedEquipmentError) {
          console.error("Error fetching synced equipment profile:", syncedEquipmentError);
        }

        if (syncedEquipment?.user_id) {
          const profileByEquipment = await fetchProfileById(syncedEquipment.user_id);
          profile = profileByEquipment.profile;
          isHidden = profileByEquipment.isHidden;
        }
      }

      if (!profile && isAdmin) {
        const { data: fullProfileMatches, error: fullProfilesError } = await supabase
          .from("profiles")
          .select("*")
          .ilike("name", pattern)
          .limit(10);

        if (fullProfilesError) {
          console.error("Error fetching hidden profile:", fullProfilesError);
        } else {
          const fullProfileMatch =
            fullProfileMatches?.find(
              (row) => slugify(row.name || "") === slug,
            ) ||
            fullProfileMatches?.[0] ||
            null;

          if (fullProfileMatch) {
            profile = normalizeProfileRow(fullProfileMatch, {
              isHidden: fullProfileMatch.is_hidden,
              fallbackName,
              fallbackTimestamp,
            });
            isHidden = fullProfileMatch.is_hidden;
          }
        }
      }

      if (!profile) {
        return null;
      }

      let displayRole: string | null = null;

      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("display_role")
        .eq("user_id", profile.id)
        .maybeSingle();

      const typedRoleRow = roleRow as Pick<UserRoleRow, "display_role"> | null;

      if (roleError || !typedRoleRow) {
        try {
          const { data: fnData, error: fnError } = await supabase.functions.invoke(
            "get-user-display-role",
            { body: { user_id: profile.id } },
          );

          if (!fnError && fnData && typeof fnData === "object" && "display_role" in fnData) {
            displayRole =
              typeof fnData.display_role === "string" ? fnData.display_role : null;
          }
        } catch (error) {
          console.error("Edge function display role fetch failed:", error);
        }
      } else {
        displayRole = typedRoleRow.display_role;
      }

      return {
        ...profile,
        displayRole: displayRole || profile.displayRole || "retail-store",
        is_hidden: isHidden,
      };
    },
    enabled: !!slug,
  });
};
