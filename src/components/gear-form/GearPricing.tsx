
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GearPricingProps {
  pricePerDay: string;
  setPricePerDay: (value: string) => void;
  pricePerHour: string;
  setPricePerHour: (value: string) => void;
  pricePerWeek: string;
  setPricePerWeek: (value: string) => void;
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
        <Label htmlFor="pricePerHour" className="block text-lg font-medium mb-2">
          Price per Hour (Optional)
        </Label>
        <Input
          id="pricePerHour"
          type="number"
          value={pricePerHour}
          onChange={(e) => setPricePerHour(e.target.value)}
          placeholder="Enter hourly price (optional)"
          min="0"
          step="0.01"
        />
      </div>

      {/* Weekly Pricing (Optional) */}
      <div>
        <Label htmlFor="pricePerWeek" className="block text-lg font-medium mb-2">
          Price per Week (Optional)
        </Label>
        <Input
          id="pricePerWeek"
          type="number"
          value={pricePerWeek}
          onChange={(e) => setPricePerWeek(e.target.value)}
          placeholder="Enter weekly price (optional)"
          min="0"
          step="0.01"
        />
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
