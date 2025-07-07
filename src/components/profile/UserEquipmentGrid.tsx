
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StarIcon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import type { UserEquipment } from "@/types/equipment";

interface UserEquipmentGridProps {
  userEquipment: UserEquipment[] | undefined;
  stats?: {
    averageRating: number;
    totalReviews: number;
  } | null;
  isLoading?: boolean;
  isMockUser?: boolean;
}

export const UserEquipmentGrid = ({ userEquipment, stats, isLoading, isMockUser }: UserEquipmentGridProps) => {
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
      {userEquipment.map((item: UserEquipment) => {
        // Handle both single image_url and multiple images array - ensure we always have an array
        const images = item.images && item.images.length > 0
          ? item.images
          : item.image_url || item.imageUrl
            ? [item.image_url || item.imageUrl]
            : [];

        const hasMultipleImages = images.length > 1;
        const hasImages = images.length > 0;

        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="h-48 overflow-hidden">
              {hasImages ? (
                hasMultipleImages ? (
                  <Carousel className="w-full h-full" opts={{ loop: true }}>
                    <CarouselContent>
                      {images.map((imageUrl: string, index: number) => (
                        <CarouselItem key={index}>
                          <img
                            src={imageUrl}
                            alt={`${item.name} - Image ${index + 1}`}
                            className="h-48 w-full object-cover"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                ) : (
                  <img
                    src={images[0]}
                    alt={item.name}
                    className="h-48 w-full object-cover"
                  />
                )
              ) : (
                <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium dark:text-white">{item.name}</h3>
                <span className="font-medium text-primary">${item.price_per_day || item.pricePerDay}/day</span>
              </div>
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
                <Button size="sm" asChild className="text-xs h-8">
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
