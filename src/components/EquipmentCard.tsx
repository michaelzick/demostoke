import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, StoreIcon, UsersIcon, EditIcon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getCategoryDisplayName } from "@/helpers";
import { Equipment } from "@/types";
import { useAuth } from "@/contexts/auth";
import DistanceDisplay from "./DistanceDisplay";

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  const { user } = useAuth();
  
  // Debug logging
  console.log(`Equipment ${equipment.name} subcategory:`, equipment.subcategory);

  // Determine if this is from a shop or private party based on owner
  const isShop = equipment.owner.shopId;
  const isPrivateParty = equipment.owner.partyId;

  // Check if the current user owns this equipment
  const isOwner = user && equipment.owner.id === user.id;

  const ownerLinkPath = isShop
    ? `/shop/${equipment.owner.shopId}`
    : `/user-profile/${equipment.owner.id}`;

  // Handle both single image_url and multiple images array - ensure we always have an array
  const images = equipment.images && equipment.images.length > 0
    ? equipment.images
    : equipment.image_url
      ? [equipment.image_url]
      : [];

  const hasMultipleImages = images.length > 1;
  const hasImages = images.length > 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative w-full overflow-hidden h-[290px]">
        {hasImages ? (
          hasMultipleImages ? (
            <Carousel className="w-full h-full" opts={{ loop: true }}>
              <CarouselContent>
                {images.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={imageUrl}
                      alt={`${equipment.name} - Image ${index + 1}`}
                      className="h-[290px] w-full object-cover"
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
              alt={equipment.name}
              className="h-[290px] w-full object-cover"
            />
          )
        ) : (
          <div className="h-[290px] w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}

        {/* Subcategory badge in upper left */}
        {equipment.subcategory && (
          <Badge
            className="absolute top-2 left-2 z-20 bg-white text-gray-900 border shadow-sm"
          >
            {equipment.subcategory}
          </Badge>
        )}

        <Badge
          className="absolute top-2 right-2 z-10"
          variant="secondary"
        >
          {getCategoryDisplayName(equipment.category)}
        </Badge>

        {isPrivateParty && (
          <Badge
            className="absolute top-12 left-2 bg-green-600 hover:bg-green-700 z-10"
            variant="default"
          >
            <UsersIcon className="h-3 w-3 mr-1" />
            Private
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-medium text-lg truncate">{equipment.name}</h3>
          <div className="flex items-center gap-1 text-sm">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{equipment.rating}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{equipment.description}</p>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium">${equipment.price_per_day}/day</p>
            <p className="text-xs text-muted-foreground">{equipment.location.zip}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DistanceDisplay equipment={equipment} showUnit={false} />
          </div>
        </div>
        {/* Owner info with link */}
        <div className="border-t pt-2">
          <Link
            to={ownerLinkPath}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            {isShop && <StoreIcon className="h-3 w-3" />}
            {isPrivateParty && <UsersIcon className="h-3 w-3" />}
            <span className="truncate">From {equipment.owner.name}</span>
          </Link>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button asChild size="sm">
          <Link to={`/equipment/${equipment.id}`}>View Details</Link>
        </Button>
        {isOwner && (
          <Button asChild size="sm" variant="outline">
            <Link to={`/edit-gear/${equipment.id}`}>
              <EditIcon className="h-4 w-4 mr-1" />
              Update
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
