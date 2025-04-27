
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { Equipment } from "@/types";

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
        <Badge 
          className="absolute top-2 right-2" 
          variant="secondary"
        >
          {equipment.category}
        </Badge>
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">${equipment.pricePerDay}/day</p>
            <p className="text-xs text-muted-foreground">{equipment.location.name}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{equipment.distance}mi away</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to={`/equipment/${equipment.id}`}>View Details</Link>
        </Button>
        <Button size="sm">Request Demo</Button>
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
