
import React from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Equipment } from "@/types";
import { AddOn } from "@/lib/addOns";

interface AddOnSelectionProps {
  equipment: Equipment;
  addOns: AddOn[];
  selectedAddOns: AddOn[];
  onAddOnToggle: (addOn: AddOn, checked: boolean) => void;
}

const AddOnSelection = ({ equipment, addOns, selectedAddOns, onAddOnToggle }: AddOnSelectionProps) => {
  const formatCurrency = (amount: number): string => {
    return parseFloat(amount.toFixed(2)).toFixed(2);
  };

  if (addOns.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Frequently Paired Together</h3>
      <div className="flex flex-wrap items-start gap-3 mb-4">
        {/* Main equipment */}
        <div className="relative flex flex-col items-center mb-4 w-24">
          <div className="w-16 h-16 overflow-hidden rounded-md mb-2">
            <AspectRatio ratio={1}>
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
          <span className="text-xs text-center font-medium">{equipment.name}</span>
        </div>

        {/* Add-on items */}
        {addOns.map((addOn) => {
          const isSelected = selectedAddOns.some(item => item.name === addOn.name);

          return (
            <div key={addOn.name} className="relative flex flex-col items-center w-24">
              <div className="absolute -left-2 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onAddOnToggle(addOn, checked === true)}
                  className="absolute"
                />
              </div>
              <div className={`w-16 h-16 overflow-hidden rounded-md mb-2 ${!isSelected ? 'opacity-50' : ''}`}>
                <AspectRatio ratio={1}>
                  <img
                    src={addOn.imageUrl}
                    alt={addOn.name}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
              <span className={`text-xs text-center font-medium ${!isSelected ? 'text-gray-400' : ''}`}>
                {addOn.name}
              </span>
              <span className="text-xs text-muted-foreground">${formatCurrency(addOn.pricePerDay)}/day</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AddOnSelection;
