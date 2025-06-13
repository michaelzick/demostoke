
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEquipmentReviews } from "@/hooks/useEquipmentReviews";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsTabProps {
  equipmentId: string;
  rating: number;
  reviewCount: number;
}

const ReviewItem = ({ review }: { review: any }) => {
  const { data: reviewerProfile } = useUserProfile(review.reviewer_id);

  return (
    <div className="border-b pb-4">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={reviewerProfile?.avatar_url || `https://api.dicebear.com/6.x/avataaars/svg?seed=review-${review.id}`} 
            alt="Reviewer avatar" 
          />
          <AvatarFallback>{reviewerProfile?.name?.charAt(0) || 'R'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{reviewerProfile?.name || 'Anonymous Reviewer'}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center mb-2">
        {Array(5).fill(0).map((_, j) => (
          <StarIcon
            key={j}
            className={`h-4 w-4 ${j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
          />
        ))}
      </div>
      {review.review_text && (
        <p className="text-sm">{review.review_text}</p>
      )}
    </div>
  );
};

const ReviewsTab = ({ equipmentId, rating, reviewCount }: ReviewsTabProps) => {
  const { data: reviews, isLoading, error } = useEquipmentReviews(equipmentId);

  const actualReviewCount = reviews?.length || 0;
  const actualRating = actualReviewCount > 0 
    ? reviews!.reduce((sum, review) => sum + review.rating, 0) / actualReviewCount 
    : rating;

  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <span className="text-lg font-medium">
          {actualReviewCount > 0 ? actualRating.toFixed(1) : rating}
        </span>
        <span className="text-muted-foreground">
          • {actualReviewCount} review{actualReviewCount !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-muted-foreground">Unable to load reviews.</p>
      ) : actualReviewCount === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Be the first to review this equipment!</p>
      ) : (
        <div className="space-y-4">
          {reviews!.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
