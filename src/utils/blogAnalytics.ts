import { BlogPost } from "@/lib/blog/types";
import { Equipment } from "@/types";
import { trackEvent } from "@/utils/tracking";

type GeneratedReviewPostMode = "published" | "draft_preview";

export const buildGeneratedReviewAnalyticsProperties = (
  post: BlogPost,
  mode: GeneratedReviewPostMode,
) => ({
  post_id: post.databaseId || post.id,
  post_slug: post.id,
  category: post.category,
  equipment_id: post.sourceEquipmentId,
  gear_category: post.sourceGearCategory,
  author: post.author,
  generated: true,
  post_mode: mode,
});

export const trackGeneratedGearReviewView = (
  post: BlogPost,
  mode: GeneratedReviewPostMode,
) => {
  trackEvent("generated_gear_review_view", buildGeneratedReviewAnalyticsProperties(post, mode));
};

export const trackGeneratedGearReviewRelatedGearClick = (
  post: BlogPost,
  mode: GeneratedReviewPostMode,
  relatedGear: Equipment,
) => {
  trackEvent("generated_gear_review_related_gear_click", {
    ...buildGeneratedReviewAnalyticsProperties(post, mode),
    related_equipment_id: relatedGear.id,
    related_equipment_name: relatedGear.name,
    related_gear_category: relatedGear.category,
  });
};
