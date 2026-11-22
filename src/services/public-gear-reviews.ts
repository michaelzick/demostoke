import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { toISODate } from "@/utils/gearUrl";

export interface PublicGearReview {
  authorName: string;
  createdAt: string;
  rating: number;
  reviewText: string | null;
}

export async function loadPublicGearReviews(client: SupabaseClient<Database>, equipmentId: string): Promise<PublicGearReview[]> {
  const { data: reviewRows, error: reviewError } = await client
    .from('equipment_reviews')
    .select('id, rating, review_text, reviewer_id, created_at')
    .eq('equipment_id', equipmentId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (reviewError || !reviewRows?.length) {
    if (reviewError) {
      console.error('Error fetching public gear reviews for SEO', reviewError);
    }
    return [];
  }

  const reviewerIds = [...new Set(reviewRows.map((r) => r.reviewer_id).filter(Boolean))];
  if (!reviewerIds.length) {
    return [];
  }

  const { data: profiles, error: profileError } = await client
    .from('public_profiles')
    .select('id, name')
    .in('id', reviewerIds);

  if (profileError) {
    console.error('Error fetching reviewer profiles for SEO', profileError);
    return [];
  }

  const reviewerNames = new Map(
    (profiles || [])
      .filter((p) => p.id && p.name)
      .map((p) => [p.id, p.name]),
  );

  return reviewRows
    .map((review) => {
      const authorName = reviewerNames.get(review.reviewer_id);
      if (!authorName) {
        return null;
      }
      return {
        authorName,
        createdAt: toISODate(review.created_at),
        rating: Number(review.rating),
        reviewText: review.review_text,
      };
    })
    .filter((r): r is PublicGearReview => r !== null);
}
