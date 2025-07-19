import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, StoreIcon, UsersIcon, EditIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getCategoryDisplayName } from "@/helpers";
import { Equipment } from "@/types";
import { useAuth } from "@/contexts/auth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { slugify } from "@/utils/slugify";
import DistanceDisplay from "./DistanceDisplay";
import { Checkbox } from "@/components/ui/checkbox";
import { featuredGearService } from "@/services/featuredGearService";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface EquipmentCardProps {
  equipment: Equipment;
  showAdminControls?: boolean;
}

const EquipmentCard = ({ equipment, showAdminControls = false }: EquipmentCardProps) => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [isFeatured, setIsFeatured] = useState(equipment.is_featured || false);
  const [isUpdating, setIsUpdating] = useState(false);


  // Determine if this is from a shop or private party based on owner
  const isShop = equipment.owner.shopId;
  const isPrivateParty = equipment.owner.partyId;

  // Check if the current user owns this equipment
  const isOwner = user && equipment.owner.id === user.id;

  const ownerLinkPath = isShop
    ? `/shop/${equipment.owner.shopId}`
    : `/user-profile/${slugify(equipment.owner.name)}`;

  // Use images array from equipment_images table
  const images =
    equipment.images && equipment.images.length > 0 ? equipment.images : [];

  const hasMultipleImages = images.length > 1;
  const hasImages = images.length > 0;

  const handleFeatureToggle = async (checked: boolean) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const success = await featuredGearService.setFeaturedStatus(equipment.id, checked);
      if (success) {
        setIsFeatured(checked);
        toast({
          title: "Success",
          description: checked ? "Equipment featured successfully" : "Equipment unfeatured successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update featured status. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
          <Badge className="absolute top-2 left-2 z-20 bg-white text-gray-900 border shadow-sm">
            {equipment.subcategory}
          </Badge>
        )}

        <Badge className="absolute top-2 right-2 z-10" variant="secondary">
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
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {equipment.description}
            </p>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-[500px]">
            {equipment.description}
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium">
              ${equipment.price_per_day}/day
            </p>
            <p className="text-xs text-muted-foreground">
              {equipment.location.address}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DistanceDisplay equipment={equipment} showUnit={false} />
          </div>
        </div>
        {/* Owner info with link */}
        <div className="border-t pt-2">
          <Link
            to={ownerLinkPath}
            className="underline text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            {isShop && <StoreIcon className="h-3 w-3" />}
            {isPrivateParty && <UsersIcon className="h-3 w-3" />}
            <span className="truncate">{equipment.owner.name}</span>
          </Link>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button asChild size="sm">
          <Link
            to={`/${equipment.category}/${slugify(equipment.owner.name)}/${slugify(equipment.name)}`}
          >
            View Details
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button asChild size="sm" variant="outline">
              <Link to={`/edit-gear/${equipment.id}`}>
                <EditIcon className="h-4 w-4 mr-1" />
                Update
              </Link>
            </Button>
          )}
          {showAdminControls && isAdmin && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`featured-${equipment.id}`}
                checked={isFeatured}
                onCheckedChange={handleFeatureToggle}
                disabled={isUpdating}
              />
              <label 
                htmlFor={`featured-${equipment.id}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Featured
              </label>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
