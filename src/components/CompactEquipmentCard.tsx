import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarIcon, Car, Eye, EyeOff, Edit, Trash2, Ruler } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

interface CompactEquipmentCardProps {
  equipment: Equipment;
  showActions?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
  onDelete?: (equipmentId: string) => void;
  onVisibilityToggle?: (equipmentId: string, currentVisibility: boolean) => void;
}

const CompactEquipmentCard = ({
  equipment,
  showActions = false,
  isAdmin = false,
  currentUserId,
  onDelete,
  onVisibilityToggle
}: CompactEquipmentCardProps) => {
  // no-op: toast not required in this compact card
  const images = equipment.images && equipment.images.length > 0 ? equipment.images : [];
  const hasMultipleImages = images.length > 1;
  const hasImages = images.length > 0;

  const isShop = equipment.owner.shopId;
  const ownerLinkPath = isShop
    ? `/shop/${equipment.owner.shopId}`
    : `/user-profile/${slugify(equipment.owner.name)}`;

  const canEditDelete = showActions && (equipment.owner.id === currentUserId || isAdmin);

  // Helper function to format sizes
  const formatSizes = (size: string | undefined) => {
    if (!size || size.trim() === '') return null;

    const sizes = size.split(',').map(s => s.trim()).filter(s => s);
    if (sizes.length === 0) return null;
    if (sizes.length === 1) return `Size: ${sizes[0]}`;
    return `Sizes: ${sizes.join(', ')}`;
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${equipment.name}"? This action cannot be undone.`)) {
      onDelete?.(equipment.id);
    }
  };

  const handleVisibilityToggle = () => {
    onVisibilityToggle?.(equipment.id, equipment.visible_on_map || false);
  };

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
  <CardContent className="p-4 min-h-[14.5em] flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium dark:text-white line-clamp-2">
            {equipment.name}
          </h3>
          <span className="font-medium text-primary">${equipment.price_per_day}/day</span>
        </div>
        {formatSizes(equipment.specifications?.size) && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Ruler className="w-3 h-3 mr-1" />
            <span>{formatSizes(equipment.specifications.size)}</span>
          </div>
        )}

  {/* Wrap the remaining lower content so the bottom area can be aligned across cards */}
  <div className="flex-1 flex flex-col justify-between">
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 mt-2">
                  {equipment.description}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-[500px]">
                {equipment.description}
              </TooltipContent>
            </Tooltip>

            <Link
              to={ownerLinkPath}
              className="underline text-sm text-muted-foreground hover:text-primary mb-2"
            >
              {equipment.owner.name}
            </Link>

            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Car className="h-3 w-3 mr-1" />
              <DistanceDisplay equipment={equipment} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs">
              <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
              <span>
                {equipment.rating} ({equipment.review_count})
              </span>
            </div>
            <Button size="sm" asChild className="text-xs h-8">
              <Link
                to={`/${equipment.category}/${slugify(equipment.owner.name)}/${slugify(equipment.name)}`}
              >
                View Details
              </Link>
            </Button>
          </div>
        </div>
        {canEditDelete && (
          <>
            <Separator className="mt-4" />
            <div className="flex items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVisibilityToggle}
                className="h-8 w-8 p-0"
              >
                {equipment.visible_on_map ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>

              <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                <Link to={`/edit-gear/${equipment.id}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactEquipmentCard;
