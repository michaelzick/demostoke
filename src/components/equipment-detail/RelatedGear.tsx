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
import { slugify } from "@/utils/slugify";

interface RelatedGearProps {
  relatedGear: Equipment[];
}

const RelatedGear = ({ relatedGear }: RelatedGearProps) => {
  // Hide the section if no related gear is found
  if (!relatedGear || relatedGear.length === 0) {
    return null;
  }

  return (
    <div className="pt-8">
      <h4 className="text-lg font-semibold mb-4">Related Gear</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedGear.map((item) => {
          // Use images array from equipment_images table
          const images = item.images || [];
          const hasMultipleImages = images.length > 1;
          const hasImages = images.length > 0;

          return (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex h-24">
                <div className="w-1/3 relative">
                  {hasImages ? (
                    hasMultipleImages ? (
                      <Carousel className="w-full h-full" opts={{ loop: true }}>
                        <CarouselContent>
                          {images.map((imageUrl, index) => (
                            <CarouselItem key={index}>
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
                    )
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-between">
                  <div>
                    <h5 className="font-medium text-sm mb-1 line-clamp-2">
                      {item.name}
                    </h5>
                    <div className="flex items-center text-xs mb-1">
                      <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      ${item.price_per_day}/day
                    </span>
                    <Button size="sm" asChild className="text-xs h-6">
                      <Link to={`/${item.category}/${slugify(item.name)}`}>View</Link>
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

export default RelatedGear;
