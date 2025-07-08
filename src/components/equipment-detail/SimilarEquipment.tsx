import { Link } from "react-router-dom";
import { StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Equipment } from "@/types";

interface SimilarEquipmentProps {
  similarEquipment: Equipment[];
}

const SimilarEquipment = ({ similarEquipment }: SimilarEquipmentProps) => {
  // Hide the section if no similar equipment is found
  if (!similarEquipment || similarEquipment.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-medium mb-3">Similar Equipment</h3>
      <div className="space-y-4">
        {similarEquipment.map((item) => {
          // Use images array from equipment_images table
          const images = item.images || [];
          const hasMultipleImages = images.length > 1;

          return (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex h-24">
                <div className="w-1/3 relative">
                  {hasMultipleImages ? (
                    <Carousel className="w-full h-full" opts={{ loop: true }}>
                      <CarouselContent className="h-full">
                        {images.map((imageUrl, index) => (
                          <CarouselItem key={index} className="h-full">
                            <img
                              src={imageUrl}
                              alt={`${item.name} - Image ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-1 h-6 w-6" />
                      <CarouselNext className="right-1 h-6 w-6" />
                    </Carousel>
                  ) : (
                    <img
                      src={images[0]}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium text-sm mb-1 truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center text-xs">
                      <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      ${item.price_per_day}/day
                    </span>
                    <Button size="sm" asChild className="text-xs h-6">
                      <Link to={`/equipment/${item.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarEquipment;
