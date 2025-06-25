
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StarIcon } from "lucide-react";

interface UserEquipmentGridProps {
  userEquipment: any[] | undefined;
  stats?: {
    averageRating: number;
    totalReviews: number;
  } | null;
  isLoading?: boolean;
  isMockUser?: boolean;
}

export const UserEquipmentGrid = ({ userEquipment, stats, isLoading, isMockUser }: UserEquipmentGridProps) => {
  // Parse comma-separated sizes and return the first one for display
  const getDisplaySize = (sizeString: string) => {
    if (!sizeString) return '';
    const sizes = sizeString.split(',').map(size => size.trim()).filter(Boolean);
    return sizes.length > 1 ? `${sizes[0]} (+${sizes.length - 1} more)` : sizes[0] || '';
  };

  if (isLoading && !isMockUser) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!userEquipment || userEquipment.length === 0) {
    return (
      <p className="text-muted-foreground dark:text-white">No gear currently listed.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {userEquipment.map((item: any) => {
        const displaySize = getDisplaySize(item.specifications?.size || item.size || '');
        
        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img
                src={item.image_url || item.imageUrl || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80"}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium dark:text-white">{item.name}</h3>
                <span className="font-medium text-primary">${item.price_per_day || item.pricePerDay}/day</span>
              </div>
              
              {displaySize && (
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs">
                    {displaySize}
                  </Badge>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                {stats && stats.totalReviews > 0 ? (
                  <div className="flex items-center text-xs">
                    <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>{stats.averageRating} ({stats.totalReviews})</span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No reviews yet</div>
                )}
                <Button variant="outline" size="sm" asChild className="text-xs h-8">
                  <Link to={`/equipment/${item.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
