
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, StoreIcon, UsersIcon } from "lucide-react";
import { getCategoryDisplayName } from "@/helpers";
import { Equipment } from "@/types";

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  // Determine if this is from a shop or private party based on owner
  const isShop = equipment.owner.shopId;
  const isPrivateParty = equipment.owner.partyId;

  const ownerLinkPath = isShop
    ? `/shop/${equipment.owner.shopId}`
    : isPrivateParty
      ? `/party/${equipment.owner.partyId}`
      : `/owner/${equipment.owner.id}`;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={equipment.image_url}
          alt={equipment.name}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
        <Badge
          className="absolute top-2 right-2"
          variant="secondary"
        >
          {getCategoryDisplayName(equipment.category)}
        </Badge>
        {/* Shop or Private Party indicator */}
        {isShop && (
          <Badge
            className="absolute top-2 left-2 bg-shop text-shop-foreground hover:bg-shop/90"
            variant="default"
          >
            <StoreIcon className="h-3 w-3 mr-1" />
            Shop
          </Badge>
        )}
        {isPrivateParty && (
          <Badge
            className="absolute top-2 left-2 bg-green-600 hover:bg-green-700"
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
            <span>{equipment.distance}mi away</span>
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
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
