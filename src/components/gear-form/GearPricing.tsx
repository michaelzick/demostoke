
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GearPricingProps {
  price: string;
  setPrice: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  damageDeposit: string;
  setDamageDeposit: (value: string) => void;
}

const GearPricing = ({
  price,
  setPrice,
  duration,
  setDuration,
  damageDeposit,
  setDamageDeposit
}: GearPricingProps) => {
  return (
    <>
      {/* Price and Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="block text-lg font-medium mb-2">
            Price
          </Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration" className="block text-lg font-medium mb-2">
            Duration
          </Label>
          <Select value={duration} onValueChange={(value) => setDuration(value)}>
            <SelectTrigger id="duration">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Refundable Damage Deposit */}
      <div>
        <Label
          htmlFor="damageDeposit"
          className="block text-lg font-medium mb-2"
        >
          Refundable Damage Deposit
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
