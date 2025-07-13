
import { Badge } from "@/components/ui/badge";
import { StarIcon, MapPin, Car } from "lucide-react";
import { Equipment } from "@/types";
import PriceDisplay from "./PriceDisplay";
import DistanceDisplay from "@/components/DistanceDisplay";
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slugify";

interface EquipmentHeaderProps {
  equipment: Equipment;
}

const EquipmentHeader = ({ equipment }: EquipmentHeaderProps) => {
  // Debug logging
  console.log(`Equipment detail ${equipment.name} subcategory:`, equipment.subcategory);

  // Create tracking data for analytics
  const trackingData = `${equipment.owner.name} - ${equipment.name}`;

  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold">{equipment.name}</h1>
        </div>
        <div className="flex flex-col items-start mb-2 gap-y-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2">
          <Badge className="w-fit">{equipment.category}</Badge>
          {equipment.subcategory && (
            <Badge className="bg-white text-gray-900 border shadow-sm w-fit">
              {equipment.subcategory}
            </Badge>
          )}
          <div className="flex items-center text-sm mt-1 sm:mt-0 sm:ml-2">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span>{equipment.rating}</span>
            <span className="text-muted-foreground ml-1">({equipment.review_count} reviews)</span>
          </div>
        </div>
        <div className="mb-2">
          <Link
            to={`/user-profile/${slugify(equipment.owner.name)}`}
            className="text-lg underline underline-offset-4
              hover:underline hover:text-white/80
              transition-colors"
            data-tracking={trackingData}
            id={`${equipment.owner.name} - View Profile Link - Gear Header`}
          >
            {equipment.owner.name}
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                equipment.location.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline profile-address hover:text-primary"
            >
              {equipment.location.address}
            </a>
          </div>
          <span className="hidden sm:block mx-2">•</span>
          <div className="flex items-center mt-1 sm:mt-0 sm:ml-2">
            <Car className="h-4 w-4 mr-1" />
            <DistanceDisplay equipment={equipment} />
          </div>
        </div>
      </div>
      <PriceDisplay equipment={equipment} equipmentHeader />
    </div>
  );
};

export default EquipmentHeader;
