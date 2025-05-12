
import { useState } from "react";
import { AddOn, calculateTotalPrice, getAddOnsForCategory } from "@/lib/addOns";
import { Equipment } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  CircleOff, 
  Grip, 
  Waves, 
  Mountain, 
  MountainSnow, 
  Boot, 
  GitMerge, 
  HandMetal, 
  Rowing, 
  Skateboard, 
  Anchor, 
  CircleDot 
} from "lucide-react";

interface FrequentlyBoughtTogetherProps {
  equipment: Equipment;
}

const iconMap: Record<string, React.ElementType> = {
  'leash': CircleOff,
  'traction-pad': Grip,
  'fin': Waves,
  'snowboard': Mountain,
  'ski': MountainSnow,
  'ski-boot': Boot,
  'pole': GitMerge,
  'glove': HandMetal,
  'paddle': Rowing,
  'skateboard': Skateboard,
  'truck': Anchor,
  'wheel': CircleDot
};

const FrequentlyBoughtTogether = ({ equipment }: FrequentlyBoughtTogetherProps) => {
  const addOns = getAddOnsForCategory(equipment.category);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([...addOns]);
  const totalPrice = calculateTotalPrice(equipment.pricePerDay, selectedAddOns);

  const handleAddOnToggle = (addOn: AddOn, checked: boolean) => {
    if (checked) {
      setSelectedAddOns([...selectedAddOns, addOn]);
    } else {
      setSelectedAddOns(selectedAddOns.filter(item => item.name !== addOn.name));
    }
  };

  // If there are no add-ons for this category, don't render the component
  if (addOns.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Frequently Bought Together</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Main equipment */}
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 overflow-hidden rounded-md mb-2">
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-center font-medium">{equipment.name}</span>
          </div>

          {/* Plus sign between items */}
          {addOns.length > 0 && (
            <div className="text-xl font-bold">+</div>
          )}

          {/* Add-on items */}
          {addOns.map((addOn) => {
            const isSelected = selectedAddOns.some(item => item.name === addOn.name);
            const Icon = iconMap[addOn.icon];
            
            return (
              <div key={addOn.name} className="relative flex flex-col items-center">
                <div className="absolute -top-2 -left-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleAddOnToggle(addOn, checked === true)}
                  />
                </div>
                <div className={`w-16 h-16 overflow-hidden rounded-md mb-2 flex items-center justify-center bg-gray-100 ${!isSelected ? 'opacity-50' : ''}`}>
                  {Icon && <Icon className="w-8 h-8" />}
                </div>
                <span className={`text-xs text-center font-medium ${!isSelected ? 'text-gray-400' : ''}`}>
                  {addOn.name}
                </span>
                <span className="text-xs text-muted-foreground">${addOn.price}</span>
              </div>
            );
          })}
        </div>

        {/* Price calculation */}
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <div className="font-medium">Price Summary:</div>
          <div className="text-sm space-y-1 mt-2">
            <div className="flex justify-between">
              <span>{equipment.name}</span>
              <span>${equipment.pricePerDay}/day</span>
            </div>
            {selectedAddOns.map((addOn) => (
              <div key={addOn.name} className="flex justify-between">
                <span>{addOn.name}</span>
                <span>${addOn.price}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 font-medium flex justify-between">
              <span>Total Price:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add All to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default FrequentlyBoughtTogether;
