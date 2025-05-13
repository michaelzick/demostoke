
import { Link } from "react-router-dom";
import { StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Equipment } from "@/types";

interface SimilarEquipmentProps {
  similarEquipment: Equipment[];
}

const SimilarEquipment = ({ similarEquipment }: SimilarEquipmentProps) => {
  return (
    <div className="w-full">
      <h3 className="font-medium mb-3">Similar Equipment</h3>
      <div className="space-y-4">
        {similarEquipment.map((item) => (
          <Card key={item.id} className="overflow-hidden w-full">
            <div className="flex h-24">
              <div className="w-1/3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="w-2/3 p-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
                  <div className="flex items-center text-xs">
                    <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>{item.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">${item.pricePerDay}/day</span>
                  <Button variant="outline" size="sm" asChild className="text-xs h-auto">
                    <Link to={`/equipment/${item.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimilarEquipment;
