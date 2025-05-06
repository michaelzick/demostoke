
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewsTabProps {
  rating: number;
  reviewCount: number;
}

const ReviewsTab = ({ rating, reviewCount }: ReviewsTabProps) => {
  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <span className="text-lg font-medium">{rating}</span>
        <span className="text-muted-foreground">• {reviewCount} reviews</span>
      </div>

      {/* Sample reviews */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=review-${i}`} alt="Avatar" />
                <AvatarFallback>RV</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Reviewer {i}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center mb-2">
              {Array(5).fill(0).map((_, j) => (
                <StarIcon
                  key={j}
                  className={`h-4 w-4 ${j < 5 - i * 0.5 ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                />
              ))}
            </div>
            <p className="text-sm">
              {i === 1 ?
                "Amazing equipment! Exactly as described and in excellent condition. The owner was friendly and provided some great local tips." :
                i === 2 ?
                  "Good experience overall. The equipment was well maintained and worked great. Would demo again!" :
                  "Decent experience. Equipment was a bit worn but functioned well. Owner was responsive and helpful."
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsTab;
