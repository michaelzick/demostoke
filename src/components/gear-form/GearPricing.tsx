
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface GearPricingProps {
  pricePerDay: string;
  setPricePerDay: (value: string) => void;
  pricePerHour: string;
  setPricePerHour: (value: string) => void;
  pricePerWeek: string;
  setPricePerWeek: (value: string) => void;
  enableHourlyPricing: boolean;
  setEnableHourlyPricing: (value: boolean) => void;
  enableWeeklyPricing: boolean;
  setEnableWeeklyPricing: (value: boolean) => void;
  damageDeposit: string;
  setDamageDeposit: (value: string) => void;
}

const GearPricing = ({
  pricePerDay,
  setPricePerDay,
  pricePerHour,
  setPricePerHour,
  pricePerWeek,
  setPricePerWeek,
  enableHourlyPricing,
  setEnableHourlyPricing,
  enableWeeklyPricing,
  setEnableWeeklyPricing,
  damageDeposit,
  setDamageDeposit
}: GearPricingProps) => {
  return (
    <>
      {/* Daily Pricing (Required) */}
      <div>
        <Label htmlFor="pricePerDay" className="block text-lg font-medium mb-2">
          Price per Day <span className="text-red-500">*</span>
        </Label>
        <Input
          id="pricePerDay"
          type="number"
          value={pricePerDay}
          onChange={(e) => setPricePerDay(e.target.value)}
          required
          min="0"
          step="0.01"
        />
      </div>

      {/* Hourly Pricing (Optional) */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="enableHourlyPricing"
            checked={enableHourlyPricing}
            onCheckedChange={setEnableHourlyPricing}
          />
          <Label htmlFor="enableHourlyPricing" className="text-lg font-medium">
            Enable Hourly Pricing
          </Label>
        </div>
        {enableHourlyPricing && (
          <Input
            id="pricePerHour"
            type="number"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
            placeholder="Price per hour"
            min="0"
            step="0.01"
          />
        )}
      </div>

      {/* Weekly Pricing (Optional) */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="enableWeeklyPricing"
            checked={enableWeeklyPricing}
            onCheckedChange={setEnableWeeklyPricing}
          />
          <Label htmlFor="enableWeeklyPricing" className="text-lg font-medium">
            Enable Weekly Pricing
          </Label>
        </div>
        {enableWeeklyPricing && (
          <Input
            id="pricePerWeek"
            type="number"
            value={pricePerWeek}
            onChange={(e) => setPricePerWeek(e.target.value)}
            placeholder="Price per week"
            min="0"
            step="0.01"
          />
        )}
      </div>

      {/* Refundable Damage Deposit */}
      <div>
        <Label htmlFor="damageDeposit" className="block text-lg font-medium mb-2">
          Refundable Damage Deposit <span className="text-red-500">*</span>
        </Label>
        <Input
          id="damageDeposit"
          type="number"
          value={damageDeposit}
          onChange={(e) => setDamageDeposit(e.target.value)}
          required
          min="0"
          step="0.01"
        />
      </div>
    </>
  );
};

export default GearPricing;
