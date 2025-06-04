
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface PricingOption {
  id: string;
  price: string;
  duration: string;
}

interface GearPricingProps {
  pricingOptions: PricingOption[];
  setPricingOptions: (options: PricingOption[]) => void;
  damageDeposit: string;
  setDamageDeposit: (value: string) => void;
}

const GearPricing = ({
  pricingOptions,
  setPricingOptions,
  damageDeposit,
  setDamageDeposit
}: GearPricingProps) => {
  const addPricingOption = () => {
    const newOption: PricingOption = {
      id: Date.now().toString(),
      price: "",
      duration: "day"
    };
    setPricingOptions([...pricingOptions, newOption]);
  };

  const removePricingOption = (id: string) => {
    setPricingOptions(pricingOptions.filter(option => option.id !== id));
  };

  const updatePricingOption = (id: string, field: keyof PricingOption, value: string) => {
    setPricingOptions(pricingOptions.map(option =>
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  return (
    <>
      {/* Pricing Options */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="block text-lg font-medium">
            Pricing Options <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPricingOption}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Price
          </Button>
        </div>

        {pricingOptions.length === 0 && (
          <div className="text-gray-500 text-sm mb-4">
            No pricing options added. Click "Add Price" to add your first pricing option.
          </div>
        )}

        <div className="space-y-3">
          {pricingOptions.map((option) => (
            <div key={option.id} className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <Label htmlFor={`price-${option.id}`} className="block text-sm font-medium mb-1">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`price-${option.id}`}
                  type="number"
                  value={option.price}
                  onChange={(e) => updatePricingOption(option.id, 'price', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`duration-${option.id}`} className="block text-sm font-medium mb-1">
                  Duration <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={option.duration}
                    onValueChange={(value) => updatePricingOption(option.id, 'duration', value)}
                  >
                    <SelectTrigger id={`duration-${option.id}`}>
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                    </SelectContent>
                  </Select>
                  {pricingOptions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePricingOption(option.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refundable Damage Deposit */}
      <div>
        <Label
          htmlFor="damageDeposit"
          className="block text-lg font-medium mb-2"
        >
          Refundable Damage Deposit <span className="text-red-500">*</span>
        </Label>
        <Input
          id="damageDeposit"
          type="number"
          value={damageDeposit}
          onChange={(e) => setDamageDeposit(e.target.value)}
          required
        />
      </div>
    </>
  );
};

export default GearPricing;
