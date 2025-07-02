
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, MapPin, Edit } from "lucide-react";
import { Equipment } from "@/types";
import PriceDisplay from "./PriceDisplay";
import { useAuth } from "@/helpers";
import { useNavigate } from "react-router-dom";
import DistanceDisplay from "@/components/DistanceDisplay";

interface EquipmentHeaderProps {
  equipment: Equipment;
}

const EquipmentHeader = ({ equipment }: EquipmentHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log(`Equipment detail ${equipment.name} subcategory:`, equipment.subcategory);

  // Check if current user is the owner of this gear
  const isOwner = user?.id === equipment.owner.id;

  const handleUpdate = () => {
    navigate(`/edit-gear/${equipment.id}`);
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold">{equipment.name}</h1>
          {isOwner && (
            <Button
              variant="default"
              onClick={handleUpdate}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Update
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Badge>{equipment.category}</Badge>
          {equipment.subcategory && (
            <Badge className="bg-white text-gray-900 border shadow-sm">
              {equipment.subcategory}
            </Badge>
          )}
          <div className="flex items-center text-sm">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span>{equipment.rating}</span>
            <span className="text-muted-foreground ml-1">({equipment.review_count} reviews)</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{equipment.location.address}</span>
          <span className="mx-2">•</span>
          <DistanceDisplay equipment={equipment} />
        </div>
      </div>
      <PriceDisplay equipment={equipment} equipmentHeader />
    </div>
  );
};

export default EquipmentHeader;
