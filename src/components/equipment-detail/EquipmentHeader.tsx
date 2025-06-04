
import { Badge } from "@/components/ui/badge";
import { StarIcon, MapPin } from "lucide-react";
import { Equipment } from "@/types";
import PriceDisplay from "./PriceDisplay";

interface EquipmentHeaderProps {
  equipment: Equipment;
}

const EquipmentHeader = ({ equipment }: EquipmentHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">{equipment.name}</h1>
        <div className="flex items-center gap-2 mb-2">
          <Badge>{equipment.category}</Badge>
          <div className="flex items-center text-sm">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span>{equipment.rating}</span>
            <span className="text-muted-foreground ml-1">({equipment.review_count} reviews)</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{equipment.location.zip}</span>
          <span className="mx-2">•</span>
          <span>{equipment.distance} miles away</span>
        </div>
      </div>
      {/* <div className="text-2xl font-bold text-primary">${equipment.price_per_day}</div>
        <div className="text-sm text-muted-foreground">per day</div> */}
      <PriceDisplay equipment={equipment} equipmentHeader />
    </div>
  );
};

export default EquipmentHeader;
