import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarIcon, Car } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Equipment } from "@/types";
import { slugify } from "@/utils/slugify";
import DistanceDisplay from "@/components/DistanceDisplay";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface CompactEquipmentCardProps {
  equipment: Equipment;
}

const CompactEquipmentCard = ({ equipment }: CompactEquipmentCardProps) => {
  const images = equipment.images && equipment.images.length > 0 ? equipment.images : [];
  const hasMultipleImages = images.length > 1;
  const hasImages = images.length > 0;

  return (
    <Card className="overflow-hidden">
      <div className="h-48 overflow-hidden">
        {hasImages ? (
          hasMultipleImages ? (
            <Carousel className="w-full h-full" opts={{ loop: true }}>
              <CarouselContent>
                {images.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={imageUrl}
                      alt={`${equipment.name} - Image ${index + 1}`}
                      className="h-48 w-full object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          ) : (
            <img src={images[0]} alt={equipment.name} className="h-48 w-full object-cover" />
          )
        ) : (
          <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium dark:text-white line-clamp-2 min-h-[3rem]">
            {equipment.name}
          </h3>
          <span className="font-medium text-primary">${equipment.price_per_day}/day</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {equipment.description}
            </p>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            {equipment.description}
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Car className="h-3 w-3 mr-1" />
          <DistanceDisplay equipment={equipment} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-xs">
            <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
            <span>
              {equipment.rating} ({equipment.review_count})
            </span>
          </div>
          <Button size="sm" asChild className="text-xs h-8">
            <Link to={`/${equipment.category}/${slugify(equipment.name)}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactEquipmentCard;
